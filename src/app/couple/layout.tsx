import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionProvider } from '@/app/admin/SessionProvider'
import { WEDDING_CTX_COOKIE } from '@/lib/weddingContext'
import { AdminBanner } from './AdminBanner'
import { LogoutButton } from '@/components/LogoutButton'

const BASE_NAV = [
  { href: '/couple/dashboard', label: 'Inicio',       feature: null },
  { href: '/couple/wedding',   label: 'Nuestra boda', feature: null },
  { href: '/couple/guests',    label: 'Invitados',    feature: null },
  { href: '/couple/gifts',     label: 'Regalos',      feature: 'gifts' },
  { href: '/couple/account',   label: 'Mi cuenta',    feature: null },
]

export default async function CoupleLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) return <SessionProvider>{children}</SessionProvider>

  const cookieStore = await cookies()
  const ctxWeddingId = session.user.role === 'ADMIN'
    ? cookieStore.get(WEDDING_CTX_COOKIE)?.value ?? null
    : null

  // Admin without context switch has no wedding to manage here
  if (session.user.role === 'ADMIN' && !ctxWeddingId) redirect('/admin/dashboard')

  const effectiveWeddingId = ctxWeddingId ?? session.user.weddingId ?? ''

  const wedding = await prisma.wedding.findUnique({
    where: { id: effectiveWeddingId },
    select: { giftsEnabled: true, rsvpEnabled: true, partner1Name: true, partner2Name: true },
  })

  const features = { gifts: wedding?.giftsEnabled ?? true, rsvp: wedding?.rsvpEnabled ?? true }
  const nav = BASE_NAV.map(({ href, label, feature }) => ({
    href,
    label,
    locked: feature ? !features[feature as keyof typeof features] : false,
  }))

  return (
    <SessionProvider>
      <div className="min-h-svh flex flex-col bg-cream">
        {ctxWeddingId && wedding && (
          <AdminBanner
            partner1={wedding.partner1Name}
            partner2={wedding.partner2Name}
          />
        )}
        <header className="bg-white border-b border-gold/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-serif italic text-gold text-lg">
              {ctxWeddingId
                ? `${wedding?.partner1Name} & ${wedding?.partner2Name}`
                : (session.user.name ?? 'Panel')}
            </span>
            <nav className="hidden sm:flex gap-4">
              {nav.map(({ href, label, locked }) => (
                <Link key={href} href={href}
                  className={`text-xs tracking-[0.15em] uppercase transition-colors flex items-center gap-1 ${
                    locked
                      ? 'text-text-muted/40 hover:text-text-muted/70'
                      : 'text-text-muted hover:text-gold'
                  }`}>
                  {label}
                  {locked && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {!ctxWeddingId && (
              <Link href="/" className="text-xs text-text-muted hover:text-gold">Ver landing</Link>
            )}
            {session.user.role === 'ADMIN' && !ctxWeddingId && (
              <Link href="/admin/dashboard"
                className="text-xs bg-text-base text-white px-3 py-1.5 hover:opacity-80">
                Admin
              </Link>
            )}
            <LogoutButton className="text-xs tracking-[0.15em] uppercase text-text-muted hover:text-gold transition-colors" />
          </div>
        </header>
        <main className="flex-1 px-4 py-10 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
