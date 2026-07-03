-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetSessionExpiry" TIMESTAMP(3),
ADD COLUMN     "resetSessionToken" TEXT;
