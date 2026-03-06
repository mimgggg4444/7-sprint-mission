/*
  Warnings:

  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PRICE_CHANGED', 'NEW_COMMENT');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;
