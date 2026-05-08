-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');

-- CreateTable
CREATE TABLE "Wedding" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "partner1Name" TEXT NOT NULL,
    "partner2Name" TEXT NOT NULL,
    "weddingDate" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/Santiago',
    "venueName" TEXT,
    "venueAddress" TEXT,
    "venueMapsUrl" TEXT,
    "scheduleItems" JSONB NOT NULL DEFAULT '[]',
    "dressCode" TEXT,
    "coverImageUrl" TEXT,
    "rsvpDeadline" TIMESTAMP(3),
    "rsvpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "locale" TEXT NOT NULL DEFAULT 'es',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingAdmin" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "maxCompanions" INTEGER NOT NULL DEFAULT 0,
    "group" TEXT,
    "table" TEXT,
    "notes" TEXT,
    "inviteSentAt" TIMESTAMP(3),
    "inviteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVP" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "status" "RSVPStatus" NOT NULL DEFAULT 'PENDING',
    "companions" JSONB NOT NULL DEFAULT '[]',
    "dietaryRestrictions" TEXT,
    "message" TEXT,
    "submittedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVPHistory" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "fromStatus" "RSVPStatus",
    "toStatus" "RSVPStatus" NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "RSVPHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftItem" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "imageUrl" TEXT,
    "price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "isReserved" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wedding_slug_key" ON "Wedding"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Wedding_domain_key" ON "Wedding"("domain");

-- CreateIndex
CREATE INDEX "Wedding_slug_idx" ON "Wedding"("slug");

-- CreateIndex
CREATE INDEX "Wedding_domain_idx" ON "Wedding"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingAdmin_weddingId_email_key" ON "WeddingAdmin"("weddingId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_token_key" ON "Guest"("token");

-- CreateIndex
CREATE INDEX "Guest_weddingId_idx" ON "Guest"("weddingId");

-- CreateIndex
CREATE INDEX "Guest_token_idx" ON "Guest"("token");

-- CreateIndex
CREATE INDEX "Guest_weddingId_group_idx" ON "Guest"("weddingId", "group");

-- CreateIndex
CREATE UNIQUE INDEX "RSVP_guestId_key" ON "RSVP"("guestId");

-- CreateIndex
CREATE INDEX "RSVPHistory_guestId_idx" ON "RSVPHistory"("guestId");

-- CreateIndex
CREATE INDEX "RSVPHistory_changedAt_idx" ON "RSVPHistory"("changedAt");

-- CreateIndex
CREATE INDEX "GiftItem_weddingId_sortOrder_idx" ON "GiftItem"("weddingId", "sortOrder");

-- AddForeignKey
ALTER TABLE "WeddingAdmin" ADD CONSTRAINT "WeddingAdmin_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVPHistory" ADD CONSTRAINT "RSVPHistory_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftItem" ADD CONSTRAINT "GiftItem_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
