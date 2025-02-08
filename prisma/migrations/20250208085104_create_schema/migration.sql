/*
  Warnings:

  - You are about to drop the column `date_of_birth` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `dateOfBirth` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MovieLanguage" AS ENUM ('ENGLISH', 'ARABIC', 'FRENCH');

-- CreateEnum
CREATE TYPE "MovieSubtitle" AS ENUM ('ENGLISH', 'ARABIC', 'FRENCH');

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "date_of_birth",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "image" TEXT,
    "language" "MovieLanguage" NOT NULL DEFAULT 'ENGLISH',
    "subtitles" "MovieSubtitle" NOT NULL DEFAULT 'ARABIC',
    "showTimes" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "movieId" TEXT NOT NULL,
    "hallId" TEXT NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hall" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Hall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "line" INTEGER NOT NULL,
    "hallId" TEXT NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_id_key" ON "Movie"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_name_key" ON "Movie"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Party_id_key" ON "Party"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Hall_id_key" ON "Hall"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_id_key" ON "Seat"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_id_key" ON "Reservation"("id");

-- CreateIndex
CREATE INDEX "Reservation_seatId_partyId_idx" ON "Reservation"("seatId", "partyId");

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
