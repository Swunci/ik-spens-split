import { Alert, Snackbar } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import useSwr from 'swr';

import { MemberIdNameContext } from '@/components/hooks/MemberIdNameContext';
import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import PaidDebtsList from '@/components/transactions/PaidDebtsList';
import TransactionsList from '@/components/transactions/TransactionsList';
import type CustomError from '@/errors/customError';
import type {
  Group,
  Member,
  PaidDebtResponse,
  TransactionResponse,
} from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { saveGroupToLocalStorage } from '@/utils/localStorageUtils';

export default function Transactions() {
  const router = useRouter();
  const currentPath = usePathname();

  const { group: groupId } = router.query;

  const [dataOwner, setDataOwner] = useState('all');
  const [dataType, setDataType] = useState('transactions');
  const [currentMemberId, setCurrentMemberId] = useState('');
  const [memberIdToNameMap, setMemberIdToNameMap] = useState(
    new TwoWayReadonlyMap(new Map<string, string>())
  );

  const contextValue = useMemo(
    () => ({
      memberIdToNameMap,
    }),
    [memberIdToNameMap]
  );

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);

  const {
    data: groupData,
    error: groupError,
    isLoading: isLoadingGroup,
  } = useSwr<Group, CustomError>(
    () => (groupId ? `/api/groups/${groupId}` : null),
    fetcher
  );

  const {
    data: transactionsData,
    error: transactionsError,
    isLoading: isLoadingTransactions,
  } = useSwr<TransactionResponse, CustomError>(
    currentPath ? `/api${currentPath}` : null,
    fetcher
  );

  const {
    data: paidDebtsData,
    error: paidDebtsError,
    isLoading: isLoadingPaidDebts,
  } = useSwr<PaidDebtResponse, CustomError>(
    currentPath
      ? `/api${currentPath.slice(0, currentPath.lastIndexOf('/'))}/debts`
      : null,
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

      setCurrentMemberId(groupData.members.at(0)!.memberId);

      saveGroupToLocalStorage(groupData.groupId);
    }
  }, [groupData]);

  if (
    isLoadingTransactions ||
    isLoadingPaidDebts ||
    isLoadingGroup ||
    !currentPath
  ) {
    return displayBackdrop();
  }

  if (transactionsError || paidDebtsError || groupError) {
    if (groupError?.status === 404) {
      return router.push('/404');
    }
    return router.push('/500');
  }

  function renderByDataType() {
    switch (dataType) {
      case 'transactions':
        return (
          <TransactionsList
            transactions={transactionsData!.transactions}
            dataOwner={dataOwner}
            currentMemberId={currentMemberId}
            group={groupData!}
            dispatch={dispatch}
          />
        );
      case 'debts':
        return (
          <PaidDebtsList
            paidDebts={paidDebtsData!.paidDebts}
            dataOwner={dataOwner}
            currentMemberId={currentMemberId}
            groupData={groupData!}
            dispatch={dispatch}
          />
        );
      default:
        return <div>Nothing to see here</div>;
    }
  }
  return (
    <RootLayout>
      <div className="flexbox-row w-full py-2">
        <Link
          className="p-2"
          href={
            currentPath
              ? currentPath.substring(0, currentPath.lastIndexOf('/'))
              : ''
          }
          passHref
        >
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="button"
          >
            Back
          </button>
        </Link>
        <div className="flexbox-row max-w-full items-center justify-end p-2">
          <Typography className="min-w-fit p-1">View as</Typography>
          <FormControl
            size="small"
            fullWidth={false}
            className="border-alice-main"
          >
            <Select
              className="static bg-alice-base"
              defaultValue={groupData?.members.at(0)?.memberName}
              onChange={(e) =>
                setCurrentMemberId(memberIdToNameMap.revGet(e.target.value)!)
              }
            >
              {groupData?.members.map((member: Member) => {
                return (
                  <MenuItem key={member.memberId} value={member.memberName}>
                    <Typography
                      className="whitespace-normal break-words"
                      noWrap
                    >
                      {member.memberName}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>
      </div>

      <div className="w-full p-2">
        <ToggleButtonGroup
          value={dataType}
          exclusive
          onChange={(_e, value) => {
            setDataType(value);
          }}
        >
          <ToggleButton value="transactions">Transactions</ToggleButton>
          <ToggleButton value="debts">Paid Debts</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className="w-full p-2">
        <ToggleButtonGroup
          value={dataOwner}
          exclusive
          onChange={(_e, value) => {
            setDataOwner(value);
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="yours">Yours</ToggleButton>
          <ToggleButton value="others">Others</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className="flexbox-col h-full w-full space-y-2 rounded bg-alice-main p-2 py-4">
        <MemberIdNameContext.Provider value={contextValue}>
          {renderByDataType()}
        </MemberIdNameContext.Provider>
      </div>
      <Snackbar
        autoHideDuration={5000}
        open={snackbarState.isOpen}
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
    </RootLayout>
  );
}
