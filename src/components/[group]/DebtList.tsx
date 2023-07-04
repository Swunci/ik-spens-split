import type { Dispatch } from 'react';

import type { MemberDetails } from '@/pages/groups/[group]-helpers';

import type { ActionType } from '../hooks/snackbarReducer';
import DebtItem from './DebtItem';

type MemberAmount = {
  name: string;
  amount: number;
};

export type Debt = {
  debtor: string;
  creditor: string;
  paidAmount: number;
};

export default function DebtList({
  membersMap,
  currencyCode,
  dispatch,
}: {
  membersMap: Map<string, MemberDetails>;
  currencyCode: string;
  dispatch: Dispatch<ActionType>;
}) {
  const creditors = new Array<MemberAmount>();
  const debtors = new Array<MemberAmount>();

  membersMap.forEach((details, memberName) => {
    if (details.debt > 0) {
      creditors.push({
        name: memberName,
        amount: details.debt,
      } as MemberAmount);
    }
    if (details.debt < 0) {
      debtors.push({
        name: memberName,
        amount: details.debt,
      } as MemberAmount);
    }
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const debts = new Array<Debt>();

  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors.at(0)!;
    const debtor = debtors.at(0)!;
    const creditAmount = creditor.amount;
    const debtAmount = debtor.amount;
    const remainingAmount = creditAmount + debtAmount;
    debts.push({
      debtor: debtor.name,
      creditor: creditor.name,
      paidAmount: remainingAmount > 0 ? Math.abs(debtAmount) : creditAmount,
    });
    if (remainingAmount === 0) {
      creditors.shift();
      debtors.shift();
    } else if (remainingAmount > 0) {
      creditor.amount -= Math.abs(debtAmount);
      debtors.shift();
    } else {
      creditors.shift();
      debtor.amount += creditor.amount;
    }
  }
  return debts.length === 0 ? (
    <div className="flexbox-row rounded bg-alice-base p-2 shadow-md">
      All settled up
    </div>
  ) : (
    <ul>
      {debts.map((debt: Debt) => {
        return (
          <DebtItem
            key={`${debt.creditor}${debt.debtor}`}
            debt={debt}
            currencyCode={currencyCode}
            dispatch={dispatch}
          />
        );
      })}
    </ul>
  );
}
