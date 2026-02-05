-- CreateEnum
CREATE TYPE "MembershipInterestStatus" AS ENUM ('PENDING', 'CONTACTED', 'CONVERTED', 'REJECTED');

-- CreateTable
CREATE TABLE "MembershipInterest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planCost" INTEGER NOT NULL,
    "message" TEXT,
    "status" "MembershipInterestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MembershipInterest_status_idx" ON "MembershipInterest"("status");

-- CreateIndex
CREATE INDEX "MembershipInterest_createdAt_idx" ON "MembershipInterest"("createdAt");
