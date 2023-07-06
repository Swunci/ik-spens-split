import Typography from '@mui/material/Typography';
import type { Group } from '@prisma/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import useSwr from 'swr';

import type CustomError from '@/errors/customError';
import type {
  Comment,
  History,
  HistoryResponse,
  PaidDebt,
  Transaction,
} from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { getHowLongAgo, getLocaleDateString } from '@/utils/timeUtils';

export default function HistoryPage() {
  const router = useRouter();

  const currentPath = usePathname();

  const { error: groupError, isLoading: isLoadingGroup } = useSwr<
    Group,
    CustomError
  >(
    () =>
      currentPath
        ? `/api${currentPath.slice(0, currentPath.lastIndexOf('/'))}`
        : null,
    fetcher
  );

  const {
    data: historyData,
    error: historyError,
    isLoading: isLoadingHistory,
  } = useSwr<HistoryResponse, CustomError>(
    () => (currentPath ? `/api${currentPath}` : null),
    fetcher
  );

  if (isLoadingGroup || isLoadingHistory || !currentPath) {
    return displayBackdrop();
  }

  if (groupError || historyError) {
    if (groupError?.status === 404) {
      return router.push('/404');
    }
    return router.push('/500');
  }

  function getAction(action: string) {
    switch (action) {
      case 'put':
        return 'Updated';
      case 'post':
        return 'Added';
      case 'delete':
        return 'Deleted';
      default:
        return '';
    }
  }

  function displaySplit(split: string, currencyCode: string) {
    const splitObj = JSON.parse(split);
    const shares = new Array<string>();
    for (const [name, share] of Object.entries(splitObj)) {
      shares.push(
        `${name}: ${currencyCodeSymbolMap.get(currencyCode)}${(
          share as number
        ).toFixed(2)}`
      );
    }
    return shares.join(', ');
  }

  function showHistory() {
    return (
      <ul className="space-y-2">
        {historyData?.history.map((record: History) => {
          switch (record.table) {
            case 'group': {
              const group: Group = JSON.parse(record.details);
              return (
                <li
                  className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
                  key={record.historyId}
                >
                  <div className="flexbox-row">
                    <div className="text-base">
                      {getAction(record.action)} group
                    </div>
                    <div className="min-w-fit text-xs">
                      {getHowLongAgo(record.createdDate)}
                    </div>
                  </div>
                  <div className="flexbox-col gap-1 pt-1">
                    <div className="text-xs">Name: {group.groupName}</div>
                    <div className="text-xs">Currency: {group.currency}</div>
                    <div className="text-xs">
                      Members: {group.memberNames?.join(', ')}
                    </div>
                  </div>
                </li>
              );
            }
            case 'transaction': {
              const transaction: Transaction = JSON.parse(record.details);
              return (
                <li
                  className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
                  key={record.historyId}
                >
                  <div className="flexbox-row">
                    <div className="text-base">
                      {getAction(record.action)} {transaction.type}
                    </div>
                    <div className="min-w-fit text-xs">
                      {getHowLongAgo(record.createdDate)}
                    </div>
                  </div>
                  <div className="flexbox-col gap-1 pt-1">
                    <div className="text-xs">{`${
                      transaction.payer
                    } paid ${currencyCodeSymbolMap.get(transaction.currency)}${
                      transaction.amount
                    } for ${transaction.description}`}</div>
                    <div className="text-xs">
                      Date: {getLocaleDateString(transaction.date)}
                    </div>
                    <div className="text-xs">
                      Split:{' '}
                      {displaySplit(transaction.split, transaction.currency)}
                    </div>
                  </div>
                </li>
              );
            }
            case 'paidDebt': {
              const paidDebt: PaidDebt = JSON.parse(record.details);
              return (
                <li
                  className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
                  key={record.historyId}
                >
                  <div className="flexbox-row">
                    <div className="text-base">
                      {`${getAction(record.action)} paid debt`}
                    </div>
                    <div className="min-w-fit text-xs">
                      {getHowLongAgo(record.createdDate)}
                    </div>
                  </div>
                  <div className="flexbox-col gap-1 pt-1">
                    <div className="text-xs">{`${
                      paidDebt.debtor
                    } paid ${currencyCodeSymbolMap.get(paidDebt.currency)}${
                      paidDebt.amount
                    } to ${paidDebt.creditor}`}</div>
                  </div>
                </li>
              );
            }
            case 'comment': {
              const comment: Comment = JSON.parse(record.details);
              return (
                <li
                  className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
                  key={record.historyId}
                >
                  <div className="flexbox-row">
                    <div className="text-base">
                      {`${getAction(record.action)} comment`}
                    </div>
                    <div className="min-w-fit text-xs">
                      {getHowLongAgo(record.createdDate)}
                    </div>
                  </div>
                  <div className="flexbox-col gap-1 pt-1">
                    <div className="text-xs">{comment.commenter}</div>
                    <div className="text-xs">{comment.comment}</div>
                  </div>
                </li>
              );
            }
            default:
              return (
                <div
                  className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
                  key={record.historyId}
                >
                  Missing switch case for {record.table}
                </div>
              );
          }
        })}
      </ul>
    );
  }

  return (
    <RootLayout>
      <div className="w-full p-2">
        <Link
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
      </div>
      <Typography className="pb-2 text-3xl">History</Typography>
      <div className="w-full rounded bg-alice-main p-2">{showHistory()}</div>
    </RootLayout>
  );
}
