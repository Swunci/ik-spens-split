import type { Dispatch, RefObject, SetStateAction } from 'react';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type { IMember } from '@/components/new-transaction/helpers';
import type {
  PaidDebtUpdate,
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

export type UpdatePaidDebtForm = {
  groupId: string;
  debtId: string;
  creditor: string;
  debtor: string;
  amount: number;
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

export async function handleTransactionUpdate(
  e: React.FormEvent<HTMLFormElement>,
  formDetails: UpdateTransactionForm,
  dispatch: Dispatch<ActionType>
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
    message: `Updated ${formDetails.transactionType.toLowerCase()}: ${
      formDetails.description
    }`,
  });
}

export async function handleTransactionDelete(
  e: React.MouseEvent,
  groupId: string,
  transactionId: string,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.transactions.delete(
    groupId,
    transactionId
  );

  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message:
        response.status === 400
          ? 'Field validation failed'
          : 'Services currently unavailable',
    });
    return false;
  }
  return true;
}

export async function handlePaidDebtDelete(
  e: React.MouseEvent,
  groupId: string,
  debtId: string,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.paidDebts.delete(groupId, debtId);

  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message:
        response.status === 400
          ? 'Field validation failed'
          : 'Services currently unavailable',
    });
    return false;
  }
  return true;
}

export async function handlePaidDebtUpdate(
  e: React.FormEvent<HTMLFormElement>,
  formDetails: UpdatePaidDebtForm,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const requestBody: PaidDebtUpdate = {} as PaidDebtUpdate;
  requestBody.groupId = formDetails.groupId;
  requestBody.debtId = formDetails.debtId;
  requestBody.creditor = formDetails.creditor;
  requestBody.debtor = formDetails.debtor;
  requestBody.amount = formDetails.amount;

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.paidDebts.update(requestBody);

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
    message: 'Updated paid debt',
  });
}
