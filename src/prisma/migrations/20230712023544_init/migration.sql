/*
  Warnings:

  - You are about to drop the column `commenter` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `commenterId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commenter_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "commenter",
ADD COLUMN     "commenterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commenterId_fkey" FOREIGN KEY ("commenterId") REFERENCES "Member"("memberId") ON DELETE CASCADE ON UPDATE CASCADE;
