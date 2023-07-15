import { Typography } from '@mui/material';
import type { Dispatch } from 'react';
import { useContext, useState } from 'react';
import Balancer from 'react-wrap-balancer';

import { currencyCodeSymbolMap } from '@/utils/currencyUtil';
import { getLocaleDateString } from '@/utils/timeUtils';

import type { Group, PaidDebt } from '../../interfaces/response';
import { MemberIdNameContext } from '../hooks/MemberIdNameContext';
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

  const memberIdNameContext = useContext(MemberIdNameContext);

  const idNameMap = memberIdNameContext!.memberIdToNameMap;

  return (
    <li className="flexbox-col w-full rounded bg-alice-base shadow-md betterhover:hover:bg-alice-base/70">
      <button className="p-2" type="button" onClick={() => setOpen(true)}>
        <div className="flexbox-row">
          <div className="flex w-full justify-start p-2">
            <div className="text-base">
              <Balancer>
                {`${idNameMap.get(paidDebt.debtor)} paid ${idNameMap.get(
                  paidDebt.creditor
                )} ${currencyCodeSymbolMap.get(paidDebt.currency)}${
                  paidDebt.amount
                } on ${getLocaleDateString(paidDebt.date)}`}
              </Balancer>
            </div>
          </div>
          <div className="flexbox-col w-fit justify-center py-2 pl-2">
            <Typography>&gt;</Typography>
          </div>
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
