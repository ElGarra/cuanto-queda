import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { renderToStaticMarkup } from 'react-dom/server'
import * as React from 'react'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { resend, FROM } from '@/lib/resend'
import { GuestInvite } from '@/emails/GuestInvite'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const guest = await prisma.guest.findFirst({
    where: { id, weddingId: session.user.weddingId },
    include: { wedding: true },
  })

  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!guest.email) return NextResponse.json({ error: 'Guest has no email' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const rsvpUrl = `${appUrl}/i/${guest.token}`
  const wedding = guest.wedding

  const weddingDateStr = wedding.weddingDate
    ? wedding.weddingDate.toLocaleDateString('es-CL', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: wedding.timezone,
      })
    : null

  const html = renderToStaticMarkup(
    React.createElement(GuestInvite, {
      guestFirstName: guest.firstName,
      partner1Name: wedding.partner1Name,
      partner2Name: wedding.partner2Name,
      weddingDate: weddingDateStr,
      venueName: wedding.venueName,
      rsvpUrl,
    })
  )

  await resend.emails.send({
    from: FROM,
    to: guest.email,
    subject: `Invitación — Boda de ${wedding.partner1Name} & ${wedding.partner2Name}`,
    html,
  })

  await prisma.guest.update({
    where: { id: guest.id },
    data: { inviteSentAt: new Date(), inviteCount: { increment: 1 } },
  })

  return NextResponse.json({ ok: true })
}
