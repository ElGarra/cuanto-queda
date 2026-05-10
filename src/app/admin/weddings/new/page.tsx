import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { NewWeddingForm } from './NewWeddingForm'

export default async function NewWeddingPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/couple/login')

  return (
    <main className="min-h-svh bg-cream px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Nueva boda</p>
          <h1 className="font-serif italic text-3xl text-text-base">Crear boda</h1>
          <p className="text-text-muted text-sm mt-1">
            Se generará un link público automáticamente a partir de los nombres.
          </p>
        </div>
        <NewWeddingForm />
      </div>
    </main>
  )
}
