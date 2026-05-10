import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/tokens'
import { getResend, FROM } from '@/lib/resend'
import { getAppUrl } from '@/lib/appUrl'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { renderPasswordReset } from '@/emails/PasswordReset'

const EXPIRES_MINUTES = 60

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`forgot:${ip}`, { max: 3 }).allowed)
    return NextResponse.json({ ok: true })

  const body = await req.json().catch(() => null)
  const parsed = body ? z.object({ email: z.string().email() }).safeParse(body) : { success: false as const }
  if (!parsed.success) return NextResponse.json({ ok: true })

  // Find admin by email across all weddings
  const admin = await prisma.weddingAdmin.findFirst({
    where: { email: parsed.data.email },
  })

  const token     = generateToken()
  const expiresAt = new Date(Date.now() + EXPIRES_MINUTES * 60_000)

  if (admin) {
    await prisma.passwordResetToken.updateMany({
      where: { adminId: admin.id, usedAt: null },
      data:  { usedAt: new Date() },
    })
    await prisma.passwordResetToken.create({ data: { adminId: admin.id, token, expiresAt } })

    const resetUrl = `${getAppUrl()}/reset-password/${token}`
    await getResend()?.emails.send({
      from: FROM, to: admin.email,
      subject: 'Restablecer contraseña',
      html: renderPasswordReset({ name: admin.name, resetUrl, expiresInMinutes: EXPIRES_MINUTES }),
    }).catch(() => null)
  }

  return NextResponse.json({ ok: true })
}
