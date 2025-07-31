/*
  Warnings:

  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_membershipId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_userId_fkey";

-- AlterTable
ALTER TABLE "UserMembership" ADD COLUMN     "counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastScanTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rfidScanHistory" JSONB[];

-- DropTable
DROP TABLE "Attendance";
