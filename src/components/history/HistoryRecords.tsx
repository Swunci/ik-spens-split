import type {
  Comment,
  Group,
  History,
  PaidDebt,
  Transaction,
} from '@/interfaces/response';
import {
  displaySplit,
  getAction,
} from '@/pages/groups/[group]/history-helpers';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';
import { getHowLongAgo, getLocaleDateString } from '@/utils/timeUtils';

export default function HistoryRecords({
  historyRecords,
}: {
  historyRecords: Array<History>;
}) {
  return (
    <ul className="space-y-2">
      {historyRecords.map((record: History) => {
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
                  } paid ${currencyCodeSymbolMap.get(
                    paidDebt.currency
                  )}${paidDebt.amount.toFixed(2)} to ${
                    paidDebt.creditor
                  }`}</div>
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
