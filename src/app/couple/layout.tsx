import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { SessionProvider } from '@/app/admin/SessionProvider'

const nav = [
  { href: '/couple/dashboard', label: 'Inicio' },
  { href: '/couple/wedding',   label: 'Nuestra boda' },
  { href: '/couple/guests',    label: 'Invitados' },
  { href: '/couple/rsvps',     label: 'RSVPs' },
  { href: '/couple/gifts',     label: 'Regalos' },
]

export default async function CoupleLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/couple/login')

  return (
    <SessionProvider>
      <div className="min-h-svh flex flex-col bg-cream">
        {/* Top nav */}
        <header className="bg-white border-b border-gold/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-serif italic text-gold text-lg">
              {session.user.name ?? 'Panel'}
            </span>
            <nav className="hidden sm:flex gap-4">
              {nav.map(({ href, label }) => (
                <Link key={href} href={href}
                  className="text-xs tracking-[0.15em] uppercase text-text-muted hover:text-gold transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-text-muted hover:text-gold">Ver landing</Link>
            {session.user.role === 'ADMIN' && (
              <Link href="/admin/dashboard"
                className="text-xs bg-text-base text-white px-3 py-1.5 hover:opacity-80">
                Admin
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 px-4 py-10 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
