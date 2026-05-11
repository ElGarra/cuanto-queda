import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveWeddingId } from '@/lib/weddingContext'
import { GiftManager } from './GiftManager'

export default async function GiftsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const weddingId = await getEffectiveWeddingId(session)
  if (!weddingId) redirect('/admin/dashboard')

  const [wedding, gifts] = await Promise.all([
    prisma.wedding.findUnique({ where: { id: weddingId }, select: { giftsEnabled: true } }),
    prisma.giftItem.findMany({
      where: { weddingId },
      include: {
        reservations: {
          include: { guest: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  const serialized = gifts.map((g) => ({
    ...g,
    price: g.price ? Number(g.price) : null,
  }))

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Lista</p>
      <h1 className="font-serif italic text-3xl text-text-base mb-6">Regalos</h1>

      {!wedding?.giftsEnabled && (
        <div className="flex items-center justify-between bg-white border border-gold/20 px-4 py-3 mb-6 text-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gold/60 shrink-0">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            Los invitados no ven esta sección — la lista de regalos está desactivada en tu landing.
          </div>
          <a href="/couple/wedding" className="text-gold text-xs tracking-wide hover:opacity-70 shrink-0 ml-4">
            Activar →
          </a>
        </div>
      )}

      <GiftManager gifts={serialized} weddingId={weddingId} />
    </div>
  )
}
