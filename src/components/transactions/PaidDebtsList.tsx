import type { Dispatch } from 'react';

import type { Group, PaidDebt } from '@/interfaces/response';

import type { ActionType } from '../hooks/snackbarReducer';
import PaidDebtsItem from './PaidDebtsItem';

export default function PaidDebtsList({
  paidDebts,
  dataOwner,
  currentMember,
  groupData,
  dispatch,
}: {
  paidDebts: Array<PaidDebt>;
  dataOwner: string;
  currentMember: string;
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
                paidDebt.creditor === currentMember ||
                paidDebt.debtor === currentMember
              );
            case 'others':
              return (
                paidDebt.creditor !== currentMember &&
                paidDebt.debtor !== currentMember
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
