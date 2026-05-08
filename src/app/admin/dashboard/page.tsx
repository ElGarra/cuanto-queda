import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const [confirmed, declined, pending, total] = await Promise.all([
    prisma.rSVP.count({ where: { guest: { weddingId: session.user.weddingId }, status: 'CONFIRMED' } }),
    prisma.rSVP.count({ where: { guest: { weddingId: session.user.weddingId }, status: 'DECLINED' } }),
    prisma.guest.count({
      where: {
        weddingId: session.user.weddingId,
        OR: [{ rsvp: null }, { rsvp: { status: 'PENDING' } }],
      },
    }),
    prisma.guest.count({ where: { weddingId: session.user.weddingId } }),
  ])

  const stats = [
    { label: 'Total invitados', value: total, color: 'text-text-base' },
    { label: 'Confirmados', value: confirmed, color: 'text-green-600' },
    { label: 'No asisten', value: declined, color: 'text-red-500' },
    { label: 'Sin respuesta', value: pending, color: 'text-gold' },
  ]

  return (
    <main className="min-h-svh bg-cream px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Panel de administración</p>
            <h1 className="font-serif italic text-3xl text-text-base">Dashboard</h1>
          </div>
          <Link href="/admin/guests"
            className="text-sm border border-gold/40 text-gold px-4 py-2 hover:bg-gold hover:text-white transition-colors">
            Ver invitados →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="bg-white p-6 text-center shadow-sm">
              <p className={`text-4xl font-serif font-light ${color} mb-1`}>{value}</p>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 shadow-sm">
          <h2 className="font-serif italic text-xl text-text-base mb-4">Accesos rápidos</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/guests"
              className="text-sm bg-gold text-white px-5 py-2.5 hover:opacity-90 transition-opacity">
              Gestionar invitados
            </Link>
            <Link href="/"
              className="text-sm border border-gold/40 text-gold px-5 py-2.5 hover:bg-gold hover:text-white transition-colors">
              Ver landing
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
