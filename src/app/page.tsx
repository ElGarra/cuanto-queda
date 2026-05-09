import { getWedding } from '@/lib/wedding'
import { prisma } from '@/lib/prisma'
import { Hero } from '@/components/wedding/Hero'
import { Countdown } from '@/components/wedding/Countdown'
import { EventDetails } from '@/components/wedding/EventDetails'
import { RSVPSection } from '@/components/wedding/RSVPSection'
import { GiftSection } from '@/components/wedding/GiftSection'
import { Footer } from '@/components/wedding/Footer'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const wedding = await getWedding()

  const scheduleItems = Array.isArray(wedding.scheduleItems)
    ? (wedding.scheduleItems as { time: string; label: string }[])
    : []

  const gifts = await prisma.giftItem.findMany({
    where: { weddingId: wedding.id },
    include: { reservations: { select: { id: true } } },
    orderBy: { sortOrder: 'asc' },
  })

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
      <RSVPSection />
      <GiftSection gifts={giftsForPublic} />
      <Footer
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={wedding.weddingDate}
      />
    </main>
  )
}
