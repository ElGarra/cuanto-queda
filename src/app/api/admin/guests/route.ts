import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { generateToken } from '@/lib/tokens'
import { GuestCreateSchema } from '@/schemas/guest'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const guests = await prisma.guest.findMany({
    where: { weddingId: session.user.weddingId },
    include: { rsvp: { select: { status: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ guests })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = GuestCreateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data', issues: parsed.error.issues }, { status: 400 })

  const { firstName, lastName, email, phone, maxCompanions, group, notes } = parsed.data

  const guest = await prisma.guest.create({
    data: {
      weddingId: session.user.weddingId,
      token: generateToken(),
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      maxCompanions,
      group: group || null,
      notes: notes || null,
    },
  })

  return NextResponse.json({ guest }, { status: 201 })
}
