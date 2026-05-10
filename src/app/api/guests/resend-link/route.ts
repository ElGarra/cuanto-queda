import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getResend, FROM } from '@/lib/resend'
import { getAppUrl } from '@/lib/appUrl'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { renderGuestInvite } from '@/emails/GuestInvite'

const Schema = z.object({
  email:     z.string().email(),
  weddingId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`resend-link:${ip}`, { max: 3 }).allowed)
    return NextResponse.json({ ok: true })

  const body = await req.json().catch(() => null)
  const parsed = body ? Schema.safeParse(body) : { success: false as const }
  if (!parsed.success) return NextResponse.json({ ok: true })

  const guest = await prisma.guest.findFirst({
    where: {
      weddingId: parsed.data.weddingId,
      email: { equals: parsed.data.email, mode: 'insensitive' },
    },
    include: { wedding: true },
  })

  if (!guest?.email) return NextResponse.json({ ok: true })

  const { wedding } = guest
  const rsvpUrl      = `${getAppUrl()}/i/${guest.token}`
  const weddingDateStr = wedding.weddingDate
    ? wedding.weddingDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: wedding.timezone })
    : null

  await getResend()?.emails.send({
    from: FROM, to: guest.email,
    subject: `Tu link de invitación — ${wedding.partner1Name} & ${wedding.partner2Name}`,
    html: renderGuestInvite({ guestFirstName: guest.firstName, partner1Name: wedding.partner1Name, partner2Name: wedding.partner2Name, weddingDate: weddingDateStr, venueName: wedding.venueName, rsvpUrl }),
  }).catch(() => null)

  await prisma.guest.update({
    where: { id: guest.id },
    data: { inviteSentAt: new Date(), inviteCount: { increment: 1 } },
  })

  return NextResponse.json({ ok: true })
}
