import type { Dispatch } from 'react';

import type { Group, Transaction } from '@/interfaces/response';
import { isMemberInvolved } from '@/pages/groups/[group]/transactions-helper';

import type { ActionType } from '../hooks/snackbarReducer';
import TransactionsItem from './TransactionsItem';

export default function TransactionsList({
  transactions,
  dataOwner,
  currentMember,
  group,
  dispatch,
}: {
  transactions: Array<Transaction>;
  dataOwner: string;
  currentMember: string;
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
              return isMemberInvolved(transaction.split, currentMember);
            case 'others':
              return !isMemberInvolved(transaction.split, currentMember);
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
              currentMember={currentMember}
              dispatch={dispatch}
            />
          );
        })}
    </ul>
  );
}
