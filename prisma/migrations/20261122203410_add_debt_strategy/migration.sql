-- CreateEnum
CREATE TYPE "DebtStrategy" AS ENUM ('MANUAL', 'SNOWBALL', 'AVALANCHE');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "debtStrategy" "DebtStrategy" NOT NULL DEFAULT 'MANUAL';
