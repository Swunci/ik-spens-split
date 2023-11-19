import { Typography } from '@mui/material';
import { type Dispatch, useState } from 'react';
import { useContext } from 'react';
import Balancer from 'react-wrap-balancer';

import type { Group, Transaction } from '@/interfaces/response';
import {
  getInvolvedMembers,
  getYourShare,
  isMemberInvolved,
} from '@/pages/groups/[group]/transactions-helper';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';
import { getUTCDateString } from '@/utils/timeUtils';

import { MemberIdNameContext } from '../hooks/MemberIdNameContext';
import type { ActionType } from '../hooks/snackbarReducer';
import EditTransactionModal from './EditTransactionModal';

export default function TransactionsItem({
  transaction,
  group,
  currentMemberId,
  dispatch,
}: {
  transaction: Transaction;
  group: Group;
  currentMemberId: string;
  dispatch: Dispatch<ActionType>;
}) {
  const [open, setOpen] = useState(false);

  const memberIdNameContext = useContext(MemberIdNameContext);

  const idNameMap = memberIdNameContext!.memberIdToNameMap;

  return (
    <li
      className="flexbox-col w-full rounded bg-alice-base shadow-md betterhover:hover:bg-alice-base/70"
      key={transaction.transactionId}
    >
      <button
        className="custom-focus rounded p-2 focus:outline-alice-accent"
        type="button"
        onClick={() => setOpen(true)}
      >
        <div className="flexbox-row">
          <div className="w-full">
            <div className="flexbox-row text-base">
              <div>{`${idNameMap.get(
                transaction.payerId
              )} paid ${currencyCodeSymbolMap.get(transaction.currency)}${
                transaction.amount
              } for ${transaction.description}`}</div>
            </div>
            <div className="flexbox-row gap-2 pt-1">
              <div className="w-full text-left text-xs">
                <Balancer>
                  {`People involved: ${getInvolvedMembers(
                    transaction.shareCosts,
                    idNameMap
                  )}.`}
                </Balancer>
              </div>
              <div className="text-xs">
                {isMemberInvolved(transaction.shareCosts, currentMemberId)
                  ? `Your share: ${currencyCodeSymbolMap.get(
                      transaction.currency
                    )}${getYourShare(transaction.shareCosts, currentMemberId)}`
                  : null}
              </div>
              <div className="min-w-fit text-xs">
                {getUTCDateString(transaction.date)}
              </div>
            </div>
          </div>
          <div className="flexbox-col w-fit justify-center py-2 pl-2">
            <Typography>&gt;</Typography>
          </div>
        </div>
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
