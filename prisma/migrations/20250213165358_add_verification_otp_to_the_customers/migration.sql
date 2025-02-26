/*
  Warnings:

  - Added the required column `OTP` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "OTP" TEXT NOT NULL,
ADD COLUMN     "OTPExpiration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "verififed" BOOLEAN NOT NULL DEFAULT false;
