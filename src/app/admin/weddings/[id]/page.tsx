import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FeatureToggles } from '@/app/admin/dashboard/FeatureToggles'

type Props = { params: Promise<{ id: string }> }

export default async function ManageWeddingPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/couple/login')

  const { id } = await params
  const wedding = await prisma.wedding.findUnique({
    where: { id },
    include: {
      admins: { select: { id: true, name: true, email: true, role: true } },
      _count: { select: { guests: true, gifts: true } },
    },
  })
  if (!wedding) notFound()

  const dateStr = wedding.weddingDate
    ? wedding.weddingDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: wedding.timezone })
    : null

  const coupleAdmins = wedding.admins.filter(a => a.role === 'COUPLE')

  return (
    <main className="min-h-svh bg-cream px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <Link href="/admin/dashboard"
              className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted hover:text-gold transition-colors">
              ← Todas las bodas
            </Link>
            <h1 className="font-serif italic text-3xl text-text-base mt-2">
              {wedding.partner1Name} &amp; {wedding.partner2Name}
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {dateStr ?? 'Fecha por confirmar'}
              {wedding.venueName && ` · ${wedding.venueName}`}
            </p>
          </div>
          <Link href={`/${wedding.slug}`} target="_blank"
            className="text-sm border border-gold/30 text-text-muted px-4 py-2 hover:border-gold hover:text-gold transition-colors whitespace-nowrap">
            Ver landing ↗
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Invitados',  value: wedding._count.guests },
            { label: 'Regalos',    value: wedding._count.gifts },
            { label: 'Slug',       value: `/${wedding.slug}`, small: true },
          ].map(({ label, value, small }) => (
            <div key={label} className="bg-white p-4 text-center shadow-sm">
              <p className={`font-serif font-light text-text-base ${small ? 'text-sm mt-1' : 'text-3xl'}`}>{value}</p>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-white shadow-sm p-6">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-4">Funcionalidades</p>
          <FeatureToggles
            weddingId={wedding.id}
            rsvpEnabled={wedding.rsvpEnabled}
            giftsEnabled={wedding.giftsEnabled}
          />
        </div>

        {/* Usuarios novios */}
        <div className="bg-white shadow-sm p-6">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-4">Cuentas de los novios</p>
          {coupleAdmins.length === 0 ? (
            <p className="text-text-muted text-sm">Sin cuentas asociadas.</p>
          ) : (
            <ul className="space-y-2">
              {coupleAdmins.map(a => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-text-base">{a.name ?? '—'}</span>
                  <span className="text-text-muted">{a.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white shadow-sm p-6">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-4">Accesos rápidos</p>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/couple/guests',  label: 'Invitados' },
              { href: '/couple/gifts',   label: 'Regalos' },
              { href: '/couple/wedding', label: 'Info de la boda' },
              { href: '/admin/users',    label: 'Usuarios' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm border border-gold/30 text-text-muted px-4 py-2 hover:border-gold hover:text-gold transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
