import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { PasswordSchema, BCRYPT_ROUNDS } from '@/lib/password'

const Schema = z.object({ token: z.string().min(1), newPassword: PasswordSchema })

export async function POST(req: NextRequest) {
  // Rate limit reset attempts
  const ip = getClientIp(req)
  if (!checkRateLimit(`reset:${ip}`, { max: 10, windowMs: 60_000 }).allowed)
    return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const parsed = Schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
    include: { admin: true },
  })
  if (!record || record.usedAt || record.expiresAt < new Date())
    return NextResponse.json({ error: 'Link inválido o expirado' }, { status: 400 })

  const newHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS)

  await prisma.$transaction([
    prisma.weddingAdmin.update({ where: { id: record.adminId }, data: { passwordHash: newHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ])

  return NextResponse.json({ ok: true })
}
