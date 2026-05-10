import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { checkRateLimit, resetRateLimit } from './rateLimit'

function getIp(req: Record<string, unknown>): string {
  const headers = req.headers as Record<string, string | string[] | undefined>
  const forwarded = headers['x-forwarded-for']
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded
  return raw?.split(',')[0].trim() ?? (headers['x-real-ip'] as string) ?? 'unknown'
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/couple/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate limit by real IP from request headers (not client-supplied)
        const ip = getIp(req as Record<string, unknown>)
        const rl = checkRateLimit(`login:${ip}`)
        if (!rl.allowed) throw new Error(`RATE_LIMITED:${rl.retryAfterMs}`)

        const admin = await prisma.weddingAdmin.findFirst({
          where: { email: credentials.email },
        })

        // Always run bcrypt to prevent timing attacks
        const hash = admin?.passwordHash ?? '$2b$12$invalidhashfortimingattackprevention00000000000000000'
        const valid = await bcrypt.compare(credentials.password, hash)

        if (!admin || !valid) return null

        resetRateLimit(`login:${ip}`)

        return {
          id:        admin.id,
          email:     admin.email,
          name:      admin.name,
          weddingId: admin.weddingId,
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
