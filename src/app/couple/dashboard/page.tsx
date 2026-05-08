import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function CoupleDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/couple/login')

  const weddingId = session.user.weddingId

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
        {[
          { label: 'Invitados', value: totalGuests, color: 'text-text-base', href: '/couple/guests' },
          { label: 'Confirmados', value: confirmed, color: 'text-green-600', href: '/couple/rsvps' },
          { label: 'No asisten', value: declined, color: 'text-red-500', href: '/couple/rsvps' },
          { label: 'Sin respuesta', value: pending, color: 'text-gold', href: '/couple/rsvps' },
        ].map(({ label, value, color, href }) => (
          <Link key={label} href={href}
            className="bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <p className={`text-4xl font-serif font-light ${color} mb-1`}>{value}</p>
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 shadow-sm">
          <h2 className="font-serif italic text-lg text-text-base mb-4">Lista de regalos</h2>
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
