import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RSVPForm } from './RSVPForm'

type Props = { params: Promise<{ token: string }> }

export default async function RSVPPage({ params }: Props) {
  const { token } = await params

  const guest = await prisma.guest.findUnique({
    where: { token },
    include: { rsvp: true, wedding: true },
  })

  if (!guest) notFound()

  const { wedding } = guest
  const deadline = wedding.rsvpDeadline
  const isDeadlinePassed = deadline ? new Date() > deadline : false
  const isOpen = wedding.rsvpEnabled && !isDeadlinePassed

  const weddingDateStr = wedding.weddingDate
    ? wedding.weddingDate.toLocaleDateString('es-CL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        timeZone: wedding.timezone,
      })
    : null

  return (
    <main className="min-h-svh bg-cream flex flex-col items-center justify-center px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold font-light mb-3">
          Invitación de boda
        </p>
        <h1 className="font-serif italic font-light text-text-base"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
          {wedding.partner1Name} &amp; {wedding.partner2Name}
        </h1>
        {weddingDateStr && (
          <p className="mt-2 text-[0.75rem] tracking-[0.2em] uppercase text-text-muted capitalize">
            {weddingDateStr}
          </p>
        )}
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white shadow-sm p-8 sm:p-10">
        <p className="text-text-muted text-sm mb-1">Hola,</p>
        <p className="font-serif italic text-2xl text-text-base mb-6">
          {guest.firstName} {guest.lastName}
        </p>

        {isOpen ? (
          <RSVPForm
            token={token}
            maxCompanions={guest.maxCompanions}
            initialRsvp={
              guest.rsvp
                ? {
                    status: guest.rsvp.status as 'CONFIRMED' | 'DECLINED',
                    companions: guest.rsvp.companions as { firstName: string; lastName: string; dietaryRestrictions?: string }[],
                    dietaryRestrictions: guest.rsvp.dietaryRestrictions ?? '',
                    message: guest.rsvp.message ?? '',
                  }
                : null
            }
          />
        ) : (
          <div className="text-center py-8">
            {!wedding.rsvpEnabled ? (
              <p className="text-text-muted text-sm">Las confirmaciones están cerradas.</p>
            ) : (
              <p className="text-text-muted text-sm">
                El período de confirmación cerró el{' '}
                {deadline?.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', timeZone: wedding.timezone })}.
              </p>
            )}
            {guest.rsvp && (
              <p className="mt-4 text-sm">
                Tu respuesta registrada:{' '}
                <span className={`font-medium ${guest.rsvp.status === 'CONFIRMED' ? 'text-green-600' : 'text-red-500'}`}>
                  {guest.rsvp.status === 'CONFIRMED' ? 'Confirmado' : 'No asiste'}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
