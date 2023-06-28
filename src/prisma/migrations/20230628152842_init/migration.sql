/*
  Warnings:

  - Added the required column `currency` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "currency" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PaidDebt" (
    "groupId" TEXT NOT NULL,
    "debtId" TEXT NOT NULL,
    "creditor" TEXT NOT NULL,
    "debtor" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "PaidDebt_pkey" PRIMARY KEY ("debtId")
);

-- AddForeignKey
ALTER TABLE "PaidDebt" ADD CONSTRAINT "PaidDebt_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
