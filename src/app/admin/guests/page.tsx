import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GuestActions } from './GuestActions'

export default async function GuestsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const guests = await prisma.guest.findMany({
    where: { weddingId: session.user.weddingId },
    include: { rsvp: true },
    orderBy: { createdAt: 'desc' },
  })

  const statusLabel: Record<string, { label: string; className: string }> = {
    CONFIRMED: { label: 'Confirmado', className: 'text-green-600 bg-green-50' },
    DECLINED:  { label: 'No asiste',  className: 'text-red-500 bg-red-50' },
    PENDING:   { label: 'Pendiente',  className: 'text-gold bg-amber-50' },
  }

  return (
    <main className="min-h-svh bg-cream px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard" className="text-xs text-text-muted hover:text-gold mb-2 block">
              ← Dashboard
            </Link>
            <h1 className="font-serif italic text-3xl text-text-base">Invitados</h1>
          </div>
          <GuestActions weddingId={session.user.weddingId} />
        </div>

        <div className="bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/20">
                {['Nombre', 'Email', 'Grupo', '+1 permitidos', 'Estado', 'Link', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[0.65rem] tracking-[0.2em] uppercase text-text-muted font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => {
                const rsvpStatus = guest.rsvp?.status ?? 'PENDING'
                const { label, className } = statusLabel[rsvpStatus]
                const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
                const rsvpUrl = `${appUrl}/i/${guest.token}`

                return (
                  <tr key={guest.id} className="border-b border-gold/10 hover:bg-cream/40 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {guest.firstName} {guest.lastName}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{guest.email ?? '—'}</td>
                    <td className="px-4 py-3 text-text-muted">{guest.group ?? '—'}</td>
                    <td className="px-4 py-3 text-center">{guest.maxCompanions}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${className}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={rsvpUrl} target="_blank" rel="noopener noreferrer"
                        className="text-gold text-xs hover:underline truncate max-w-[120px] block">
                        Abrir link
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {guest.email && (
                        <ResendButton guestId={guest.id} />
                      )}
                    </td>
                  </tr>
                )
              })}
              {guests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-text-muted text-sm italic">
                    No hay invitados aún. Agregá el primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

function ResendButton({ guestId }: { guestId: string }) {
  return (
    <form action={async () => {
      'use server'
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/guests/${guestId}/resend`, {
        method: 'POST',
      })
    }}>
      <button type="submit" className="text-xs text-text-muted hover:text-gold transition-colors">
        Reenviar
      </button>
    </form>
  )
}
