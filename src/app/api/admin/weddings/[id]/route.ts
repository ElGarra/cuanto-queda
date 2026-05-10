import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

const UpdateSchema = z.object({
  partner1Name: z.string().min(1).max(100).optional(),
  partner2Name: z.string().min(1).max(100).optional(),
  weddingDate:  z.string().datetime().nullable().optional(),
  venueName:    z.string().max(200).optional(),
  venueAddress: z.string().max(300).optional(),
  venueMapsUrl: z.string().url().optional().or(z.literal('')),
  dressCode:    z.string().max(200).optional(),
  rsvpEnabled:  z.boolean().optional(),
  giftsEnabled: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = body ? UpdateSchema.safeParse(body) : { success: false as const }
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const { weddingDate, venueMapsUrl, ...rest } = parsed.data

  const wedding = await prisma.wedding.update({
    where: { id },
    data: {
      ...rest,
      ...(weddingDate !== undefined && { weddingDate: weddingDate ? new Date(weddingDate) : null }),
      ...(venueMapsUrl !== undefined && { venueMapsUrl: venueMapsUrl || null }),
    },
  })

  return NextResponse.json({ wedding })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.wedding.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
