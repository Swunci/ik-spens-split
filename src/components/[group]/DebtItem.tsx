import { useRouter } from 'next/router';
import type { Dispatch } from 'react';
import { useState } from 'react';

import type { PaidDebtCreation } from '@/interfaces/request';
import type { PaidDebt } from '@/interfaces/response';
import NextApiClient from '@/utils/api/NextApiClient';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';

import { ACTION_TYPES, type ActionType } from '../hooks/snackbarReducer';
import type { Debt } from './DebtList';

export default function DebtItem({
  debt,
  currencyCode,
  dispatch,
}: {
  debt: Debt;
  currencyCode: string;
  dispatch: Dispatch<ActionType>;
}) {
  const router = useRouter();

  const { group: groupId } = router.query;

  const [isSettled, setIsSettled] = useState(false);
  const [debtId, setDebtId] = useState('');

  const currencySymbol = currencyCodeSymbolMap.get(currencyCode) || '';

  async function createPaidDebt(e: React.MouseEvent) {
    e.preventDefault();
    const body: PaidDebtCreation = {} as PaidDebtCreation;
    body.amount = debt.paidAmount;
    body.creditor = debt.creditor;
    body.debtor = debt.debtor;
    body.groupId = groupId as string;
    body.currency = currencyCode;
    const nextApiClient = new NextApiClient().jsonBody();
    const response = await nextApiClient.paidDebts.create(body);
    if (!response.ok) {
      dispatch({
        type: ACTION_TYPES.OPEN_ERROR,
        message: 'Services currently unavailable',
      });
      return;
    }
    const data: PaidDebt = await response.json();
    setIsSettled(true);
    setDebtId(data.debtId);
  }

  async function undoPaidDebt(e: React.MouseEvent) {
    e.preventDefault();
    const nextApiClient = new NextApiClient().jsonBody();
    const response = await nextApiClient.paidDebts.delete(
      groupId as string,
      debtId
    );
    if (!response.ok) {
      dispatch({
        type: ACTION_TYPES.OPEN_ERROR,
        message: 'Services currently unavailable',
      });
      return;
    }
    setIsSettled(false);
    setDebtId('');
  }

  return (
    <li className="flexbox-row p-2" key={`${debt.creditor}${debt.debtor}`}>
      {isSettled ? (
        <>
          <div>
            {debt.debtor} settled up with {debt.creditor}
          </div>
          <button type="button" onClick={(e) => undoPaidDebt(e)}>
            Undo
          </button>
        </>
      ) : (
        <>
          <div>
            {debt.debtor} owes {debt.creditor} {currencySymbol}
            {Math.abs(debt.paidAmount).toFixed(2)}
          </div>
          <button type="button" onClick={(e) => createPaidDebt(e)}>
            Settle
          </button>
        </>
      )}
    </li>
  );
}
