import type Decimal from 'decimal.js';
import type { Dispatch } from 'react';

import type { MemberDetails } from '@/pages/groups/[group]-helpers';

import type { ActionType } from '../hooks/snackbarReducer';
import DebtItem from './DebtItem';

type MemberAmount = {
  name: string;
  amount: Decimal;
};

export type Debt = {
  debtor: string;
  creditor: string;
  paidAmount: Decimal;
};

export default function DebtList({
  membersMap,
  currencyCode,
  currentPath,
  dispatch,
}: {
  membersMap: Map<string, MemberDetails>;
  currencyCode: string;
  currentPath: string;
  dispatch: Dispatch<ActionType>;
}) {
  const creditors = new Array<MemberAmount>();
  const debtors = new Array<MemberAmount>();

  membersMap.forEach((details, memberName) => {
    if (details.debt.greaterThan(0)) {
      creditors.push({
        name: memberName,
        amount: details.debt,
      } as MemberAmount);
    }
    if (details.debt.lessThan(0)) {
      debtors.push({
        name: memberName,
        amount: details.debt,
      } as MemberAmount);
    }
  });

  creditors.sort((a, b) => b.amount.minus(a.amount).toNumber());
  debtors.sort((a, b) => b.amount.minus(a.amount).toNumber());

  const debts = new Array<Debt>();

  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors.at(0)!;
    const debtor = debtors.at(0)!;
    const creditAmount = creditor.amount;
    const debtAmount = debtor.amount;
    const remainingAmount = creditAmount.plus(debtAmount);
    debts.push({
      debtor: debtor.name,
      creditor: creditor.name,
      paidAmount: remainingAmount.greaterThan(0)
        ? debtAmount.absoluteValue()
        : creditAmount,
    } as Debt);
    if (remainingAmount.equals(0)) {
      creditors.shift();
      debtors.shift();
    } else if (remainingAmount.greaterThan(0)) {
      creditor.amount = creditor.amount.minus(debtAmount.absoluteValue());
      debtors.shift();
    } else {
      creditors.shift();
      debtor.amount = debtor.amount.plus(creditor.amount);
    }
  }
  return debts.length === 0 ? (
    <div className="flexbox-row rounded bg-alice-base p-2 shadow-md">
      All settled up
    </div>
  ) : (
    <ul className="space-y-2">
      {debts.map((debt: Debt) => {
        return (
          <DebtItem
            key={`${debt.creditor}${debt.debtor}`}
            debt={debt}
            currencyCode={currencyCode}
            currentPath={currentPath}
            dispatch={dispatch}
          />
        );
      })}
    </ul>
  );
}
