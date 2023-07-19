import type Decimal from 'decimal.js';

import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';

import PendingTransactionsItem from './PendingTransactionsItem';

export interface PendingTransaction {
  description: string;
  amount: Decimal;
  id: string;
  splitType: string;
  membersList: Array<TransactionMember>;
}

export default function PendingTransactionsList({
  transactions,
}: {
  transactions: Array<PendingTransaction>;
}) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-md bg-alice-main p-2">
        <div className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md">
          No pending transactions left
        </div>
      </div>
    );
  }

  return (
    <ul className="custom-focus space-y-2 rounded-md bg-alice-main p-2 focus:outline-alice-accent">
      {transactions.map((transaction: PendingTransaction) => {
        return (
          <PendingTransactionsItem
            key={transaction.id}
            transaction={transaction}
          />
        );
      })}
    </ul>
  );
}
