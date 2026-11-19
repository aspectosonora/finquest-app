-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pinCode" TEXT,
ADD COLUMN     "pinFailedAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pinLockedUntil" TIMESTAMP(3);
