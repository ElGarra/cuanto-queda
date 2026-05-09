import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      weddingId: string
      role: 'ADMIN' | 'COUPLE'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    weddingId?: string
    role?: string
    name?: string | null
  }
}
