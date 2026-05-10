import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getWeddingBySlug } from '@/lib/wedding'
import { Hero } from '@/components/wedding/Hero'
import { Countdown } from '@/components/wedding/Countdown'
import { EventDetails } from '@/components/wedding/EventDetails'
import { RSVPSection } from '@/components/wedding/RSVPSection'
import { GiftSection } from '@/components/wedding/GiftSection'
import { Footer } from '@/components/wedding/Footer'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export default async function WeddingLanding({ params }: Props) {
  const { slug } = await params
  const wedding = await getWeddingBySlug(slug)
  if (!wedding) notFound()

  const scheduleItems = Array.isArray(wedding.scheduleItems)
    ? (wedding.scheduleItems as { time: string; label: string }[])
    : []

  const gifts = wedding.giftsEnabled
    ? await prisma.giftItem.findMany({
        where: { weddingId: wedding.id },
        include: { reservations: { select: { id: true } } },
        orderBy: { sortOrder: 'asc' },
      })
    : []

  const giftsForPublic = gifts.map((g) => ({
    id:                g.id,
    title:             g.title,
    description:       g.description,
    imageUrl:          g.imageUrl,
    price:             g.price ? Number(g.price) : null,
    currency:          g.currency,
    totalReservations: g.reservations.length,
  }))

  return (
    <main>
      <Hero
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={wedding.weddingDate}
      />
      <Countdown weddingDate={wedding.weddingDate?.toISOString() ?? null} />
      <EventDetails
        weddingDate={wedding.weddingDate}
        venueName={wedding.venueName}
        venueAddress={wedding.venueAddress}
        venueMapsUrl={wedding.venueMapsUrl}
        scheduleItems={scheduleItems}
        dressCode={wedding.dressCode}
      />
      {(wedding.rsvpEnabled || wedding.giftsEnabled) && (
        <RSVPSection
          weddingId={wedding.id}
          rsvpEnabled={wedding.rsvpEnabled}
          giftsEnabled={wedding.giftsEnabled}
        />
      )}
      {wedding.giftsEnabled && <GiftSection gifts={giftsForPublic} />}
      <Footer
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={wedding.weddingDate}
      />
    </main>
  )
}
