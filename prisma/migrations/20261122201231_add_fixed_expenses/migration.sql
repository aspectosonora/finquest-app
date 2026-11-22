-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'SETTLED');

-- AlterTable
ALTER TABLE "Movement" ADD COLUMN     "relatedFixedExpenseTypeId" TEXT,
ADD COLUMN     "settlementAmountCents" INTEGER,
ADD COLUMN     "settlementOwerUserId" TEXT,
ADD COLUMN     "settlementPayerUserId" TEXT,
ADD COLUMN     "settlementSettledAt" TIMESTAMP(3),
ADD COLUMN     "settlementStatus" "SettlementStatus";

-- CreateTable
CREATE TABLE "FixedExpenseType" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "responsibleUserId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedExpenseType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FixedExpenseType_teamId_idx" ON "FixedExpenseType"("teamId");

-- CreateIndex
CREATE INDEX "Movement_settlementOwerUserId_settlementStatus_idx" ON "Movement"("settlementOwerUserId", "settlementStatus");

-- AddForeignKey
ALTER TABLE "FixedExpenseType" ADD CONSTRAINT "FixedExpenseType_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedExpenseType" ADD CONSTRAINT "FixedExpenseType_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_settlementPayerUserId_fkey" FOREIGN KEY ("settlementPayerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_settlementOwerUserId_fkey" FOREIGN KEY ("settlementOwerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
