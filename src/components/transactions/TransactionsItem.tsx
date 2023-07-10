import { type Dispatch, useState } from 'react';

import type { Group, Transaction } from '@/interfaces/response';
import {
  getInvolvedMembers,
  getYourShare,
  isMemberInvolved,
} from '@/pages/groups/[group]/transactions-helper';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';
import { getLocaleDateString } from '@/utils/timeUtils';

import type { ActionType } from '../hooks/snackbarReducer';
import EditTransactionModal from './EditTransactionModal';

export default function TransactionsItem({
  transaction,
  group,
  currentMember,
  dispatch,
}: {
  transaction: Transaction;
  group: Group;
  currentMember: string;
  dispatch: Dispatch<ActionType>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
      key={transaction.transactionId}
    >
      <button type="button" onClick={() => setOpen(true)}>
        <div className="w-full">
          <div className="flexbox-row text-base">
            <div>{`${transaction.payer} paid ${currencyCodeSymbolMap.get(
              transaction.currency
            )}${transaction.amount} for ${transaction.description}`}</div>
          </div>
          <div className="flexbox-row gap-2 pt-1">
            <div className="text-xs">
              People involved: {getInvolvedMembers(transaction.split)}.
            </div>
            <div className="text-xs">
              {isMemberInvolved(transaction.split, currentMember)
                ? `Your share: ${currencyCodeSymbolMap.get(
                    transaction.currency
                  )}${getYourShare(transaction.split, currentMember)}`
                : null}
            </div>
            <div className="min-w-fit text-xs">
              {getLocaleDateString(transaction.date)}
            </div>
          </div>
        </div>
        <div className="flexbox-col w-fit py-2 pl-2">&gt;</div>
      </button>
      <EditTransactionModal
        open={open}
        setOpen={setOpen}
        transaction={transaction}
        group={group}
        dispatch={dispatch}
      />
    </li>
  );
}
