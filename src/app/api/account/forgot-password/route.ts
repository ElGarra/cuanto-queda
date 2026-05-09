import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/tokens'
import { getResend, FROM } from '@/lib/resend'
import { getWedding } from '@/lib/wedding'
import { checkRateLimit } from '@/lib/rateLimit'
import { renderPasswordReset } from '@/emails/PasswordReset'

const EXPIRES_MINUTES = 60

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const rl = checkRateLimit(`forgot:${ip}`)
  if (!rl.allowed)
    return NextResponse.json({ error: 'Demasiados intentos. Intentá más tarde.' }, { status: 429 })

  const body = await req.json()
  const parsed = z.object({ email: z.string().email() }).safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })

  const wedding = await getWedding()
  const admin = await prisma.weddingAdmin.findUnique({
    where: { weddingId_email: { weddingId: wedding.id, email: parsed.data.email } },
  })

  // Always return 200 to avoid email enumeration
  if (!admin) return NextResponse.json({ ok: true })

  // Invalidate previous tokens
  await prisma.passwordResetToken.updateMany({
    where: { adminId: admin.id, usedAt: null },
    data: { usedAt: new Date() },
  })

  const token = generateToken()
  const expiresAt = new Date(Date.now() + EXPIRES_MINUTES * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: { adminId: admin.id, token, expiresAt },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password/${token}`

  await getResend().emails.send({
    html: renderPasswordReset({ name: admin.name, resetUrl, expiresInMinutes: EXPIRES_MINUTES }),
    from: FROM,
    to: admin.email,
    subject: 'Restablecer contraseña',
  }).catch(() => null)

  return NextResponse.json({ ok: true })
}
