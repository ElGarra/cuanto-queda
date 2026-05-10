import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email    = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_SEED_PASSWORD
  const name     = process.env.ADMIN_NAME ?? 'Admin'

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_SEED_PASSWORD env vars are required')
  }

  // Admin needs a wedding to be linked to — create a placeholder if none exists
  let wedding = await prisma.wedding.findFirst()
  if (!wedding) {
    wedding = await prisma.wedding.create({
      data: {
        slug:         'mi-boda',
        partner1Name: 'Novio',
        partner2Name: 'Novia',
      },
    })
    console.log('✓ Placeholder wedding created (update via admin panel)')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.weddingAdmin.upsert({
    where: { weddingId_email: { weddingId: wedding.id, email } },
    update: { passwordHash, name },
    create: { weddingId: wedding.id, email, passwordHash, role: 'ADMIN', name },
  })

  console.log(`✓ Admin created: ${email}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
