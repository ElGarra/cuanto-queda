import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ giftId: string }> }

const PostSchema   = z.object({ token: z.string().min(1), message: z.string().max(500).optional() })
const DeleteSchema = z.object({ token: z.string().min(1) })

async function resolveGuestAndGift(token: string, giftId: string) {
  const [guest, gift] = await Promise.all([
    prisma.guest.findUnique({ where: { token } }),
    prisma.giftItem.findUnique({ where: { id: giftId } }),
  ])
  if (!guest || !gift || gift.weddingId !== guest.weddingId) return null
  return { guest, gift }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { giftId } = await params

  const body = await req.json().catch(() => null)
  const parsed = body ? PostSchema.safeParse(body) : { success: false as const }
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const ctx = await resolveGuestAndGift(parsed.data.token, giftId)
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const reservation = await prisma.giftReservation.upsert({
    where:  { giftId_guestId: { giftId, guestId: ctx.guest.id } },
    create: { giftId, guestId: ctx.guest.id, message: parsed.data.message ?? null },
    update: { message: parsed.data.message ?? null },
  })
  return NextResponse.json({ reservation })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { giftId } = await params

  const body = await req.json().catch(() => null)
  const parsed = body ? DeleteSchema.safeParse(body) : { success: false as const }
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const ctx = await resolveGuestAndGift(parsed.data.token, giftId)
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.giftReservation.deleteMany({ where: { giftId, guestId: ctx.guest.id } })
  return NextResponse.json({ ok: true })
}
