import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getResend, FROM } from '@/lib/resend'
import { getWedding } from '@/lib/wedding'
import { checkRateLimit } from '@/lib/rateLimit'
import { renderGuestInvite } from '@/emails/GuestInvite'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'

  // Rate limit: max 3 attempts per IP per 15 min
  const rl = checkRateLimit(`resend-link:${ip}`)
  if (!rl.allowed)
    return NextResponse.json({ ok: true }) // Always 200 — no info leakage

  const body = await req.json()
  const parsed = z.object({ email: z.string().email() }).safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ ok: true }) // Same — no validation error exposure

  const wedding = await getWedding()

  // Only send if the email belongs to an actual guest of this wedding
  const guest = await prisma.guest.findFirst({
    where: {
      weddingId: wedding.id,
      email: { equals: parsed.data.email, mode: 'insensitive' },
    },
  })

  // Always return same response whether found or not (prevent enumeration)
  if (!guest || !guest.email) return NextResponse.json({ ok: true })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const rsvpUrl = `${appUrl}/i/${guest.token}`

  const weddingDateStr = wedding.weddingDate
    ? wedding.weddingDate.toLocaleDateString('es-CL', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: wedding.timezone,
      })
    : null

  await getResend().emails.send({
    from: FROM,
    to: guest.email,
    subject: `Tu link de invitación — ${wedding.partner1Name} & ${wedding.partner2Name}`,
    html: renderGuestInvite({
      guestFirstName: guest.firstName,
      partner1Name: wedding.partner1Name,
      partner2Name: wedding.partner2Name,
      weddingDate: weddingDateStr,
      venueName: wedding.venueName,
      rsvpUrl,
    }),
  }).catch(() => null)

  await prisma.guest.update({
    where: { id: guest.id },
    data: { inviteSentAt: new Date(), inviteCount: { increment: 1 } },
  })

  return NextResponse.json({ ok: true })
}
