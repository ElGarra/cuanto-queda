import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WeddingForm } from './WeddingForm'

export default async function WeddingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/couple/login')

  const wedding = await prisma.wedding.findUnique({ where: { id: session.user.weddingId } })
  if (!wedding) redirect('/couple/dashboard')

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Configuración</p>
      <h1 className="font-serif italic text-3xl text-text-base mb-8">Nuestra boda</h1>
      <WeddingForm wedding={wedding} />
    </div>
  )
}
