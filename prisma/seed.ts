import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const wedding = await prisma.wedding.upsert({
    where: { slug: 'florencia-matias' },
    update: {},
    create: {
      slug: 'florencia-matias',
      partner1Name: 'Florencia',
      partner2Name: 'Matias',
      weddingDate: new Date('2027-03-27T18:00:00-03:00'),
      timezone: 'America/Santiago',
      locale: 'es',
      rsvpEnabled: true,
    },
  })

  // Admin (Joaquin — full access)
  const adminHash = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD ?? 'admin123', 10)
  await prisma.weddingAdmin.upsert({
    where: { weddingId_email: { weddingId: wedding.id, email: 'joaquin.castanos@gmail.com' } },
    update: {},
    create: {
      weddingId: wedding.id,
      email: 'joaquin.castanos@gmail.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      name: 'Joaquin',
    },
  })

  // Couple accounts
  const coupleHash = await bcrypt.hash(process.env.COUPLE_SEED_PASSWORD ?? 'novios123', 10)
  for (const { email, name } of [
    { email: 'florencia@example.com', name: 'Florencia' },
    { email: 'matias@example.com',    name: 'Matias' },
  ]) {
    await prisma.weddingAdmin.upsert({
      where: { weddingId_email: { weddingId: wedding.id, email } },
      update: {},
      create: {
        weddingId: wedding.id,
        email,
        passwordHash: coupleHash,
        role: 'COUPLE',
        name,
      },
    })
  }

  console.log(`✓ Wedding "${wedding.slug}" seeded with 1 admin + 2 couple accounts`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
