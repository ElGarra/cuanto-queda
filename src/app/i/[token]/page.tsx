import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { GuestTabs } from './GuestTabs'

type Props = { params: Promise<{ token: string }> }

export default async function RSVPPage({ params }: Props) {
  const { token } = await params

  const guest = await prisma.guest.findUnique({
    where: { token },
    include: {
      rsvp: true,
      wedding: true,
      giftReservations: { select: { giftId: true, message: true } },
    },
  })

  if (!guest) notFound()

  const { wedding } = guest
  const deadline = wedding.rsvpDeadline
  const isDeadlinePassed = deadline ? new Date() > deadline : false
  const isOpen = wedding.rsvpEnabled && !isDeadlinePassed

  const gifts = wedding.giftsEnabled
    ? await prisma.giftItem.findMany({
        where: { weddingId: wedding.id },
        include: { reservations: { select: { guestId: true } } },
        orderBy: { sortOrder: 'asc' },
      })
    : []

  const weddingDateStr = wedding.weddingDate
    ? wedding.weddingDate.toLocaleDateString('es-CL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        timeZone: wedding.timezone,
      })
    : null

  const myReservationIds = new Set(guest.giftReservations.map((r) => r.giftId))
  const myReservationMessages = Object.fromEntries(
    guest.giftReservations.map((r) => [r.giftId, r.message ?? ''])
  )

  return (
    <main className="min-h-svh bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-gold/20 px-4 py-8 text-center">
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold font-light mb-2">
          Invitación de boda
        </p>
        <h1 className="font-serif italic font-light text-text-base"
          style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>
          {wedding.partner1Name} &amp; {wedding.partner2Name}
        </h1>
        {weddingDateStr && (
          <p className="mt-1 text-[0.75rem] tracking-[0.2em] uppercase text-text-muted capitalize">
            {weddingDateStr}
          </p>
        )}
        <p className="mt-3 text-sm text-text-muted">
          Hola, <span className="font-medium text-text-base">{guest.firstName} {guest.lastName}</span>
        </p>
      </div>

      {/* Tabs */}
      <GuestTabs
        token={token}
        features={{ rsvp: wedding.rsvpEnabled, gifts: wedding.giftsEnabled }}
        guest={{
          maxCompanions: guest.maxCompanions,
        }}
        rsvp={guest.rsvp ? {
          status: guest.rsvp.status as 'CONFIRMED' | 'DECLINED',
          companions: guest.rsvp.companions as { firstName: string; lastName: string; dietaryRestrictions?: string }[],
          dietaryRestrictions: guest.rsvp.dietaryRestrictions ?? '',
          message: guest.rsvp.message ?? '',
        } : null}
        isOpen={isOpen}
        deadlineStr={deadline && !isOpen
          ? deadline.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', timeZone: wedding.timezone })
          : null}
        gifts={gifts.map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description,
          paymentUrl: g.paymentUrl,
          imageUrl: g.imageUrl,
          price: g.price ? Number(g.price) : null,
          currency: g.currency,
          totalReservations: g.reservations.length,
          reservedByMe: myReservationIds.has(g.id),
          myMessage: myReservationMessages[g.id] ?? '',
        }))}
      />
    </main>
  )
}
