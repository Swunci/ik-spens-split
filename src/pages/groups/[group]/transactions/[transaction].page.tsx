import { MenuItem, Select, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
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
  getActionByTransactionType,
  handleHowMuch,
} from '@/components/new-transaction/helpers';
import MembersList from '@/components/new-transaction/MemberList';
import type CustomError from '@/errors/customError';
import type { Group, Transaction } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop, displaySnackbar } from '@/utils/component/helpers';
import { fetcher } from '@/utils/fetcherWrapper';
import { getLocaleDateString } from '@/utils/timeUtils';

import type { UpdateTransactionForm } from '../new-transaction-helpers';
import {
  handleTransactionDelete,
  handleTransactionUpdate,
} from '../new-transaction-helpers';

export default function EditTransactionPage() {
  const router = useRouter();

  const currentPath = usePathname();

  const { group: groupId, transaction: transactionId } = router.query;

  const {
    data: groupData,
    error: groupError,
    isLoading: isLoadingGroup,
  } = useSwr<Group, CustomError>(
    () => (groupId ? `/api/groups/${groupId}` : null),
    fetcher
  );

  const {
    data: transactionData,
    error: transactionError,
    isLoading: isLoadingTransaction,
  } = useSwr<Transaction, CustomError>(
    () => (currentPath ? `/api${currentPath}` : null),
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

  const [isInitialMemberList, setIsInitialMemberList] = useState(true);

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
    if (transactionData) {
      setPayer(transactionData.payer);
      setTotalCost(transactionData.amount);
      setTransactionType(transactionData.type);
    }
  }, [transactionData]);

  useEffect(() => {
    if (isInitialMemberList && membersList.length !== 0) {
      const splitObj = JSON.parse(transactionData!.split);
      const updatedMembersList = membersList.map((member: IMember) => {
        const updatedMember = member;
        if (member.name in splitObj) {
          updatedMember.amount = splitObj[member.name];
        } else {
          updatedMember.isSelected = false;
          updatedMember.amount = 0;
        }
        return updatedMember;
      });
      setMembersList(updatedMembersList);
      setIsInitialMemberList(false);
    }
  }, [membersList]);

  if (isLoadingGroup || isLoadingTransaction || !groupId || !transactionId) {
    return displayBackdrop();
  }
  if (groupError || transactionError) {
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
          handleTransactionUpdate(
            e,
            {
              groupId: groupData!.groupId,
              transactionId: transactionData!.transactionId,
              date: dateRef.current!.value,
              description: descriptionRef.current!.value,
              payer,
              totalCost,
              membersList,
              transactionType,
              currency: groupData!.currency,
            } as UpdateTransactionForm,
            dispatch
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
              defaultValue={transactionData!.payer}
              onChange={(e) => setPayer(e.target.value)}
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
              defaultValue={transactionData!.type}
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
                defaultValue={transactionData!.amount}
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
                defaultValue={transactionData!.description}
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
                ref={dateRef}
                defaultValue={getLocaleDateString(transactionData!.date)}
                required
              />
            </label>
          </div>
        </div>
        <div className="w-full p-2">
          <div className="py-2">How to split?</div>
          <TransactionContext.Provider value={contextValue}>
            <MembersList memberNames={groupData!.memberNames} />
          </TransactionContext.Provider>
        </div>
        <div className="flexbox-row w-full p-2">
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="submit"
          >
            Update
          </button>
          <button
            className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
            type="button"
            onClick={async (e) => {
              const isDeleted = await handleTransactionDelete(
                e,
                groupData!.groupId,
                transactionData!.transactionId,
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
