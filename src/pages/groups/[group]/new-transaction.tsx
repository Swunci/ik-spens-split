import { useRef, useState } from 'react';

import {
  handleHowMuch,
  handleTypeChange,
} from '@/components/new-transaction/helpers';
import MembersList from '@/components/new-transaction/MemberList';
import { RootLayout } from '@/layouts/RootLayout';
import { getTodaysDate } from '@/utils/timeUtils';

export default function Transaction() {
  const todaysDate = getTodaysDate();

  const [amountError, setAmountError] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [action, setAction] = useState('paid');

  const payerRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  return (
    <RootLayout>
      <div className="flexbox-row w-11/12 place-content-start gap-2 p-2">
        <select className="w-full bg-white p-2" ref={payerRef}>
          <option>
            Person
            AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
          </option>
          <option>Person B</option>
          <option>Person C</option>
        </select>
        <div className="bg-blue-400 p-2">{action}</div>
        <select
          className="bg-white p-2"
          onChange={(e) => handleTypeChange(e, setAction)}
        >
          <option>Expense</option>
          <option>Loan</option>
          <option>Income</option>
        </select>
      </div>
      <div className="w-11/12 p-2">
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
            onChange={(e) => handleHowMuch(e, setTotalCost, setAmountError)}
          />
        </label>
      </div>
      <div className="w-11/12 p-2">
        <label className="flex w-full flex-col" htmlFor="whatFor">
          What for?
          <input
            className="mt-2 rounded p-1"
            id="whatFor"
            type="text"
            placeholder="Food"
            required
            ref={descriptionRef}
          />
        </label>
      </div>
      <div className="w-11/12 p-2">
        <label className="flex w-full flex-col" htmlFor="when">
          When?
          <input
            className="mt-2 rounded bg-white p-1"
            id="when"
            type="date"
            defaultValue={todaysDate}
            required
            ref={dateRef}
          />
        </label>
      </div>
      <div className="w-11/12 p-2">
        <div className="py-2">How to split?</div>
        <MembersList totalCost={totalCost} />
      </div>
      <div className="w-11/12 p-2">
        <button className="rounded bg-red-700 p-2" type="button">
          Create
        </button>
      </div>
    </RootLayout>
  );
}
