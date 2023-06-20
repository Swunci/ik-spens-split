import { FormControl, MenuItem, Select, Typography } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import useSwr from 'swr';

import type CustomError from '@/errors/customError';
import type { Group } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import { displayBackdrop } from '@/utils/component/helpers';
import { fetcher } from '@/utils/fetcherWrapper';

export default function GroupPage() {
  const currency: string = '$';
  const amount: number = 100.1;

  const router = useRouter();
  const currentPath = usePathname();

  const handleAddExpense = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`${currentPath}/new-transaction`);
  };

  const { data, error, isLoading } = useSwr<Group, CustomError>(
    `/api${currentPath}`,
    fetcher
  );

  if (isLoading) {
    return displayBackdrop();
  }

  if (error) {
    return error.status === 404 ? router.push('/404') : router.push('/500');
  }

  return (
    <RootLayout>
      <Typography className="min-w-fit whitespace-normal break-words p-1 text-center text-3xl">
        {data?.groupName}
      </Typography>
      <div className="flexbox-row max-w-11/12 items-center justify-start p-2">
        <Typography className="min-w-fit p-1">View as</Typography>
        <FormControl fullWidth>
          <Select
            className="static bg-white"
            autoWidth
            defaultValue={data?.memberNames.at(0)}
          >
            {data?.memberNames.map((name: string) => {
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
            {amount}
          </div>
        </div>
        <div className="flexbox-row p-2">
          <div>Your cost:</div>
          <div>
            {currency}
            {amount}
          </div>
        </div>
        <div className="flexbox-row p-2">
          <div className="text-red-500">{`You've paid`}:</div>
          <div className="text-red-500">
            {currency}
            {amount}
          </div>
        </div>
        <div className="flexbox-row p-2">
          <div className="text-green-500">{`You've received`}:</div>
          <div className="text-green-500">
            {currency}
            {amount}
          </div>
        </div>
        <div className="flexbox-row p-2">
          <div
            className={`${amount < 0 ? 'text-red-500' : ''} ${
              amount > 0 ? 'text-green-500' : ''
            }`}
          >
            {amount <= 0 ? 'You owe' : 'You are owed'}:
          </div>
          <div
            className={`${amount < 0 ? 'text-red-500' : ''} ${
              amount > 0 ? 'text-green-500' : ''
            }`}
          >
            {currency}
            {amount}
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
