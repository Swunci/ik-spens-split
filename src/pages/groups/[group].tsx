import { FormControl, MenuItem, Select, Typography } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSwr from 'swr';

import type CustomError from '@/errors/customError';
import type { Group, TransactionResponse } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { fetcher } from '@/utils/fetcherWrapper';

import { getOverviewStats } from './[group]-helpers';

export default function GroupPage() {
  const currency: string = '$';

  const router = useRouter();
  const currentPath = usePathname();

  const [currentMember, setCurrentMember] = useState('');

  const handleAddExpense = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`${currentPath}/new-transaction`);
  };

  const {
    data: groupData,
    error: groupError,
    isLoading: isLoadingGroup,
  } = useSwr<Group, CustomError>(`/api${currentPath}`, fetcher);

  const {
    data: transactionsData,
    error: transactionsError,
    isLoading: isLoadingTransactions,
  } = useSwr<TransactionResponse, CustomError>(
    `/api${currentPath}/transactions`,
    fetcher
  );

  useEffect(() => {
    setCurrentMember(groupData?.memberNames.at(0)!);
  }, [groupData]);

  if (isLoadingGroup || isLoadingTransactions) {
    return displayBackdrop();
  }

  if (groupError || transactionsError) {
    if (groupError?.status === 404 || transactionsError?.status === 404) {
      return router.push('/404');
    }
    router.push('/500');
  }

  const [groupCost, membersMap] = getOverviewStats(
    transactionsData!.transactions,
    groupData!.memberNames
  );

  return (
    <RootLayout>
      <Typography className="min-w-fit whitespace-normal break-words p-1 text-center text-3xl">
        {groupData?.groupName}
      </Typography>
      <div className="flexbox-row max-w-11/12 items-center justify-start p-2">
        <Typography className="min-w-fit p-1">View as</Typography>
        <FormControl fullWidth>
          <Select
            className="static bg-white"
            autoWidth
            defaultValue={groupData?.memberNames.at(0)}
            onChange={(e) => setCurrentMember(e.target.value)}
          >
            {groupData?.memberNames.map((name: string) => {
              return (
                <MenuItem key={name} value={name}>
                  <Typography className="whitespace-normal break-words" noWrap>
                    {name}
                  </Typography>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </div>
      <div className="flexbox-row w-11/12 p-2">
        <div className="text-2xl">Overview</div>
      </div>
      <div className="flexbox-col w-11/12 space-y-2 bg-white p-2">
        <div className="flexbox-row p-2">
          <div>Total group cost:</div>
          <div>
            {currency}
            {groupCost}
          </div>
        </div>
        <div className="flexbox-row p-2">
          <div>Your cost:</div>
          <div>
            {currency}
            {membersMap.get(currentMember)?.cost}
          </div>
        </div>
        <div className="flexbox-row p-2">
          <div className="text-red-500">{`You've paid`}:</div>
          <div className="text-red-500">
            {currency}
            {membersMap.get(currentMember)?.paid}
          </div>
        </div>
        <div className="flexbox-row p-2">
          <div className="text-green-500">{`You've received`}:</div>
          <div className="text-green-500">
            {currency}
            {membersMap.get(currentMember)?.received}
          </div>
        </div>
        <div className="flexbox-row p-2">
          <div
            className={`${groupCost < 0 ? 'text-red-500' : ''} ${
              groupCost > 0 ? 'text-green-500' : ''
            }`}
          >
            {groupCost <= 0 ? 'You owe' : 'You are owed'}:
          </div>
          <div
            className={`${groupCost < 0 ? 'text-red-500' : ''} ${
              groupCost > 0 ? 'text-green-500' : ''
            }`}
          >
            {currency}
            {groupCost}
          </div>
        </div>
      </div>
      <div className="flexbox-row w-11/12 p-2">
        <button className="rounded bg-orange-500 p-2" type="button">
          View expenses
        </button>
        <button
          className="rounded bg-orange-500 p-2"
          type="button"
          onClick={handleAddExpense}
        >
          Add expense
        </button>
      </div>
      <div className="flexbox-row w-11/12 p-2">
        <div className="text-2xl">Debts</div>
      </div>
      <div className="flexbox-col w-11/12 space-y-2 bg-white p-2">
        <div className="flexbox-row p-2">
          <div>X owes Y $100</div>
          <button type="button">Settle</button>
        </div>
        <div className="flexbox-row p-2">
          <div>X settled debt with Y</div>
          <button type="button">Undo</button>
        </div>
      </div>
      <div className="flexbox-row w-11/12 p-2">
        <div className="text-2xl">Comments</div>
      </div>
      <div className="w-11/12">
        <textarea
          className="my-2 inline-block w-full overflow-hidden rounded p-1"
          id="commentText"
        />
        <button className="rounded bg-blue-500 p-2" type="button">
          Send
        </button>
      </div>
    </RootLayout>
  );
}
