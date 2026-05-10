import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateWeddingSlug, isValidSlug } from '@/lib/slug'
import { PasswordSchema, BCRYPT_ROUNDS } from '@/lib/password'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const weddings = await prisma.wedding.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { guests: true } },
      admins: { select: { id: true, name: true, email: true, role: true } },
    },
  })

  return NextResponse.json({ weddings })
}

const CreateSchema = z.object({
  partner1Name: z.string().min(1).max(100),
  partner2Name: z.string().min(1).max(100),
  weddingDate:  z.string().datetime().optional().nullable(),
  venueName:    z.string().max(200).optional(),
  venueAddress: z.string().max(300).optional(),
  dressCode:    z.string().max(200).optional(),
  couple: z.array(z.object({
    name:     z.string().min(1).max(100),
    email:    z.string().email(),
    password: PasswordSchema,
  })).min(1).max(2),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = body ? CreateSchema.safeParse(body) : { success: false as const }
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data', issues: (parsed as { success: false; error: { issues: unknown[] } }).error?.issues }, { status: 400 })

  const { partner1Name, partner2Name, weddingDate, venueName, venueAddress, dressCode, couple } = parsed.data

  const slug = generateWeddingSlug(partner1Name, partner2Name)
  if (!isValidSlug(slug))
    return NextResponse.json({ error: 'Invalid slug generated' }, { status: 400 })

  const wedding = await prisma.wedding.create({
    data: {
      slug,
      partner1Name,
      partner2Name,
      weddingDate:  weddingDate ? new Date(weddingDate) : null,
      venueName:    venueName    || null,
      venueAddress: venueAddress || null,
      dressCode:    dressCode    || null,
      admins: {
        create: await Promise.all(couple.map(async (u) => ({
          name:         u.name,
          email:        u.email,
          passwordHash: await bcrypt.hash(u.password, BCRYPT_ROUNDS),
          role:         'COUPLE' as const,
        }))),
      },
    },
    include: { admins: { select: { id: true, email: true, name: true, role: true } } },
  })

  return NextResponse.json({ wedding }, { status: 201 })
}
