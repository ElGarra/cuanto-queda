import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { getWedding } from './wedding'
import { checkRateLimit, resetRateLimit } from './rateLimit'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
        ip:       { label: 'IP',         type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate limit by IP (passed from the login form via hidden field)
        const ip = credentials.ip ?? 'unknown'
        const rl = checkRateLimit(`login:${ip}`)
        if (!rl.allowed) {
          throw new Error(`RATE_LIMITED:${rl.retryAfterMs}`)
        }

        const wedding = await getWedding()
        const admin = await prisma.weddingAdmin.findUnique({
          where: { weddingId_email: { weddingId: wedding.id, email: credentials.email } },
        })

        // Always compare to prevent timing attacks even when user not found
        const hash = admin?.passwordHash ?? '$2b$10$invalidhashfortimingattackprevention'
        const valid = await bcrypt.compare(credentials.password, hash)

        if (!admin || !valid) return null

        // Reset rate limit on successful login
        resetRateLimit(`login:${ip}`)

        return {
          id:        admin.id,
          email:     admin.email,
          name:      admin.name,
          weddingId: wedding.id,
          role:      admin.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; weddingId: string; role: string; name?: string | null }
        token.id        = u.id
        token.weddingId = u.weddingId
        token.role      = u.role
        token.name      = u.name
      }
      return token
    },
    session({ session, token }) {
      session.user.id        = token.id as string
      session.user.weddingId = token.weddingId as string
      session.user.role      = token.role as 'ADMIN' | 'COUPLE'
      session.user.name      = token.name as string
      return session
    },
  },
}
