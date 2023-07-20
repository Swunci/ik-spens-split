import { Alert, Snackbar } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import useSwr from 'swr';

import type CustomError from '@/errors/customError';
import type {
  Group,
  Member,
  PaidDebtResponse,
  TransactionResponse,
} from '@/interfaces/response';
import { TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';

import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '../../hooks/snackbarReducer';
import MenuExample from './Menu';

export default function Navbar() {
  const router = useRouter();

  const { group: groupId } = router.query;

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);

  const [memberIdToNameMap, setMemberIdToNameMap] = useState(
    new TwoWayReadonlyMap(new Map<string, string>())
  );

  const { data: groupData } = useSwr<Group, CustomError>(
    () => (groupId ? `/api/groups/${groupId}` : null),
    fetcher
  );

  const { data: transactionsData } = useSwr<TransactionResponse, CustomError>(
    () => (groupId ? `/api/groups/${groupId}/transactions` : null),
    fetcher
  );

  const { data: paidDebtsData } = useSwr<PaidDebtResponse, CustomError>(
    () => (groupId ? `/api/groups/${groupId}/debts` : null),
    fetcher
  );

  useEffect(() => {
    if (groupData) {
      const idNameMap = groupData.members.reduce(
        (map: Map<string, string>, member: Member) => {
          map.set(member.memberId, member.memberName);
          return map;
        },
        new Map<string, string>()
      );
      const readOnlyMap = new TwoWayReadonlyMap(idNameMap);
      setMemberIdToNameMap(readOnlyMap);
    }
  }, [groupData]);

  return (
    <div className="z-50 flex h-12 w-screen flex-col items-center bg-alice-secondary shadow-md">
      <div className="flex-container-row h-12 w-screen justify-between bg-alice-secondary">
        <Link className="h-full" href="/" passHref>
          <button className="h-full text-base" type="button">
            Home
          </button>
        </Link>

        <div className="h-full">
          <MenuExample
            groupId={groupId as string}
            groupData={groupData!}
            transactionsData={transactionsData!}
            paidDebtsData={paidDebtsData!}
            memberIdToNameMap={memberIdToNameMap}
            dispatch={dispatch}
          />
        </div>
      </div>
      <Snackbar
        open={snackbarState.isOpen}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClick={() => dispatch({ type: ACTION_TYPES.CLOSE })}
        onClose={() => dispatch({ type: ACTION_TYPES.CLOSE })}
      >
        {snackbarState.isOpen ? (
          <Alert severity={snackbarState.alertType}>
            {snackbarState.message}
          </Alert>
        ) : (
          <div />
        )}
      </Snackbar>
    </div>
  );
}
