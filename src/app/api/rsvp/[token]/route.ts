import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getResend, FROM, ADMIN_EMAIL } from '@/lib/resend'
import { getAppUrl } from '@/lib/appUrl'
import { RSVPSubmitSchema } from '@/schemas/rsvp'
import { renderRSVPConfirmation } from '@/emails/RSVPConfirmation'
import { renderAdminNotification } from '@/emails/AdminNotification'

type Params = { params: Promise<{ token: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params

  const guest = await prisma.guest.findUnique({
    where: { token },
    include: { rsvp: true, wedding: true },
  })
  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const deadline = guest.wedding.rsvpDeadline
  return NextResponse.json({
    guest: { firstName: guest.firstName, lastName: guest.lastName, maxCompanions: guest.maxCompanions },
    wedding: {
      partner1Name: guest.wedding.partner1Name,
      partner2Name: guest.wedding.partner2Name,
      weddingDate:  guest.wedding.weddingDate?.toISOString() ?? null,
      venueName:    guest.wedding.venueName,
      rsvpDeadline: deadline?.toISOString() ?? null,
      rsvpEnabled:  guest.wedding.rsvpEnabled,
    },
    rsvp: guest.rsvp ? {
      status:              guest.rsvp.status,
      companions:          guest.rsvp.companions,
      dietaryRestrictions: guest.rsvp.dietaryRestrictions,
      message:             guest.rsvp.message,
    } : null,
    isDeadlinePassed: deadline ? new Date() > deadline : false,
  })
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? undefined

  const guest = await prisma.guest.findUnique({
    where: { token },
    include: { rsvp: true, wedding: true },
  })
  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!guest.wedding.rsvpEnabled)
    return NextResponse.json({ error: 'RSVP is closed' }, { status: 403 })

  const deadline = guest.wedding.rsvpDeadline
  if (deadline && new Date() > deadline)
    return NextResponse.json({ error: 'Deadline passed' }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const parsed = RSVPSubmitSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data', issues: parsed.error.issues }, { status: 400 })

  const { status, companions, dietaryRestrictions, message } = parsed.data

  // Enforce server-side companion limit
  if (companions.length > guest.maxCompanions)
    return NextResponse.json({ error: 'Too many companions' }, { status: 400 })

  const prevStatus = guest.rsvp?.status ?? null

  const rsvp = await prisma.rSVP.upsert({
    where: { guestId: guest.id },
    create: { guestId: guest.id, status, companions, dietaryRestrictions, message, submittedAt: new Date(), ipAddress: ip },
    update: { status, companions, dietaryRestrictions, message, ipAddress: ip },
  })

  await prisma.rSVPHistory.create({
    data: {
      guestId:    guest.id,
      fromStatus: prevStatus ?? undefined,
      toStatus:   status,
      snapshot:   { status, companions, dietaryRestrictions, message },
      ipAddress:  ip,
    },
  })

  const { wedding } = guest
  const appUrl   = getAppUrl()
  const rsvpUrl  = `${appUrl}/i/${token}`
  const adminUrl = `${appUrl}/couple/guests`

  const weddingDateStr = wedding.weddingDate
    ? wedding.weddingDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: wedding.timezone })
    : null

  if (guest.email) {
    await getResend()?.emails.send({
      from: FROM, to: guest.email,
      subject: status === 'CONFIRMED'
        ? `¡Gracias por confirmar! — ${wedding.partner1Name} & ${wedding.partner2Name}`
        : `Recibimos tu respuesta — ${wedding.partner1Name} & ${wedding.partner2Name}`,
      html: renderRSVPConfirmation({ guestFirstName: guest.firstName, status, partner1Name: wedding.partner1Name, partner2Name: wedding.partner2Name, weddingDate: weddingDateStr, rsvpUrl }),
    }).catch(() => null)
  }

  if (ADMIN_EMAIL) {
    await getResend()?.emails.send({
      from: FROM, to: ADMIN_EMAIL,
      subject: `RSVP: ${guest.firstName} ${guest.lastName} — ${status === 'CONFIRMED' ? 'Confirmado' : 'No asiste'}`,
      html: renderAdminNotification({ guestName: `${guest.firstName} ${guest.lastName}`, status, companions: companions as { firstName: string; lastName: string; dietaryRestrictions?: string }[], dietaryRestrictions: dietaryRestrictions ?? null, message: message ?? null, changedAt: new Date().toLocaleString('es-CL', { timeZone: wedding.timezone }), rsvpAdminUrl: adminUrl }),
    }).catch(() => null)
  }

  return NextResponse.json({ rsvp })
}
