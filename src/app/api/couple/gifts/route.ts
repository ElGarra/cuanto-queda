import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const GiftSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  paymentUrl:  z.string().url().optional().or(z.literal('')),
  imageUrl:    z.string().url().optional().or(z.literal('')),
  price:       z.number().positive().optional().nullable(),
  currency:    z.string().length(3).default('CLP'),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = GiftSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data', issues: parsed.error.issues }, { status: 400 })

  const lastGift = await prisma.giftItem.findFirst({
    where: { weddingId: session.user.weddingId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })

  const gift = await prisma.giftItem.create({
    data: {
      weddingId:   session.user.weddingId,
      title:       parsed.data.title,
      description: parsed.data.description ?? null,
      paymentUrl:  parsed.data.paymentUrl || null,
      imageUrl:    parsed.data.imageUrl || null,
      price:       parsed.data.price ?? null,
      currency:    parsed.data.currency,
      sortOrder:   (lastGift?.sortOrder ?? 0) + 1,
    },
  })

  return NextResponse.json({ gift }, { status: 201 })
}
