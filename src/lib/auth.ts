import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { getWedding } from './wedding'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const wedding = await getWedding()
        const admin = await prisma.weddingAdmin.findUnique({
          where: { weddingId_email: { weddingId: wedding.id, email: credentials.email } },
        })
        if (!admin) return null

        const valid = await bcrypt.compare(credentials.password, admin.passwordHash)
        if (!valid) return null

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          weddingId: wedding.id,
          role: admin.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { weddingId: string; role: string; name?: string | null }
        token.weddingId = u.weddingId
        token.role = u.role
        token.name = u.name
      }
      return token
    },
    session({ session, token }) {
      session.user.weddingId = token.weddingId as string
      session.user.role = token.role as string
      session.user.name = token.name as string
      return session
    },
  },
}
