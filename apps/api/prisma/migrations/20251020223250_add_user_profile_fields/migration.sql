-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "defaultAddress" TEXT,
ADD COLUMN     "notificationPrefs" JSONB,
ADD COLUMN     "photoUrl" TEXT;
