import { getWedding } from '@/lib/wedding'
import { Hero } from '@/components/wedding/Hero'
import { Countdown } from '@/components/wedding/Countdown'
import { EventDetails } from '@/components/wedding/EventDetails'
import { Footer } from '@/components/wedding/Footer'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const wedding = await getWedding()

  const scheduleItems = Array.isArray(wedding.scheduleItems)
    ? (wedding.scheduleItems as { time: string; label: string }[])
    : []

  return (
    <main>
      <Hero
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={wedding.weddingDate}
      />
      <Countdown
        weddingDate={wedding.weddingDate?.toISOString() ?? null}
      />
      <EventDetails
        weddingDate={wedding.weddingDate}
        venueName={wedding.venueName}
        venueAddress={wedding.venueAddress}
        venueMapsUrl={wedding.venueMapsUrl}
        scheduleItems={scheduleItems}
        dressCode={wedding.dressCode}
      />
      <Footer
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={wedding.weddingDate}
      />
    </main>
  )
}
