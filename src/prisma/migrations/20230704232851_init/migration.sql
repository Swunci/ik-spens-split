-- CreateTable
CREATE TABLE "Group" (
    "groupId" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "memberNames" TEXT[],
    "createdDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("groupId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "groupId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "payer" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "split" JSONB NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "currency" TEXT NOT NULL,

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
    "debtId" TEXT NOT NULL,
    "creditor" TEXT NOT NULL,
    "debtor" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL,

    CONSTRAINT "PaidDebt_pkey" PRIMARY KEY ("debtId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "groupId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "commenter" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("commentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_groupId_transactionId_key" ON "Transaction"("groupId", "transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "History_groupId_historyId_key" ON "History"("groupId", "historyId");

-- CreateIndex
CREATE UNIQUE INDEX "PaidDebt_groupId_debtId_key" ON "PaidDebt"("groupId", "debtId");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_groupId_commentId_key" ON "Comment"("groupId", "commentId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaidDebt" ADD CONSTRAINT "PaidDebt_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;
