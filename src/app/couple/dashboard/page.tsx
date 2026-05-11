import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveWeddingId } from '@/lib/weddingContext'

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="inline-block ml-1 opacity-50" aria-hidden="true">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  )
}

export default async function CoupleDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const weddingId = await getEffectiveWeddingId(session)
  if (!weddingId) redirect('/admin/dashboard')

  const [wedding, confirmed, declined, pending, totalGuests, totalGifts, reservedGifts] =
    await Promise.all([
      prisma.wedding.findUnique({ where: { id: weddingId } }),
      prisma.rSVP.count({ where: { guest: { weddingId }, status: 'CONFIRMED' } }),
      prisma.rSVP.count({ where: { guest: { weddingId }, status: 'DECLINED' } }),
      prisma.guest.count({ where: { weddingId, OR: [{ rsvp: null }, { rsvp: { status: 'PENDING' } }] } }),
      prisma.guest.count({ where: { weddingId } }),
      prisma.giftItem.count({ where: { weddingId } }),
      prisma.giftReservation.count({ where: { gift: { weddingId } } }),
    ])

  const rsvpEnabled  = wedding?.rsvpEnabled  ?? true
  const giftsEnabled = wedding?.giftsEnabled ?? true

  const daysLeft = wedding?.weddingDate
    ? Math.max(0, Math.ceil((wedding.weddingDate.getTime() - Date.now()) / 86400000))
    : null

  return (
    <div>
      <div className="mb-8">
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Panel de novios</p>
        <h1 className="font-serif italic text-3xl text-text-base">
          Hola, {session.user.name} 👋
        </h1>
        {daysLeft !== null && (
          <p className="mt-2 text-text-muted text-sm">
            {daysLeft > 0 ? `Faltan ${daysLeft} días para el gran día` : '¡Hoy es el gran día!'}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Link href="/couple/guests"
          className="bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <p className="text-4xl font-serif font-light text-text-base mb-1">{totalGuests}</p>
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted">Invitados</p>
        </Link>

        {[
          { label: 'Confirmados',  value: confirmed, color: 'text-green-600' },
          { label: 'No asisten',   value: declined,  color: 'text-red-500' },
          { label: 'Sin respuesta', value: pending,  color: 'text-gold' },
        ].map(({ label, value, color }) => (
          <Link key={label} href="/couple/guests"
            className={`bg-white p-6 text-center shadow-sm transition-shadow relative ${
              rsvpEnabled ? 'hover:shadow-md' : 'opacity-60'
            }`}>
            <p className={`text-4xl font-serif font-light mb-1 ${rsvpEnabled ? color : 'text-text-muted'}`}>
              {value}
            </p>
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted">
              {label}
              {!rsvpEnabled && <LockIcon />}
            </p>
          </Link>
        ))}
      </div>

      {!rsvpEnabled && (
        <p className="text-xs text-text-muted/60 -mt-5 mb-6 text-right">
          RSVP desactivado —{' '}
          <Link href="/couple/wedding" className="hover:text-gold transition-colors underline">
            activar
          </Link>
        </p>
      )}

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className={`bg-white p-6 shadow-sm ${!giftsEnabled ? 'opacity-70' : ''}`}>
          <h2 className="font-serif italic text-lg text-text-base mb-1 flex items-center gap-1.5">
            Lista de regalos
            {!giftsEnabled && <LockIcon />}
          </h2>
          {!giftsEnabled && (
            <p className="text-[0.65rem] tracking-[0.1em] uppercase text-gold/70 mb-3">
              Desactivado en landing ·{' '}
              <Link href="/couple/wedding" className="underline hover:text-gold">activar</Link>
            </p>
          )}
          <p className="text-text-muted text-sm mb-4">
            {totalGifts} regalos · {reservedGifts} reservados
          </p>
          <Link href="/couple/gifts"
            className="inline-block text-sm bg-gold text-white px-5 py-2 hover:opacity-90 transition-opacity">
            Gestionar regalos
          </Link>
        </div>

        <div className="bg-white p-6 shadow-sm">
          <h2 className="font-serif italic text-lg text-text-base mb-4">Info de la boda</h2>
          <p className="text-text-muted text-sm mb-4">
            {wedding?.venueName ?? 'Venue por confirmar'} ·{' '}
            {wedding?.weddingDate
              ? wedding.weddingDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: wedding.timezone })
              : 'Fecha por confirmar'}
          </p>
          <Link href="/couple/wedding"
            className="inline-block text-sm border border-gold/40 text-gold px-5 py-2 hover:bg-gold hover:text-white transition-colors">
            Editar info
          </Link>
        </div>
      </div>
    </div>
  )
}
