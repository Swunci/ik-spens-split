import { randomUUID } from 'crypto';
import type Decimal from 'decimal.js';

import PendingTransactionsItem from './PendingTransactionsItem';

export interface PendingTransaction {
  description: string;
  amount: Decimal;
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
    <ul className="space-y-2">
      {transactions.map((transaction: PendingTransaction) => {
        return (
          <PendingTransactionsItem
            key={randomUUID.toString()}
            transaction={transaction}
          />
        );
      })}
    </ul>
  );
}
