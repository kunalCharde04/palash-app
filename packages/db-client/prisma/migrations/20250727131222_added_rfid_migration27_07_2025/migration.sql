/*
  Warnings:

  - A unique constraint covering the columns `[rfidCardId]` on the table `UserMembership` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserMembership" ADD COLUMN     "rfidCardId" TEXT;

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "counter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_date_key" ON "Attendance"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UserMembership_rfidCardId_key" ON "UserMembership"("rfidCardId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "UserMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
