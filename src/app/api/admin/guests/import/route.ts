import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { generateToken } from '@/lib/tokens'
import { GuestImportRowSchema } from '@/schemas/guest'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const rows: unknown[] = Array.isArray(body.rows) ? body.rows : []
  if (rows.length > 500)
    return NextResponse.json({ error: 'Máximo 500 filas por importación' }, { status: 400 })

  const created: string[] = []
  const errors: { row: number; message: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const parsed = GuestImportRowSchema.safeParse(rows[i])
    if (!parsed.success) {
      errors.push({ row: i + 1, message: parsed.error.issues[0].message })
      continue
    }
    const { firstName, lastName, email, maxCompanions, group } = parsed.data
    try {
      const guest = await prisma.guest.create({
        data: {
          weddingId: session.user.weddingId,
          token: generateToken(),
          firstName,
          lastName,
          email: email || null,
          maxCompanions,
          group: group || null,
        },
      })
      created.push(guest.id)
    } catch {
      errors.push({ row: i + 1, message: 'DB error' })
    }
  }

  return NextResponse.json({ created: created.length, errors })
}
