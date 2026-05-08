import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type Params = { params: Promise<{ giftId: string }> }

const Schema = z.object({
  token:   z.string().min(1),
  message: z.string().max(500).optional(),
})

export async function POST(req: NextRequest, { params }: Params) {
  const { giftId } = await params
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const { token, message } = parsed.data

  const guest = await prisma.guest.findUnique({ where: { token } })
  if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })

  const gift = await prisma.giftItem.findUnique({ where: { id: giftId } })
  if (!gift) return NextResponse.json({ error: 'Gift not found' }, { status: 404 })

  // Ensure gift belongs to guest's wedding
  if (gift.weddingId !== guest.weddingId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const reservation = await prisma.giftReservation.upsert({
    where: { giftId_guestId: { giftId, guestId: guest.id } },
    create: { giftId, guestId: guest.id, message: message ?? null },
    update: { message: message ?? null },
  })

  return NextResponse.json({ reservation })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { giftId } = await params
  const { token } = await req.json()

  const guest = await prisma.guest.findUnique({ where: { token } })
  if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })

  await prisma.giftReservation.deleteMany({
    where: { giftId, guestId: guest.id },
  })

  return NextResponse.json({ ok: true })
}
