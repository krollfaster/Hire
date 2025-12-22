/*
  Warnings:

  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkExperience` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkExperience" DROP CONSTRAINT "WorkExperience_profileId_fkey";

-- AlterTable
ALTER TABLE "Profession" ADD COLUMN     "businessTrips" BOOLEAN,
ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "travelTime" TEXT,
ADD COLUMN     "workFormat" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "WorkExperience";

-- CreateTable
CREATE TABLE "ResearcherSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearcherSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearcherSearch_userId_idx" ON "ResearcherSearch"("userId");

-- AddForeignKey
ALTER TABLE "ResearcherSearch" ADD CONSTRAINT "ResearcherSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
