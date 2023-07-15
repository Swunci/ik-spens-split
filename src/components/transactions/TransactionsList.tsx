import type { Dispatch } from 'react';

import type { Group, Transaction } from '@/interfaces/response';

import type { ActionType } from '../hooks/snackbarReducer';
import TransactionsItem from './TransactionsItem';

export default function TransactionsList({
  transactions,
  currentMemberId,
  group,
  dispatch,
}: {
  transactions: Array<Transaction>;
  currentMemberId: string;
  group: Group;
  dispatch: Dispatch<ActionType>;
}) {
  if (transactions.length === 0) {
    return <div>No transactions to show</div>;
  }

  return (
    <ul className="space-y-2">
      {transactions.map((transaction: Transaction) => {
        return (
          <TransactionsItem
            key={transaction.transactionId}
            transaction={transaction}
            group={group}
            currentMemberId={currentMemberId}
            dispatch={dispatch}
          />
        );
      })}
    </ul>
  );
}
