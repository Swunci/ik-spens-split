import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useReducer, useState } from 'react';
import useSwr from 'swr';

import DebtList from '@/components/[group]/DebtList';
import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import type CustomError from '@/errors/customError';
import type {
  Group,
  PaidDebtResponse,
  TransactionResponse,
} from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';

import { getOverviewStats } from './[group]-helpers';

export default function GroupPage() {
  const router = useRouter();
  const currentPath = usePathname();

  const [currentMember, setCurrentMember] = useState('');

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);

  const {
    data: groupData,
    error: groupError,
    isLoading: isLoadingGroup,
  } = useSwr<Group, CustomError>(`/api${currentPath}`, fetcher);

  const {
    data: transactionsData,
    error: transactionsError,
    isLoading: isLoadingTransactions,
  } = useSwr<TransactionResponse, CustomError>(
    `/api${currentPath}/transactions`,
    fetcher
  );

  const {
    data: paidDebtsData,
    error: paidDebtsError,
    isLoading: isLoadingPaidDebts,
  } = useSwr<PaidDebtResponse, CustomError>(
    `/api${currentPath}/debts`,
    fetcher
  );

  useEffect(() => {
    setCurrentMember(groupData?.memberNames.at(0)!);
    localStorage.setItem(
      'groupSize',
      JSON.stringify(groupData?.memberNames.length || 0)
    );
  }, [groupData]);

  useEffect(() => {
    localStorage.setItem('currentMember', currentMember);
  }, [currentMember]);

  if (isLoadingGroup || isLoadingTransactions || isLoadingPaidDebts) {
    return displayBackdrop();
  }

  if (groupError || transactionsError || paidDebtsError) {
    if (groupError?.status === 404) {
      return router.push('/404');
    }
    return router.push('/500');
  }

  const currencyCode = groupData!.currency || '';

  const currencySymbol: string =
    currencyCodeSymbolMap.get(groupData!.currency) || '';

  const [groupCost, membersMap] = getOverviewStats(
    transactionsData!.transactions,
    groupData!.memberNames,
    paidDebtsData!.paidDebts
  );

  const debtAmount = membersMap.get(currentMember)?.debt || 0;

  return (
    <RootLayout>
      <Typography className="min-w-fit whitespace-normal break-words p-1 text-center text-3xl">
        {groupData?.groupName}
      </Typography>
      <div className="w-full p-2">
        <div className="flexbox-row max-w-full items-center justify-start p-2">
          <Typography className="min-w-fit p-1">View as</Typography>
          <FormControl fullWidth>
            <Select
              className="static bg-white"
              defaultValue={groupData?.memberNames.at(0)}
              onChange={(e) => setCurrentMember(e.target.value)}
            >
              {groupData?.memberNames.map((name: string) => {
                return (
                  <MenuItem key={name} value={name}>
                    <Typography
                      className="whitespace-normal break-words"
                      noWrap
                    >
                      {name}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>
        <div className="flexbox-row w-full p-2">
          <div className="text-2xl">Overview</div>
        </div>
        <div className="flexbox-col w-full space-y-2 bg-white p-2 text-lg">
          <div className="flexbox-row p-2">
            <div>Total group cost:</div>
            <div>
              {currencySymbol}
              {groupCost.toFixed(2)}
            </div>
          </div>
          <div className="flexbox-row p-2">
            <div>Your cost:</div>
            <div>
              {currencySymbol}
              {membersMap.get(currentMember)?.cost.toFixed(2)}
            </div>
          </div>
          <div className="flexbox-row p-2">
            <div className="text-red-500">{`You've paid`}:</div>
            <div className="text-red-500">
              {currencySymbol}
              {membersMap.get(currentMember)?.paid.toFixed(2)}
            </div>
          </div>
          <div className="flexbox-row p-2">
            <div className="text-green-500">{`You've received`}:</div>
            <div className="text-green-500">
              {currencySymbol}
              {membersMap.get(currentMember)?.received.toFixed(2)}
            </div>
          </div>
          <div className="flexbox-row p-2">
            <div>{debtAmount < 0 ? 'You owe' : 'You are owed'}:</div>
            <div>
              {currencySymbol}
              {Math.abs(debtAmount).toFixed(2)}
            </div>
          </div>
        </div>
        <div className="flexbox-row w-full p-2">
          <Link href={`${currentPath}/transactions`} passHref>
            <button className="rounded bg-orange-500 p-2" type="button">
              View expenses
            </button>
          </Link>
          <Link href={`${currentPath}/new-transaction`} passHref>
            <button className="rounded bg-orange-500 p-2" type="button">
              Add expense
            </button>
          </Link>
        </div>
        <div className="flexbox-row w-full p-2">
          <div className="text-2xl">Debts</div>
        </div>
        <div className="flexbox-col w-full space-y-2 bg-white p-2 text-lg">
          <DebtList
            membersMap={membersMap}
            currencyCode={currencyCode}
            dispatch={dispatch}
          />
        </div>
        <div className="flexbox-col w-full space-y-2 bg-white p-2">{}</div>
        <div className="flexbox-row w-full p-2">
          <div className="text-2xl">Comments</div>
        </div>
        <div className="w-full">
          <textarea
            className="my-2 inline-block w-full overflow-hidden rounded p-1"
            id="commentText"
          />
          <button className="rounded bg-blue-500 p-2" type="button">
            Send
          </button>
        </div>
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
