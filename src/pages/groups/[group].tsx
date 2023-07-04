import TextareaAutosize from '@mui/base/TextareaAutosize';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
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
  Comment,
  CommentResponse,
  Group,
  PaidDebtResponse,
  TransactionResponse,
} from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { getHowLongAgo } from '@/utils/timeUtils';

import { createComment, getOverviewStats } from './[group]-helpers';

export default function GroupPage() {
  const router = useRouter();
  const currentPath = usePathname();

  const [currentMember, setCurrentMember] = useState('');
  const [commentText, setCommentText] = useState('');

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
    setCurrentMember(groupData?.memberNames.at(0)!);
    localStorage.setItem(
      'groupSize',
      JSON.stringify(groupData?.memberNames.length || 0)
    );
  }, [groupData]);

  useEffect(() => {
    localStorage.setItem('currentMember', currentMember);
  }, [currentMember]);

  if (
    isLoadingGroup ||
    isLoadingTransactions ||
    isLoadingPaidDebts ||
    !currentPath
  ) {
    return displayBackdrop();
  }

  if (groupError || transactionsError || paidDebtsError) {
    if (groupError?.status === 404) {
      return router.push('/404');
    }
    return router.push('/500');
  }

  const currencyCode = groupData?.currency || '';

  const currencySymbol: string =
    currencyCodeSymbolMap.get(groupData?.currency || '') || '';

  const [groupCost, membersMap] = getOverviewStats(
    transactionsData!.transactions,
    groupData!.memberNames,
    paidDebtsData!.paidDebts
  );

  const debtAmount = membersMap.get(currentMember)?.debt || 0;

  function displayComments() {
    return (
      <ul className="space-y-2">
        {commentsData!.comments.map((commentRecord: Comment) => {
          return (
            <li
              className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
              key={commentRecord.commentId}
            >
              <div className="flexbox-row">
                <div>{commentRecord.commenter}</div>
                <div>{getHowLongAgo(commentRecord.createdDate)}</div>
              </div>
              <div>{commentRecord.comment}</div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <RootLayout>
      <Typography className="w-full min-w-fit whitespace-normal break-words p-1 text-center text-3xl">
        {groupData?.groupName}
      </Typography>
      <div className="w-full space-y-6 p-2">
        <div className="flexbox-row max-w-full items-center justify-start p-2">
          <Typography className="min-w-fit p-1">View as</Typography>
          <FormControl
            size="small"
            fullWidth={false}
            className="border-alice-main"
          >
            <Select
              className="static bg-alice-base"
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
        <div className="w-full rounded bg-alice-main shadow-md">
          <div className="flexbox-row max-w-full p-2">
            <div className="w-full rounded px-2 text-center text-2xl">
              Overview
            </div>
          </div>
          <div className="flexbox-col w-full space-y-2  p-2 pt-0 text-lg">
            <div className="flexbox-row border-b-2 border-alice-accent p-2">
              <div>Total group cost:</div>
              <div>
                {currencySymbol}
                {groupCost.toFixed(2)}
              </div>
            </div>
            <div className="flexbox-row border-b-2 border-alice-accent p-2">
              <div>Your cost:</div>
              <div>
                {currencySymbol}
                {membersMap.get(currentMember)?.cost.toFixed(2)}
              </div>
            </div>
            <div className="flexbox-row border-b-2 border-alice-accent p-2">
              <div>{`You've paid`}:</div>
              <div>
                {currencySymbol}
                {membersMap.get(currentMember)?.paid.toFixed(2)}
              </div>
            </div>
            <div className="flexbox-row border-b-2 border-alice-accent p-2">
              <div>{`You've received`}:</div>
              <div>
                {currencySymbol}
                {membersMap.get(currentMember)?.received.toFixed(2)}
              </div>
            </div>
            <div className="flexbox-row border-b-2 border-alice-accent p-2">
              <div>{debtAmount < 0 ? 'You owe' : 'You are owed'}:</div>
              <div>
                {currencySymbol}
                {Math.abs(debtAmount).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="flexbox-row w-full p-2">
          <Link href={`${currentPath}/transactions`} passHref>
            <button
              className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
              type="button"
            >
              View Transactions
            </button>
          </Link>
          <Link href={`${currentPath}/new-transaction`} passHref>
            <button
              className="rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
              type="button"
            >
              Add
            </button>
          </Link>
        </div>

        <div className="flexbox-col w-full space-y-2 rounded bg-alice-main p-2 text-lg shadow-md">
          <div className="text-center text-2xl">Debts</div>
          <DebtList
            membersMap={membersMap}
            currencyCode={currencyCode}
            dispatch={dispatch}
          />
        </div>

        <div className="w-full rounded bg-alice-main p-2">
          <div className="text-center text-2xl">Comments</div>
          <div className="flexbox-row space-x-2 py-2">
            <TextareaAutosize
              className="my-2 inline-block w-full overflow-hidden rounded bg-alice-base p-1"
              id="commentText"
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flexbox-col max-w-fit place-content-end">
              <button
                className="m-1 rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
                type="button"
                onClick={(e) =>
                  createComment(
                    e,
                    groupData!.groupId,
                    currentMember,
                    commentText,
                    currentPath,
                    dispatch
                  )
                }
              >
                Send
              </button>
            </div>
          </div>
          {commentsData?.comments.length !== 0 ? (
            <div className="flexbox-col w-full space-y-2">
              {isLoadingComments || commentsError ? (
                <CircularProgress />
              ) : (
                displayComments()
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
            {snackbarState.message}
          </Alert>
        ) : (
          <div />
        )}
      </Snackbar>
    </RootLayout>
  );
}
