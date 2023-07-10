import type { Dispatch } from 'react';
import { useState } from 'react';

import { currencyCodeSymbolMap } from '@/utils/currencyUtil';
import { getLocaleDateString } from '@/utils/timeUtils';

import type { Group, PaidDebt } from '../../interfaces/response';
import type { ActionType } from '../hooks/snackbarReducer';
import EditDebtModal from './EditDebtModal';

export default function PaidDebtsItem({
  paidDebt,
  groupData,
  dispatch,
}: {
  paidDebt: PaidDebt;
  groupData: Group;
  dispatch: Dispatch<ActionType>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md">
      <button type="button" onClick={() => setOpen(true)}>
        <div className="flexbox-row">
          <div className="flex w-full justify-start p-2">
            <div className="text-base">
              {`${paidDebt.debtor} paid ${
                paidDebt.creditor
              } ${currencyCodeSymbolMap.get(paidDebt.currency)}${
                paidDebt.amount
              } on ${getLocaleDateString(paidDebt.date)}`}
            </div>
          </div>
          <div className="flexbox-col w-fit justify-center py-2 pl-2">&gt;</div>
        </div>
      </button>
      <EditDebtModal
        open={open}
        setOpen={setOpen}
        groupData={groupData}
        debtData={paidDebt}
        dispatch={dispatch}
      />
    </li>
  );
}
