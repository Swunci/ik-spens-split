import { RootLayout } from '@/layouts/RootLayout';

export default function Group() {
  const groupName: string = 'Ski trip';
  const currency: string = '$';
  const amount: number = 100.1;

  return (
    <RootLayout>
      <div>{groupName}</div>
      <div className="w-11/12 p-2">
        View as
        <select className="ml-2 bg-white">
          <option>Person A</option>
          <option>Person B</option>
        </select>
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
        <button className="rounded bg-orange-500 p-2" type="button">
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
