import Decimal from 'decimal.js';
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type { ShareCost, TransactionCreation } from '@/interfaces/request';
import NextApiClient from '@/utils/api/NextApiClient';
import { trimLeadingZeros } from '@/utils/currencyUtil';

export type CreateTransactionForm = {
  groupId: string;
  date: string;
  description: string;
  payerId: string;
  totalCost: Decimal;
  membersList: TransactionMember[];
  currency: string;
  transactionType: string;
  splitType: string;
};

export interface TransactionMember {
  memberId: string;
  memberName: string;
  amount: Decimal;
  isSelected: boolean;
  weight: number;
}

const transactionTypes = {
  expense: 'paid',
  loan: 'gave',
  income: 'received',
};

const transactionMap = new Map(Object.entries(transactionTypes));

export function getActionByTransactionType(transactionType: string) {
  return transactionMap.get(transactionType.toLowerCase()) ?? '';
}

export function handleTotalCostInput(
  e: ChangeEvent<HTMLInputElement>,
  setTotalCost: Dispatch<SetStateAction<Decimal>>
) {
  let nums = e.target.value.replace(/\D/g, '');
  if (nums.length <= 1) {
    nums = `0${nums}`;
  }
  const precision = -1 * 2;
  const num = `${nums.slice(0, precision)}.${nums.slice(precision)}`;
  setTotalCost(new Decimal(trimLeadingZeros(num)));
}

export function mathChecksOut(
  membersList: TransactionMember[],
  totalCost: Decimal
) {
  const sum = membersList.reduce((cost: Decimal, member: TransactionMember) => {
    if (member.isSelected) {
      return cost.plus(member.amount);
    }
    return cost;
  }, new Decimal(0));
  return totalCost.equals(sum);
}

export async function handleTransactionCreation(
  e: FormEvent<HTMLFormElement>,
  formDetails: CreateTransactionForm,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();

  if (formDetails.totalCost.greaterThan(10 ** 9)) {
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: 'Maximum value is 1,000,000,000',
    });
    return false;
  }
  const requestBody: TransactionCreation = {} as TransactionCreation;
  requestBody.groupId = formDetails.groupId;
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

  if (
    !mathChecksOut(formDetails.membersList, formDetails.totalCost) ||
    formDetails.totalCost.lessThanOrEqualTo(0)
  ) {
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: formDetails.totalCost.lessThanOrEqualTo(0)
        ? 'Please enter amount greater than 0'
        : 'Please check if sum adds up to total cost',
    });
    return false;
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
    return false;
  }
  dispatch({
    type: ACTION_TYPES.OPEN_SUCCESS,
    message: `Added ${formDetails.transactionType.toLowerCase()}: ${
      formDetails.description
    }`,
  });
  return true;
}

export function resetSplitCosts(membersList: Array<TransactionMember>) {
  return membersList.map((member: TransactionMember) => {
    const updatedMember = member;
    updatedMember.amount = new Decimal(0);
    return updatedMember;
  });
}
