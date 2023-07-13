-- CreateTable
CREATE TABLE "Group" (
    "groupId" TEXT NOT NULL,
    "groupName" VARCHAR(100) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("groupId")
);

-- CreateTable
CREATE TABLE "Member" (
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberName" VARCHAR(50) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("memberId")
);

-- CreateTable
CREATE TABLE "ShareCost" (
    "memberId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "shareCost" DECIMAL(36,18) NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ShareCost_pkey" PRIMARY KEY ("memberId","transactionId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "groupId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "splitType" VARCHAR(10) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transactionId")
);

-- CreateTable
CREATE TABLE "History" (
    "groupId" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "table" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("historyId")
);

-- CreateTable
CREATE TABLE "PaidDebt" (
    "groupId" TEXT NOT NULL,
    "creditor" TEXT NOT NULL,
    "debtor" TEXT NOT NULL,
    "debtId" TEXT NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" CHAR(3) NOT NULL,

    CONSTRAINT "PaidDebt_pkey" PRIMARY KEY ("debtId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "groupId" TEXT NOT NULL,
    "commenterId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "comment" VARCHAR(10000) NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("commentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_groupId_memberName_key" ON "Member"("groupId", "memberName");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_groupId_transactionId_key" ON "Transaction"("groupId", "transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "History_groupId_historyId_key" ON "History"("groupId", "historyId");

-- CreateIndex
CREATE UNIQUE INDEX "PaidDebt_groupId_debtId_key" ON "PaidDebt"("groupId", "debtId");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_groupId_commentId_key" ON "Comment"("groupId", "commentId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareCost" ADD CONSTRAINT "ShareCost_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("memberId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareCost" ADD CONSTRAINT "ShareCost_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("transactionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Member"("memberId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaidDebt" ADD CONSTRAINT "PaidDebt_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaidDebt" ADD CONSTRAINT "PaidDebt_creditor_fkey" FOREIGN KEY ("creditor") REFERENCES "Member"("memberId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaidDebt" ADD CONSTRAINT "PaidDebt_debtor_fkey" FOREIGN KEY ("debtor") REFERENCES "Member"("memberId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commenterId_fkey" FOREIGN KEY ("commenterId") REFERENCES "Member"("memberId") ON DELETE CASCADE ON UPDATE CASCADE;
