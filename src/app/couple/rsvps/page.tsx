import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const statusConfig = {
  CONFIRMED: { label: 'Confirmado', className: 'text-green-600 bg-green-50' },
  DECLINED:  { label: 'No asiste',  className: 'text-red-500 bg-red-50' },
  PENDING:   { label: 'Pendiente',  className: 'text-gold bg-amber-50' },
}

export default async function RSVPsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/couple/login')

  const guests = await prisma.guest.findMany({
    where: { weddingId: session.user.weddingId },
    include: { rsvp: true },
    orderBy: [{ rsvp: { status: 'asc' } }, { lastName: 'asc' }],
  })

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Confirmaciones</p>
      <h1 className="font-serif italic text-3xl text-text-base mb-8">RSVPs</h1>

      <div className="bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20">
              {['Invitado', 'Estado', 'Acompañantes', 'Restricciones', 'Mensaje'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[0.65rem] tracking-[0.2em] uppercase text-text-muted font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => {
              const status = guest.rsvp?.status ?? 'PENDING'
              const { label, className } = statusConfig[status]
              const companions = (guest.rsvp?.companions ?? []) as { firstName: string; lastName: string }[]

              return (
                <tr key={guest.id} className="border-b border-gold/10 hover:bg-cream/40">
                  <td className="px-4 py-3 font-medium">
                    {guest.firstName} {guest.lastName}
                    {guest.email && <span className="block text-xs text-text-muted">{guest.email}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${className}`}>{label}</span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {companions.length > 0
                      ? companions.map((c) => `${c.firstName} ${c.lastName}`).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {guest.rsvp?.dietaryRestrictions ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted italic">
                    {guest.rsvp?.message
                      ? <span className="text-text-base">"{guest.rsvp.message}"</span>
                      : '—'}
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
