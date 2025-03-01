/*
  Warnings:

  - You are about to drop the column `line` on the `Seat` table. All the data in the column will be lost.
  - Added the required column `row` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seatNumber` to the `Seat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "line",
ADD COLUMN     "row" CHAR(1) NOT NULL,
ADD COLUMN     "seatNumber" INTEGER NOT NULL;
