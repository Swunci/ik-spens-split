import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import useSwr from 'swr';

import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import { TransactionContext } from '@/components/hooks/TransactionContext';
import type { IMember } from '@/components/new-transaction/helpers';
import {
  handleHowMuch,
  handleTypeChange,
} from '@/components/new-transaction/helpers';
import MembersList from '@/components/new-transaction/MemberList';
import type CustomError from '@/errors/customError';
import type { Group } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop, displaySnackbar } from '@/utils/component/helpers';
import { fetcher } from '@/utils/fetcherWrapper';
import { getTodaysDate } from '@/utils/timeUtils';

import type { FormDetails } from './new-transaction-helpers';
import { handleCreation } from './new-transaction-helpers';

export default function NewTransactionPage() {
  const todaysDate = getTodaysDate();

  const router = useRouter();

  const currentPath = usePathname();

  const { group: groupId } = router.query;

  const { data, error, isLoading } = useSwr<Group, CustomError>(
    () => (groupId ? `/api/groups/${groupId}` : null),
    fetcher
  );

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);
  const [totalCost, setTotalCost] = useState(0);
  const [payer, setPayer] = useState('');
  const [transactionType, setTransactionType] = useState('Expense');
  const [membersList, setMembersList] = useState(new Array<IMember>());
  const [amountError, setAmountError] = useState(false);
  const [action, setAction] = useState('paid');
  const descriptionRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const contextValue = React.useMemo(
    () => ({
      payer,
      setPayer,
      membersList,
      setMembersList,
      totalCost,
      setTotalCost,
      transactionType,
      setTransactionType,
    }),
    [payer, membersList, totalCost, transactionType]
  );

  useEffect(() => {
    if (data) {
      setPayer(data.memberNames.at(0)!);
    }
  }, [data]);

  useEffect(() => {
    console.log('new-transaction');
  }, [transactionType, payer, totalCost, membersList]);

  if (isLoading || !groupId) {
    return displayBackdrop();
  }
  if (error) {
    return displaySnackbar('BACKEND BUSTED');
  }

  return (
    <RootLayout>
      <div className="w-11/12 p-2">
        <Link
          href={currentPath.substring(0, currentPath.lastIndexOf('/'))}
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
          handleCreation(
            e,
            {
              groupId: data!.groupId,
              date: dateRef.current!.value,
              description: descriptionRef.current!.value,
              payer,
              totalCost,
              membersList,
              transactionType,
              currency: data!.currency,
            } as FormDetails,
            dispatch,
            setTotalCost,
            descriptionRef
          );
        }}
      >
        <div className="flexbox-row w-11/12 place-content-start gap-2 p-2">
          <select
            className="w-full bg-white p-2"
            onChange={(e) => setPayer(e.target.value)}
          >
            {data!.memberNames.map((member: string) => {
              return <option key={member}>{member}</option>;
            })}
          </select>
          <div className="bg-blue-400 p-2">{action}</div>
          <select
            className="bg-white p-2"
            onChange={(e) => handleTypeChange(e, setAction, setTransactionType)}
          >
            <option>Expense</option>
            <option>Loan</option>
            <option>Income</option>
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
        <div className="w-11/12 p-2">
          <label className="flex w-full flex-col" htmlFor="whatFor">
            What for?
            <input
              className="mt-2 rounded p-1"
              id="whatFor"
              type="text"
              placeholder="Food"
              required
              ref={descriptionRef}
            />
          </label>
        </div>
        <div className="w-11/12 p-2">
          <label className="flex w-full flex-col" htmlFor="when">
            When?
            <input
              className="mt-2 rounded bg-white p-1"
              id="when"
              type="date"
              defaultValue={todaysDate}
              required
              ref={dateRef}
            />
          </label>
        </div>
        <div className="w-11/12 p-2">
          <div className="py-2">How to split?</div>
          <TransactionContext.Provider value={contextValue}>
            <MembersList memberNames={data!.memberNames} />
          </TransactionContext.Provider>
        </div>
        <div className="w-11/12 p-2">
          <button className="rounded bg-red-700 p-2" type="submit">
            Create
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
