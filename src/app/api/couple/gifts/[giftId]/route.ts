import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type Params = { params: Promise<{ giftId: string }> }

const GiftUpdateSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  paymentUrl:  z.string().url().optional().or(z.literal('')),
  imageUrl:    z.string().url().optional().or(z.literal('')),
  price:       z.number().positive().optional().nullable(),
  currency:    z.string().length(3).optional(),
})

async function ownedGift(giftId: string, weddingId: string) {
  return prisma.giftItem.findFirst({ where: { id: giftId, weddingId } })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { giftId } = await params
  if (!await ownedGift(giftId, session.user.weddingId))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = GiftUpdateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const { paymentUrl, imageUrl, ...rest } = parsed.data
  const gift = await prisma.giftItem.update({
    where: { id: giftId },
    data: {
      ...rest,
      paymentUrl: paymentUrl || null,
      imageUrl:   imageUrl || null,
    },
  })
  return NextResponse.json({ gift })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { giftId } = await params
  if (!await ownedGift(giftId, session.user.weddingId))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.giftItem.delete({ where: { id: giftId } })
  return NextResponse.json({ ok: true })
}
