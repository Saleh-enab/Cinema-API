/*
  Warnings:

  - You are about to drop the column `showTimes` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "showTimes";

-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "ticketPrice" DECIMAL(65,30) NOT NULL DEFAULT 80.0;
