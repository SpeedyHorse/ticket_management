-- AlterTable
ALTER TABLE "User" ADD COLUMN "encryptionIv" TEXT;
ALTER TABLE "User" ADD COLUMN "encryptionSalt" TEXT;
