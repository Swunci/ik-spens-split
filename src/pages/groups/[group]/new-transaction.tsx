import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import useSwr from 'swr';

import type { IMember } from '@/components/new-transaction/helpers';
import {
  handleHowMuch,
  handleTypeChange,
} from '@/components/new-transaction/helpers';
import MembersList from '@/components/new-transaction/MemberList';
import type CustomError from '@/errors/customError';
import type { TransactionCreation } from '@/interfaces/request';
import type { Group } from '@/interfaces/response';
import { RootLayout } from '@/layouts/RootLayout';
import NextApiClient from '@/utils/api/NextApiClient';
import { displayBackdrop, displaySnackbar } from '@/utils/component/helpers';
import { fetcher } from '@/utils/fetcherWrapper';
import { getTodaysDate } from '@/utils/timeUtils';

export default function NewTransactionPage() {
  const todaysDate = getTodaysDate();

  const router = useRouter();

  const { group: groupId } = router.query;

  const { data, error, isLoading } = useSwr<Group, CustomError>(
    () => (groupId ? `${NextApiClient.groupsURL}/${groupId}` : null),
    fetcher
  );

  const [amountError, setAmountError] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [action, setAction] = useState('paid');
  const [payer, setPayer] = useState('');
  const descriptionRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [transactionType, setTransactionType] = useState('Expense');
  const [membersList, setMembersList] = useState(new Array<IMember>());

  useEffect(() => {
    if (data) {
      setPayer(data!.memberNames.at(0)!);
    }
  }, [data]);

  if (isLoading || !groupId) {
    return displayBackdrop();
  }
  if (error) {
    return displaySnackbar('BACKEND BUSTED');
  }

  function calculateSplit(members: IMember[]) {
    const split: Map<string, number> = members.reduce(
      (splitMap: Map<string, number>, member: IMember) => {
        if (member.isSelected) {
          splitMap.set(member.name, member.amount);
        }
        return splitMap;
      },
      new Map<string, number>()
    );
    return split;
  }

  const handleCreation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requestBody: TransactionCreation = {} as TransactionCreation;
    requestBody.groupId = data!.groupId;
    requestBody.payer = payer;
    requestBody.type = transactionType.toLowerCase();
    requestBody.amount = totalCost;
    requestBody.date = dateRef.current!.value;
    requestBody.description = descriptionRef.current!.value;
    requestBody.split = JSON.stringify(
      Object.fromEntries(calculateSplit(membersList!))
    );
    requestBody.currency = data!.currency;

    const nextApiClient = new NextApiClient().jsonBody();
    const response = await nextApiClient.transactions.create(requestBody);

    if (!response.ok) {
      // show error
    }
  };

  return (
    <RootLayout>
      <form
        className="flex w-full flex-col items-center"
        onSubmit={handleCreation}
      >
        <div className="flexbox-row w-11/12 place-content-start gap-2 p-2">
          <select
            className="w-full bg-white p-2"
            onChange={(e) => setPayer(e.target.value)}
          >
            {data!.memberNames.map((member: string) => {
              return <option key={member}>{member}</option>;
            })}
          </select>
          <div className="bg-blue-400 p-2">{action}</div>
          <select
            className="bg-white p-2"
            onChange={(e) => handleTypeChange(e, setAction, setTransactionType)}
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
          <MembersList
            totalCost={totalCost}
            memberNames={data!.memberNames}
            setParentMembersList={setMembersList}
            transactionType={transactionType}
            payer={payer}
          />
        </div>
        <div className="w-11/12 p-2">
          <button className="rounded bg-red-700 p-2" type="submit">
            Create
          </button>
        </div>
      </form>
    </RootLayout>
  );
}
