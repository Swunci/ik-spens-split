import TextareaAutosize from '@mui/base/TextareaAutosize';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Decimal from 'decimal.js';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useReducer, useState } from 'react';
import Balancer from 'react-wrap-balancer';
import useSwr from 'swr';

import CommentList from '@/components/[group]/CommentList';
import DebtList from '@/components/[group]/DebtList';
import Overview from '@/components/[group]/Overview';
import { MemberIdNameContext } from '@/components/hooks/MemberIdNameContext';
import {
  ACTION_TYPES,
  initialState,
  snackbarReducer,
} from '@/components/hooks/snackbarReducer';
import MemberSelection from '@/components/shared/MemberSelection';
import type CustomError from '@/errors/customError';
import type {
  CommentResponse,
  Group,
  Member,
  PaidDebtResponse,
  Transaction,
  TransactionResponse,
} from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop, displaySnackbar } from '@/utils/component/helpers';
import {
  currencyCodeSymbolMap,
  currencyNameCodeMap,
  ratesMap,
  TwoWayReadonlyMap,
} from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { saveGroupToLocalStorage } from '@/utils/localStorageUtils';

import type { MemberDetails } from './[group]-helpers';
import { createComment, getOverviewStats } from './[group]-helpers';

export default function GroupPage() {
  const router = useRouter();
  const currentPath = usePathname();

  const [currentMemberId, setCurrentMemberId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [memberIdToNameMap, setMemberIdToNameMap] = useState(
    new TwoWayReadonlyMap(new Map<string, string>())
  );

  const [exchangeRates, setExchangeRates] = useState(
    new Map<Date, Map<string, Decimal>>()
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
    () => (currentPath ? `/api${currentPath}` : null),
    fetcher
  );

  const {
    data: transactionsData,
    error: transactionsError,
    isLoading: isLoadingTransactions,
  } = useSwr<TransactionResponse, CustomError>(
    () => (currentPath ? `/api${currentPath}/transactions` : null),
    fetcher
  );

  const {
    data: paidDebtsData,
    error: paidDebtsError,
    isLoading: isLoadingPaidDebts,
  } = useSwr<PaidDebtResponse, CustomError>(
    () => (currentPath ? `/api${currentPath}/debts` : null),
    fetcher
  );

  const {
    data: commentsData,
    error: commentsError,
    isLoading: isLoadingComments,
  } = useSwr<CommentResponse, CustomError>(
    () => (currentPath ? `/api${currentPath}/comments` : null),
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

  const getExchangeRates = async (dates: Set<Date>) => {
    const rates = new Map<Date, Map<string, Decimal>>();
    await Promise.all(
      Array.from(dates).map(async (date: Date) => {
        rates.set(date, ratesMap);
      })
    );
    setExchangeRates(rates);
  };

  useEffect(() => {
    if (transactionsData && groupData && groupData.level > 0) {
      const dates = new Set<Date>();
      transactionsData.transactions.forEach((transaction: Transaction) => {
        dates.add(transaction.date);
      });
      getExchangeRates(dates);
    }
  }, [transactionsData]);

  if (
    isLoadingGroup ||
    !currentPath ||
    isLoadingTransactions ||
    isLoadingPaidDebts
  ) {
    return displayBackdrop();
  }

  if (groupError) {
    if (groupError?.status === 404) {
      return router.push('/404');
    }
    return router.push('/500');
  }

  if (transactionsError || paidDebtsError) {
    return displaySnackbar('unavailable to load transactions at this time');
  }

  const currencyCode = groupData?.currency ?? '';

  const currencySymbol: string = currencyCodeSymbolMap.get(currencyCode) ?? '';

  const [groupCost, membersMap, conversionError] =
    isLoadingGroup || isLoadingTransactions || isLoadingPaidDebts
      ? [new Decimal(0), new Map<string, MemberDetails>()]
      : getOverviewStats(
          transactionsData!.transactions,
          groupData!.members,
          paidDebtsData!.paidDebts,
          exchangeRates,
          groupData!
        );

  if (conversionError && groupData!.level > 0) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message: `Currency conversion api is done, displaying only transactions done in ${currencyNameCodeMap.revGet(
        groupData!.currency
      )}`,
    });
  }

  return (
    <RootLayout>
      <div className="flexbox-row w-full py-2 md:p-2">
        <Link
          className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                   focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
          href="/new-group"
        >
          Back
        </Link>
        {groupData!.level > 0 ? (
          <Link
            className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                   focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
            href={currentPath ? `${currentPath}/scan-receipt` : ''}
          >
            Scan Receipt
          </Link>
        ) : (
          <Link
            className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                   focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
            href={currentPath ? `${currentPath}/upgrade` : ''}
          >
            Upgrade Group
          </Link>
        )}
      </div>
      <Typography className="w-full min-w-fit whitespace-normal break-words p-1 text-center text-3xl">
        {groupData?.groupName}
      </Typography>
      <div className="w-full space-y-6 py-2 md:p-2">
        <div className="w-full">
          <div className="">
            <div className="flex w-full flex-col rounded bg-alice-main p-2 shadow-md">
              <p className="p-2">View as</p>
              <div />
              <MemberSelection
                currentMemberId={currentMemberId}
                members={groupData!.members}
                idNameMap={memberIdToNameMap}
                setCurrentMemberId={setCurrentMemberId}
              />
            </div>
          </div>
        </div>
        <Overview
          groupCost={groupCost}
          membersMap={membersMap}
          currentMemberId={currentMemberId}
          currencySymbol={currencySymbol}
        />

        <div className="flexbox-row w-full py-2">
          <Link
            className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                       focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
            href={`${currentPath}/transactions`}
          >
            View Transactions
          </Link>
          <Link
            className="custom-focus rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                       focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
            href={`${currentPath}/new-transaction`}
          >
            Add
          </Link>
        </div>

        <div className="flexbox-col w-full space-y-2 rounded bg-alice-main p-2 text-lg shadow-md">
          <div className="text-center text-2xl">Debts</div>
          {isLoadingTransactions || isLoadingPaidDebts ? (
            <div className="flex w-full place-content-evenly">
              <CircularProgress className="text-alice-accent" />
            </div>
          ) : (
            <MemberIdNameContext.Provider value={contextValue}>
              <DebtList
                membersMap={membersMap}
                currencyCode={currencyCode}
                currentPath={currentPath}
                dispatch={dispatch}
              />
            </MemberIdNameContext.Provider>
          )}
        </div>

        <div className="w-full rounded bg-alice-main p-2">
          <div className="text-center text-2xl">Comments</div>
          <div className="flexbox-row space-x-2 py-2">
            <TextareaAutosize
              className="custom-focus my-2 inline-block w-full overflow-hidden rounded bg-alice-base p-2 focus:outline-alice-accent"
              id="commentText"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flexbox-col max-w-fit justify-end">
              <button
                className="custom-focus m-1 mb-2 rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md focus:bg-alice-accent/50 focus:text-black
                       focus:outline-alice-accent betterhover:hover:bg-alice-accent/90"
                type="button"
                onClick={async (e) => {
                  const success = await createComment(
                    e,
                    groupData!.groupId,
                    currentMemberId,
                    commentText,
                    currentPath,
                    dispatch
                  );
                  if (success) {
                    setCommentText('');
                  }
                }}
              >
                Send
              </button>
            </div>
          </div>
          {commentsData?.comments.length !== 0 ? (
            <div className="flexbox-col w-full space-y-2">
              {isLoadingComments || commentsError ? (
                <div className="flex w-full place-content-evenly">
                  <CircularProgress className="text-alice-accent" />
                </div>
              ) : (
                <MemberIdNameContext.Provider value={contextValue}>
                  <CommentList
                    comments={commentsData!.comments}
                    members={groupData!.members}
                    dispatch={dispatch}
                  />
                </MemberIdNameContext.Provider>
              )}
            </div>
          ) : (
            <div />
          )}
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
            <Balancer>{snackbarState.message}</Balancer>
          </Alert>
        ) : (
          <div />
        )}
      </Snackbar>
    </RootLayout>
  );
}
