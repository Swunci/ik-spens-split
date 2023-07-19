import type Decimal from 'decimal.js';
import type { Dispatch, FormEvent } from 'react';
import { mutate } from 'swr';

import type {
  PaidDebtUpdate,
  ShareCost,
  TransactionUpdate,
} from '@/interfaces/request';
import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';
import { mathChecksOut } from '@/pages/groups/[group]/new-transaction-helpers';
import NextApiClient from '@/utils/api/NextApiClient';

import type { ActionType } from '../hooks/snackbarReducer';
import { ACTION_TYPES } from '../hooks/snackbarReducer';

export type UpdateTransactionForm = {
  groupId: string;
  transactionId: string;
  date: string;
  description: string;
  payerId: string;
  totalCost: Decimal;
  membersList: TransactionMember[];
  currency: string;
  transactionType: string;
  splitType: string;
};

export type UpdatePaidDebtForm = {
  groupId: string;
  debtId: string;
  creditor: string;
  debtor: string;
  amount: Decimal;
};

export async function handleTransactionUpdate(
  e: FormEvent<HTMLFormElement>,
  formDetails: UpdateTransactionForm,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const requestBody: TransactionUpdate = {} as TransactionUpdate;
  requestBody.groupId = formDetails.groupId;
  requestBody.transactionId = formDetails.transactionId;
  requestBody.payerId = formDetails.payerId;
  requestBody.type = formDetails.transactionType.toLowerCase();
  requestBody.splitType = formDetails.splitType;
  requestBody.amount = formDetails.totalCost.toString();
  requestBody.date = formDetails.date;
  requestBody.description = formDetails.description;
  requestBody.splits = formDetails.membersList.map(
    (member: TransactionMember) => {
      return {
        memberId: member.memberId,
        shareCost: member.amount.toString(),
        weight: member.weight,
      } as ShareCost;
    }
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
  mutate(`/api/groups/${requestBody.groupId}/transactions`);
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
  mutate(`/api/groups/${groupId}/transactions`);
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
  mutate(`/api/groups/${groupId}/debts`);
  return true;
}

export async function handlePaidDebtUpdate(
  e: FormEvent<HTMLFormElement>,
  formDetails: UpdatePaidDebtForm,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const requestBody: PaidDebtUpdate = {} as PaidDebtUpdate;
  requestBody.groupId = formDetails.groupId;
  requestBody.debtId = formDetails.debtId;
  requestBody.creditor = formDetails.creditor;
  requestBody.debtor = formDetails.debtor;
  requestBody.amount = formDetails.amount.toString();

  if (formDetails.creditor === formDetails.debtor) {
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: `Can't pay yourself`,
    });
    return;
  }

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
  mutate(`/api/groups/${requestBody.groupId}/debts`);
}
