import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function CoupleGuestsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/couple/login')

  const guests = await prisma.guest.findMany({
    where: { weddingId: session.user.weddingId },
    include: { rsvp: { select: { status: true } } },
    orderBy: { lastName: 'asc' },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Lista</p>
      <h1 className="font-serif italic text-3xl text-text-base mb-8">Invitados</h1>

      <div className="bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20">
              {['Nombre', 'Email', 'Grupo', '+1', 'Estado', 'Link personal'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[0.65rem] tracking-[0.2em] uppercase text-text-muted font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => {
              const status = guest.rsvp?.status ?? 'PENDING'
              const badge = {
                CONFIRMED: 'text-green-600 bg-green-50',
                DECLINED:  'text-red-500 bg-red-50',
                PENDING:   'text-gold bg-amber-50',
              }[status]
              const statusLabel = { CONFIRMED: 'Confirmado', DECLINED: 'No asiste', PENDING: 'Pendiente' }[status]

              return (
                <tr key={guest.id} className="border-b border-gold/10 hover:bg-cream/40">
                  <td className="px-4 py-3 font-medium">{guest.firstName} {guest.lastName}</td>
                  <td className="px-4 py-3 text-text-muted">{guest.email ?? '—'}</td>
                  <td className="px-4 py-3 text-text-muted">{guest.group ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{guest.maxCompanions}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge}`}>{statusLabel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`${appUrl}/i/${guest.token}`} target="_blank"
                      className="text-gold text-xs hover:underline">
                      Abrir ↗
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
