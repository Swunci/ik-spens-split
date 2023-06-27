import type { Dispatch } from 'react';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type { IMember } from '@/components/new-transaction/helpers';
import type { TransactionCreation } from '@/interfaces/request';
import NextApiClient from '@/utils/api/NextApiClient';

export function calculateSplit(members: IMember[]) {
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

export type FormDetails = {
  groupId: string;
  date: string;
  description: string;
  payer: string;
  totalCost: number;
  membersList: IMember[];
  currency: string;
  transactionType: string;
};

function mathChecksOut(membersList: IMember[], totalCost: number) {
  return (
    totalCost ===
    membersList.reduce((cost: number, member: IMember) => {
      if (member.isSelected) {
        return cost + member.amount;
      }
      return cost;
    }, 0)
  );
}

export async function handleCreation(
  e: React.FormEvent<HTMLFormElement>,
  formDetails: FormDetails,
  dispatch: Dispatch<ActionType>
) {
  const requestBody: TransactionCreation = {} as TransactionCreation;
  requestBody.groupId = formDetails.groupId;
  requestBody.payer = formDetails.payer;
  requestBody.type = formDetails.transactionType.toLowerCase();
  requestBody.amount = formDetails.totalCost;
  requestBody.date = formDetails.date;
  requestBody.description = formDetails.description;
  requestBody.split = JSON.stringify(
    Object.fromEntries(calculateSplit(formDetails.membersList))
  );
  requestBody.currency = formDetails.currency;

  if (!mathChecksOut(formDetails.membersList, formDetails.totalCost)) {
    e.preventDefault();
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: 'Please check if sum adds up to total cost',
    });
    return;
  }

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.transactions.create(requestBody);

  if (!response.ok) {
    e.preventDefault();
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message:
        response.status === 400
          ? 'Field validation failed'
          : 'Services currently unavailable',
    });
    return;
  }
  dispatch({
    type: ACTION_TYPES.OPEN_SUCCESS,
    message: `Added ${formDetails.transactionType.toLowerCase()}: ${
      formDetails.description
    }`,
  });
}
