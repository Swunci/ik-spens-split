import type { Dispatch } from 'react';

import type { Group, Transaction } from '@/interfaces/response';
import { isMemberInvolved } from '@/pages/groups/[group]/transactions-helper';

import type { ActionType } from '../hooks/snackbarReducer';
import TransactionsItem from './TransactionsItem';

export default function TransactionsList({
  transactions,
  dataOwner,
  currentMemberId,
  group,
  dispatch,
}: {
  transactions: Array<Transaction>;
  dataOwner: string;
  currentMemberId: string;
  group: Group;
  dispatch: Dispatch<ActionType>;
}) {
  if (transactions.length === 0) {
    return <div>No transactions to show</div>;
  }

  return (
    <ul className="space-y-2">
      {transactions
        .filter((transaction: Transaction) => {
          switch (dataOwner) {
            case 'yours':
              return isMemberInvolved(transaction.shareCosts, currentMemberId);
            case 'others':
              return !isMemberInvolved(transaction.shareCosts, currentMemberId);
            default:
              return true;
          }
        })
        .map((transaction: Transaction) => {
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
