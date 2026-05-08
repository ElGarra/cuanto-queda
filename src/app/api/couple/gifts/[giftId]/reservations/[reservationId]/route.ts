import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ giftId: string; reservationId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { giftId, reservationId } = await params

  // Ensure gift belongs to this wedding
  const gift = await prisma.giftItem.findFirst({ where: { id: giftId, weddingId: session.user.weddingId } })
  if (!gift) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { isConfirmed } = await req.json()
  const reservation = await prisma.giftReservation.update({
    where: { id: reservationId },
    data: { isConfirmed: Boolean(isConfirmed) },
  })
  return NextResponse.json({ reservation })
}
