import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Prevent self-deletion
  if (id === session.user.id)
    return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })

  await prisma.weddingAdmin.deleteMany({
    where: { id, weddingId: session.user.weddingId },
  })

  return NextResponse.json({ ok: true })
}
