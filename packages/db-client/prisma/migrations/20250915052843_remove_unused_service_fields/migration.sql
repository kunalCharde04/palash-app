/*
  Warnings:

  - You are about to drop the column `benefitsAndOutcomes` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `difficultyLevel` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `equipmentRequired` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `maxParticipants` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `prerequisites` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `pricingType` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `sessionType` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "benefitsAndOutcomes",
DROP COLUMN "difficultyLevel",
DROP COLUMN "equipmentRequired",
DROP COLUMN "maxParticipants",
DROP COLUMN "prerequisites",
DROP COLUMN "pricingType",
DROP COLUMN "sessionType";

-- DropEnum
DROP TYPE "DiffcultyType";

-- DropEnum
DROP TYPE "PricingType";

-- DropEnum
DROP TYPE "SessionType";
