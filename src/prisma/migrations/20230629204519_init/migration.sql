/*
  Warnings:

  - Added the required column `currency` to the `PaidDebt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaidDebt" ADD COLUMN     "currency" TEXT NOT NULL;
