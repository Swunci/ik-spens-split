import type Decimal from 'decimal.js';

import PendingTransactionsItem from './PendingTransactionsItem';

export interface PendingTransaction {
  description: string;
  amount: Decimal;
  id: string;
}

export default function PendingTransactionsList({
  transactions,
}: {
  transactions: Array<PendingTransaction>;
}) {
  if (transactions.length === 0) {
    return <div>No transactions to show</div>;
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
