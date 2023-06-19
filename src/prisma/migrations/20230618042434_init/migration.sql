/*
  Warnings:

  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_groupId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "memberNames" TEXT[];

-- DropTable
DROP TABLE "Member";
