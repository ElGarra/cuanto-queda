/*
  Warnings:

  - You are about to drop the column `isReserved` on the `GiftItem` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `GiftItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'COUPLE');

-- AlterTable
ALTER TABLE "GiftItem" DROP COLUMN "isReserved",
DROP COLUMN "url",
ADD COLUMN     "paymentUrl" TEXT;

-- AlterTable
ALTER TABLE "WeddingAdmin" ADD COLUMN     "name" TEXT,
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'COUPLE';

-- CreateTable
CREATE TABLE "GiftReservation" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "message" TEXT,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GiftReservation_giftId_idx" ON "GiftReservation"("giftId");

-- CreateIndex
CREATE INDEX "GiftReservation_guestId_idx" ON "GiftReservation"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftReservation_giftId_guestId_key" ON "GiftReservation"("giftId", "guestId");

-- CreateIndex
CREATE INDEX "WeddingAdmin_weddingId_role_idx" ON "WeddingAdmin"("weddingId", "role");

-- AddForeignKey
ALTER TABLE "GiftReservation" ADD CONSTRAINT "GiftReservation_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "GiftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftReservation" ADD CONSTRAINT "GiftReservation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
