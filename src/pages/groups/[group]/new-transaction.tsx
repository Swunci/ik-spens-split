import type { ChangeEvent } from 'react';
import { useState } from 'react';

import MembersList from '@/componenets/new-transaction/MemberList';
import { RootLayout } from '@/layouts/RootLayout';

export default function Transaction() {
  const [totalCost, setTotalCost] = useState(0);

  const handleHowMuch = (e: ChangeEvent<HTMLInputElement>) => {
    const newTotalCost = e.target.valueAsNumber ? e.target.valueAsNumber : 0;
    setTotalCost(newTotalCost);
  };

  return (
    <RootLayout>
      <div className="w-11/12 p-2">
        <select>
          <option>Expense</option>
          <option>Loan</option>
          <option>Income</option>
        </select>
      </div>
      <div className="flexbox-row w-11/12 place-content-start gap-2 p-2">
        <select>
          <option>Person A</option>
          <option>Person B</option>
          <option>Person C</option>
        </select>
        <div>Paid, gave, received</div>
      </div>
      <div className="w-11/12 p-2">
        <label className="flex w-full flex-col" htmlFor="howMuch">
          How much?
          <input
            className="mt-2 rounded p-1"
            id="howMuch"
            type="number"
            placeholder="Amount"
            required
            onChange={handleHowMuch}
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
          />
        </label>
      </div>
      <div className="w-11/12 p-2">
        <label className="flex w-full flex-col" htmlFor="when">
          When
          <input
            className="mt-2 rounded p-1"
            id="when"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required
          />
        </label>
      </div>
      <div className="w-11/12 p-2">
        <div className="py-2">How to split?</div>
        <MembersList totalCost={totalCost} />
      </div>
    </RootLayout>
  );
}
