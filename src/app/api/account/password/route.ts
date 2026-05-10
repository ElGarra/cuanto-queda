import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PasswordSchema, BCRYPT_ROUNDS } from '@/lib/password'

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     PasswordSchema,
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const admin = await prisma.weddingAdmin.findUnique({
    where: { email: session.user.email! },
  })
  if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const valid = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash)
  if (!valid) return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })

  const newHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS)
  await prisma.weddingAdmin.update({ where: { id: admin.id }, data: { passwordHash: newHash } })

  return NextResponse.json({ ok: true })
}
