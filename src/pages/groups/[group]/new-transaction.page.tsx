import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
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
  getActionByTransactionType,
  handleHowMuch,
} from '@/components/new-transaction/helpers';
import MembersList from '@/components/new-transaction/MemberList';
import type CustomError from '@/errors/customError';
import type { Group } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop, displaySnackbar } from '@/utils/component/helpers';
import { fetcher } from '@/utils/fetcherWrapper';
import { getTodaysDate } from '@/utils/timeUtils';

import type { CreateTransactionForm } from './new-transaction-helpers';
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
  const [transactionType, setTransactionType] = useState('expense');
  const [membersList, setMembersList] = useState(new Array<IMember>());
  const [amountError, setAmountError] = useState(false);
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

  if (isLoading || !groupId) {
    return displayBackdrop();
  }
  if (error) {
    return displaySnackbar('BACKEND BUSTED');
  }

  return (
    <RootLayout>
      <div className="w-full p-2">
        <Link
          href={currentPath.substring(0, currentPath.lastIndexOf('/'))}
          passHref
        >
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="button"
          >
            Back
          </button>
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
            } as CreateTransactionForm,
            dispatch,
            setTotalCost,
            descriptionRef
          );
        }}
      >
        <div className="flexbox-row w-full place-content-start gap-2 p-2">
          <FormControl
            size="small"
            fullWidth={false}
            className="h-fit border-alice-main"
          >
            <Select
              className="static bg-alice-base py-0"
              defaultValue={data?.memberNames.at(0)}
              onChange={(e) => setPayer(e.target.value)}
            >
              {data?.memberNames.map((name: string) => {
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
          <Typography className="flexbox-col max-w-fit justify-center">
            {getActionByTransactionType(transactionType)}
          </Typography>
          <FormControl
            size="small"
            fullWidth={false}
            className="h-fit border-alice-main"
          >
            <Select
              className="static bg-alice-base py-0"
              defaultValue="expense"
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <MenuItem value="expense">
                <Typography className="whitespace-normal break-words" noWrap>
                  expense
                </Typography>
              </MenuItem>
              <MenuItem value="loan">
                <Typography className="whitespace-normal break-words" noWrap>
                  loan
                </Typography>
              </MenuItem>
              <MenuItem value="income">
                <Typography className="whitespace-normal break-words" noWrap>
                  income
                </Typography>
              </MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="flexbox-col w-full space-y-4">
          <div className="w-full rounded bg-alice-main p-2">
            <label className="flex w-full flex-col" htmlFor="howMuch">
              How much?
              <input
                className={`mt-2 rounded bg-alice-base p-1 ${
                  amountError ? 'bg-red-300' : ''
                }`}
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

          <div className="w-full rounded bg-alice-main p-2">
            <label className="flex w-full flex-col" htmlFor="whatFor">
              What for?
              <input
                className="mt-2 rounded bg-alice-base p-1"
                id="whatFor"
                type="text"
                placeholder="Food"
                required
                ref={descriptionRef}
              />
            </label>
          </div>

          <div className="w-full rounded bg-alice-main p-2">
            <label className="flex w-full flex-col" htmlFor="when">
              When?
              <input
                className="mt-2 rounded bg-alice-base p-1"
                id="when"
                type="date"
                defaultValue={todaysDate}
                required
                ref={dateRef}
              />
            </label>
          </div>
        </div>

        <div className="w-full py-2">
          <div className="py-2">How to split?</div>
          <TransactionContext.Provider value={contextValue}>
            <MembersList memberNames={data!.memberNames} />
          </TransactionContext.Provider>
        </div>

        <div className="w-full p-2">
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="submit"
          >
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
