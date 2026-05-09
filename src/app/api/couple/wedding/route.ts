import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  partner1Name:  z.string().min(1).max(100),
  partner2Name:  z.string().min(1).max(100),
  weddingDate:   z.string().datetime().nullable().optional(),
  venueName:     z.string().max(200).optional(),
  venueAddress:  z.string().max(300).optional(),
  venueMapsUrl:  z.string().url().optional().or(z.literal('')),
  dressCode:     z.string().max(200).optional(),
  rsvpEnabled:   z.boolean().optional(),
  giftsEnabled:  z.boolean().optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data', issues: parsed.error.issues }, { status: 400 })

  const { weddingDate, venueMapsUrl, ...rest } = parsed.data

  const wedding = await prisma.wedding.update({
    where: { id: session.user.weddingId },
    data: {
      ...rest,
      weddingDate: weddingDate ? new Date(weddingDate) : null,
      venueMapsUrl: venueMapsUrl || null,
    },
  })

  return NextResponse.json({ wedding })
}
