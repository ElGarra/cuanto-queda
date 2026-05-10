import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import AccountForm from './AccountForm'

export default async function AdminAccountPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/couple/login')

  return (
    <main className="min-h-svh bg-cream px-4 py-12">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <Link href="/admin/dashboard"
            className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted hover:text-gold transition-colors">
            ← Volver al panel
          </Link>
          <h1 className="font-serif italic text-3xl text-text-base mt-2">Mi cuenta</h1>
        </div>
        <AccountForm name={session.user.name ?? ''} email={session.user.email ?? ''} />
      </div>
    </main>
  )
}
