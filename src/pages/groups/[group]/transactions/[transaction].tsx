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
    console.log('edit-transaction');
  }, [transactionType, payer, totalCost, membersList]);

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
          <Button variant="outlined" startIcon={<ArrowBackIosIcon />}>
            Back
          </Button>
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
          <select
            className="w-full bg-white p-2"
            onChange={(e) => setPayer(e.target.value)}
            defaultValue={transactionData!.payer}
          >
            {groupData!.memberNames.map((member: string) => {
              return <option key={member}>{member}</option>;
            })}
          </select>
          <div className="bg-blue-400 p-2">
            {getActionByTransactionType(transactionType)}
          </div>
          <select
            className="bg-white p-2"
            onChange={(e) => setTransactionType(e.currentTarget.value)}
            defaultValue={transactionData!.type}
          >
            <option>expense</option>
            <option>loan</option>
            <option>income</option>
          </select>
        </div>
        <div className="w-full p-2">
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
              defaultValue={transactionData!.amount}
              onChange={(e) => handleHowMuch(e, setTotalCost, setAmountError)}
            />
          </label>
        </div>
        <div className="w-full p-2">
          <label className="flex w-full flex-col" htmlFor="whatFor">
            What for?
            <input
              className="mt-2 rounded p-1"
              id="whatFor"
              type="text"
              placeholder="Food"
              required
              ref={descriptionRef}
              defaultValue={transactionData!.description}
            />
          </label>
        </div>
        <div className="w-full p-2">
          <label className="flex w-full flex-col" htmlFor="when">
            When?
            <input
              className="mt-2 rounded bg-white p-1"
              id="when"
              type="date"
              required
              ref={dateRef}
              defaultValue={getLocaleDateString(transactionData!.date)}
            />
          </label>
        </div>
        <div className="w-full p-2">
          <div className="py-2">How to split?</div>
          <TransactionContext.Provider value={contextValue}>
            <MembersList memberNames={groupData!.memberNames} />
          </TransactionContext.Provider>
        </div>
        <div className="flexbox-row w-full p-2">
          <button className="rounded bg-red-700 p-2" type="submit">
            Update
          </button>
          <button
            className="rounded bg-red-700 p-2"
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
