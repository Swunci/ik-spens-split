import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import useSwr from 'swr';

import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import { handleHowMuch } from '@/components/new-transaction/helpers';
import type CustomError from '@/errors/customError';
import type { Group, PaidDebt } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop, displaySnackbar } from '@/utils/component/helpers';
import { fetcher } from '@/utils/fetcherWrapper';

import type { UpdatePaidDebtForm } from '../new-transaction-helpers';
import {
  handlePaidDebtDelete,
  handlePaidDebtUpdate,
} from '../new-transaction-helpers';

export default function PaidDebtsPage() {
  const router = useRouter();

  const currentPath = usePathname();

  const { group: groupId } = router.query;

  const {
    data: groupData,
    error: groupError,
    isLoading: isLoadingGroup,
  } = useSwr<Group, CustomError>(
    () => (groupId ? `/api/groups/${groupId}` : null),
    fetcher
  );

  const {
    data: debtData,
    error: debtError,
    isLoading: isLoadingDebt,
  } = useSwr<PaidDebt, CustomError>(
    () => (currentPath ? `/api${currentPath}` : null),
    fetcher
  );

  const [creditor, setCreditor] = useState('');
  const [debtor, setDebtor] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [amountError, setAmountError] = useState(false);
  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);

  useEffect(() => {
    if (debtData) {
      setCreditor(debtData.creditor);
      setDebtor(debtData.debtor);
      setTotalCost(debtData.amount);
    }
  }, [debtData]);

  if (isLoadingGroup || isLoadingDebt || !currentPath) {
    return displayBackdrop();
  }

  if (groupError || debtError) {
    return displaySnackbar('Error retreiving group or debt');
  }

  return (
    <RootLayout>
      <div className="w-11/12 p-2">
        <Link
          href={
            currentPath
              ? currentPath
                  .substring(0, currentPath.lastIndexOf('/'))
                  .replace('/debts', '/transactions')
              : ''
          }
          passHref
        >
          <Button variant="outlined" startIcon={<ArrowBackIosIcon />}>
            Back
          </Button>
        </Link>
      </div>
      <form
        className="flex w-full flex-col items-center"
        onSubmit={(e) => {
          handlePaidDebtUpdate(
            e,
            {
              groupId: groupData!.groupId,
              debtId: debtData!.debtId,
              creditor,
              debtor,
              amount: totalCost,
            } as UpdatePaidDebtForm,
            dispatch
          );
        }}
      >
        <div className="flexbox-row w-11/12 place-content-start gap-2 p-2">
          <select
            className="w-full bg-white p-2"
            onChange={(e) => setDebtor(e.target.value)}
            value={debtor}
          >
            {groupData!.memberNames
              .filter((name: string) => {
                return name !== creditor;
              })
              .map((member: string) => {
                return <option key={member}>{member}</option>;
              })}
          </select>
          <div className="bg-blue-400 p-2">paid</div>
          <select
            className="w-full bg-white p-2"
            onChange={(e) => {
              setCreditor(e.target.value);
            }}
            value={creditor}
          >
            {groupData!.memberNames
              .filter((name: string) => {
                return name !== debtor;
              })
              .map((member: string) => {
                return <option key={member}>{member}</option>;
              })}
          </select>
        </div>
        <div className="w-11/12 p-2">
          <label className="flex w-full flex-col" htmlFor="howMuch">
            How much?
            <input
              className={`mt-2 rounded p-1 ${amountError ? 'bg-red-300' : ''}`}
              id="howMuch"
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              required
              value={totalCost === 0 ? '' : totalCost}
              onChange={(e) => handleHowMuch(e, setTotalCost, setAmountError)}
            />
          </label>
        </div>
        <div className="flexbox-row w-11/12 p-2">
          <button className="rounded bg-red-700 p-2" type="submit">
            Update
          </button>
          <button
            className="rounded bg-red-700 p-2"
            type="button"
            onClick={async (e) => {
              const isDeleted = await handlePaidDebtDelete(
                e,
                groupData!.groupId,
                debtData!.debtId,
                dispatch
              );
              if (isDeleted && currentPath) {
                router.push(currentPath.slice(0, currentPath.lastIndexOf('/')));
              }
            }}
          >
            Delete
          </button>
        </div>
      </form>
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
