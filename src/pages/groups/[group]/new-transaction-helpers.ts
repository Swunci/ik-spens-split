import type { Dispatch, RefObject, SetStateAction } from 'react';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type { IMember } from '@/components/new-transaction/helpers';
import type {
  TransactionCreation,
  TransactionUpdate,
} from '@/interfaces/request';
import NextApiClient from '@/utils/api/NextApiClient';

export type CreateTransactionForm = {
  groupId: string;
  date: string;
  description: string;
  payer: string;
  totalCost: number;
  membersList: IMember[];
  currency: string;
  transactionType: string;
};

export type UpdateTransactionForm = {
  groupId: string;
  transactionId: string;
  date: string;
  description: string;
  payer: string;
  totalCost: number;
  membersList: IMember[];
  currency: string;
  transactionType: string;
};

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
  formDetails: CreateTransactionForm,
  dispatch: Dispatch<ActionType>,
  setTotalCost: Dispatch<SetStateAction<number>>,
  descriptionRef: RefObject<HTMLInputElement>
) {
  e.preventDefault();
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
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: 'Please check if sum adds up to total cost',
    });
    return;
  }

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.transactions.create(requestBody);

  if (!response.ok) {
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
  setTotalCost(0);
  const description = descriptionRef.current!;
  description.value = '';
}

export async function handleUpdate(
  e: React.FormEvent<HTMLFormElement>,
  formDetails: UpdateTransactionForm,
  dispatch: Dispatch<ActionType>,
  setTotalCost: Dispatch<SetStateAction<number>>,
  descriptionRef: RefObject<HTMLInputElement>
) {
  e.preventDefault();
  const requestBody: TransactionUpdate = {} as TransactionUpdate;
  requestBody.groupId = formDetails.groupId;
  requestBody.transactionId = formDetails.transactionId;
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
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: 'Please check if sum adds up to total cost',
    });
    return;
  }

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.transactions.update(requestBody);

  if (!response.ok) {
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
  setTotalCost(0);
  const description = descriptionRef.current!;
  description.value = '';
}
