import type { MemberDetails } from '@/pages/groups/[group]-helpers';

type MemberDebt = {
  name: string;
  debt: number;
};

type Debt = {
  debtor: string;
  creditor: string;
  paidAmount: number;
};

export default function getDebts({
  membersMap,
  currencySymbol,
}: {
  membersMap: Map<string, MemberDetails>;
  currencySymbol: string;
}) {
  const creditors = new Array<MemberDebt>();
  const debtors = new Array<MemberDebt>();

  membersMap.forEach((details, memberName) => {
    if (details.debt > 0) {
      creditors.push({
        name: memberName,
        debt: details.debt,
      } as MemberDebt);
    }
    if (details.debt < 0) {
      debtors.push({
        name: memberName,
        debt: details.debt,
      } as MemberDebt);
    }
  });

  creditors.sort((a, b) => b.debt - a.debt);
  debtors.sort((a, b) => b.debt - a.debt);

  const debts = new Array<Debt>();

  while (creditors.length > 0) {
    const creditor = creditors.at(0);
    const debtor = debtors.at(0);
    const creditAmount = creditor?.debt || 0;
    const debtAmount = debtor?.debt || 0;
    const remainingAmount = creditAmount + debtAmount;
    debts.push({
      debtor: debtor?.name || '',
      creditor: creditor?.name || '',
      paidAmount: remainingAmount > 0 ? debtAmount : creditAmount,
    });
    if (remainingAmount === 0) {
      creditors.shift();
      debtors.shift();
    } else if (remainingAmount > 0) {
      debtors.shift();
    } else {
      creditors.shift();
    }
  }
  return (
    <>
      {debts.map((debt: Debt) => {
        return (
          <div
            className="flexbox-row p-2"
            key={`${debt.creditor}${debt.debtor}`}
          >
            <div>
              {debt.debtor} owes {debt.creditor} {currencySymbol}
              {Math.abs(debt.paidAmount).toFixed(2)}
            </div>
            <button type="button">Settle</button>
          </div>
        );
      })}
    </>
  );
}
