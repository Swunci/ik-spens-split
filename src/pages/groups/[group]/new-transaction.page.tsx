import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Decimal from 'decimal.js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import useSwr from 'swr';

import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import { TransactionContext } from '@/components/hooks/TransactionContext';
import type {
  CreateTransactionForm,
  TransactionMember,
} from '@/components/new-transaction/helpers';
import {
  getActionByTransactionType,
  getInitialMemberList,
  handleTotalCostInput,
  handleTransactionCreation,
  resetSplitCosts,
} from '@/components/new-transaction/helpers';
import MembersList from '@/components/new-transaction/MemberList';
import type CustomError from '@/errors/customError';
import type { Group, Member } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop, displaySnackbar } from '@/utils/component/helpers';
import { displayWithCommas, TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { getTodaysDate } from '@/utils/timeUtils';

export default function NewTransactionPage() {
  const todaysDate = getTodaysDate();

  const router = useRouter();

  const currentPath = usePathname();

  const { group: groupId } = router.query;

  const {
    data: groupData,
    error,
    isLoading,
  } = useSwr<Group, CustomError>(
    () => (groupId ? `/api/groups/${groupId}` : null),
    fetcher
  );

  const [snackbarState, dispatch] = useReducer(snackbarReducer, initialState);
  const [totalCost, setTotalCost] = useState(new Decimal(0));
  const [payerId, setPayerId] = useState('');
  const [transactionType, setTransactionType] = useState('expense');
  const [splitType, setSplitType] = useState('Equal');
  const [membersList, setMembersList] = useState(
    new Array<TransactionMember>()
  );
  const [currency, setCurrency] = useState('');
  const descriptionRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [memberIdToNameMap, setMemberIdToNameMap] = useState(
    new TwoWayReadonlyMap(new Map<string, string>())
  );

  const contextValue = useMemo(
    () => ({
      payerId,
      setPayerId,
      membersList,
      setMembersList,
      totalCost,
      setTotalCost,
      transactionType,
      setTransactionType,
      currency,
      splitType,
      setSplitType,
    }),
    [payerId, membersList, totalCost, transactionType, splitType]
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
      setPayerId(groupData.members.at(0)!.memberId);
      setCurrency(groupData.currency);
      setMembersList(
        getInitialMemberList(groupData.members, transactionType, payerId)
      );
    }
  }, [groupData]);

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
        onSubmit={async (e) => {
          const isCreated = await handleTransactionCreation(
            e,
            {
              groupId: groupData!.groupId,
              date: dateRef.current!.value,
              description: descriptionRef.current!.value,
              payerId,
              totalCost,
              membersList,
              transactionType,
              splitType,
              currency: groupData!.currency,
            } as CreateTransactionForm,
            dispatch
          );
          if (isCreated) {
            setTotalCost(new Decimal(0));
            descriptionRef.current!.value = '';
            setMembersList(resetSplitCosts(membersList));
          }
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
              defaultValue={groupData?.members.at(0)?.memberName}
              onChange={(e) =>
                setPayerId(memberIdToNameMap.revGet(e.target.value)!)
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
                className="mt-2 rounded bg-alice-base p-1"
                id="howMuch"
                type="text"
                placeholder="Amount"
                required
                value={displayWithCommas(totalCost.toFixed(2))}
                onChange={(e) => handleTotalCostInput(e, setTotalCost)}
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
          <div className="p-2">How to split?</div>
          <TransactionContext.Provider value={contextValue}>
            <MembersList />
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
