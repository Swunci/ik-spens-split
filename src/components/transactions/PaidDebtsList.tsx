import type { Dispatch } from 'react';

import type { Group, PaidDebt } from '@/interfaces/response';

import type { ActionType } from '../hooks/snackbarReducer';
import PaidDebtsItem from './PaidDebtsItem';

export default function PaidDebtsList({
  paidDebts,
  dataOwner,
  currentMemberId,
  groupData,
  dispatch,
}: {
  paidDebts: Array<PaidDebt>;
  dataOwner: string;
  currentMemberId: string;
  groupData: Group;
  dispatch: Dispatch<ActionType>;
}) {
  if (paidDebts.length === 0) {
    return <div>No paid debts to show</div>;
  }
  return (
    <ul className="space-y-2">
      {paidDebts
        .filter((paidDebt: PaidDebt) => {
          switch (dataOwner) {
            case 'yours':
              return (
                paidDebt.creditor === currentMemberId ||
                paidDebt.debtor === currentMemberId
              );
            case 'others':
              return (
                paidDebt.creditor !== currentMemberId &&
                paidDebt.debtor !== currentMemberId
              );
            default:
              return true;
          }
        })
        .map((paidDebt: PaidDebt) => {
          return (
            <PaidDebtsItem
              key={paidDebt.debtId}
              paidDebt={paidDebt}
              groupData={groupData}
              dispatch={dispatch}
            />
          );
        })}
    </ul>
  );
}
