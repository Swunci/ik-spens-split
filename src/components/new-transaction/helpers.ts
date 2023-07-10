import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type {
  PaidDebtUpdate,
  TransactionCreation,
  TransactionUpdate,
} from '@/interfaces/request';
import NextApiClient from '@/utils/api/NextApiClient';
import { getTodaysDate } from '@/utils/timeUtils';

import { getDecimalPrecisionCurrency } from '../../utils/currencyUtil';

export interface IMember {
  name: string;
  amount: number;
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

export function handleHowMuch(
  e: ChangeEvent<HTMLInputElement>,
  setTotalCost: Dispatch<SetStateAction<number>>,
  setAmountError: Dispatch<SetStateAction<boolean>>
) {
  const newTotalCost = e.target.valueAsNumber
    ? getDecimalPrecisionCurrency(e.target.valueAsNumber, 2)
    : 0;
  if (newTotalCost < 0) {
    setTotalCost(0);
    setAmountError(true);
    return;
  }
  setAmountError(false);
  setTotalCost(newTotalCost);
}

export function handleDateChange(
  e: ChangeEvent<HTMLInputElement>,
  setDate: Dispatch<SetStateAction<string>>
) {
  const inputDate = e.target.value;
  const todaysDate = getTodaysDate();
  if (inputDate > todaysDate) {
    setDate(todaysDate);
    e.target.value = todaysDate;
    return;
  }
  setDate(e.target.value);
}

function allSelectedMembersHaveWeight(membersList: Array<IMember>) {
  let allHaveWeight = true;
  membersList.forEach((member: IMember) => {
    if (member.isSelected && member.weight === 0) {
      allHaveWeight = false;
    }
  });
  return allHaveWeight;
}

function assignRemainingToSomeone(
  membersList: Array<IMember>,
  totalCost: number
) {
  let updatedMemberList = membersList;
  const calculatedTotal = membersList.reduce(
    (count: number, member: IMember) => {
      return getDecimalPrecisionCurrency(count + member.amount, 2);
    },
    0
  );
  if (totalCost !== calculatedTotal) {
    const remaining = getDecimalPrecisionCurrency(
      totalCost - calculatedTotal,
      2
    );
    let assigned = false;
    updatedMemberList = membersList.map((member: IMember) => {
      const currentMember = member;
      if (currentMember.isSelected && !assigned) {
        currentMember.amount = getDecimalPrecisionCurrency(
          currentMember.amount + remaining,
          2
        );
        assigned = true;
      }
      return currentMember;
    });
  }

  return updatedMemberList;
}

export function getEqualSplitMemberList(
  membersList: Array<IMember>,
  totalCost: number
) {
  const selectedCount = membersList.reduce((count: number, member: IMember) => {
    if (member.isSelected) {
      return count + 1;
    }
    return count;
  }, 0);

  const list = membersList.map((currentMember: IMember) => {
    const member = currentMember;
    member.amount = member.isSelected
      ? getDecimalPrecisionCurrency(totalCost / selectedCount, 2)
      : 0;
    return member;
  });
  return list;
}

export function getCustomSplitMemberList(membersList: Array<IMember>) {
  const list = membersList.map((currentMember: IMember) => {
    const member = currentMember;
    if (!member.isSelected) {
      member.amount = 0;
    }
    return member;
  });
  return list;
}

export function getWeightSplitMemberList(
  membersList: Array<IMember>,
  totalCost: number
) {
  const totalWeight = membersList.reduce((weight: number, member: IMember) => {
    if (member.isSelected) {
      return weight + member.weight;
    }
    return weight;
  }, 0);

  const list = membersList.map((currentMember: IMember) => {
    const member = currentMember;
    member.amount =
      totalWeight !== 0
        ? getDecimalPrecisionCurrency(
            totalCost * (member.weight / totalWeight),
            2
          )
        : 0;
    return member;
  });
  return list;
}

export function getMembersListBySplitType(
  splitType: string,
  members: IMember[],
  totalCost: number,
  transactionType: string,
  payer: string
) {
  let list = new Array<IMember>();
  const updatedMembers = members.map((member: IMember) => {
    const updatedMember = member;
    if (transactionType === 'loan' && member.name === payer) {
      updatedMember.amount = 0;
      updatedMember.isSelected = false;
      updatedMember.weight = 0;
    }
    return updatedMember;
  });
  switch (splitType.toLowerCase()) {
    case 'equal':
      list = getEqualSplitMemberList(updatedMembers, totalCost);
      list = assignRemainingToSomeone(list, totalCost);
      break;
    case 'weight':
      list = getWeightSplitMemberList(updatedMembers, totalCost);
      if (allSelectedMembersHaveWeight(list)) {
        list = assignRemainingToSomeone(list, totalCost);
      }
      break;
    case 'custom':
      list = getCustomSplitMemberList(updatedMembers);
      break;
    default:
  }
  return list;
}

export function setSelectAllMembers(
  membersList: IMember[],
  setMembersList: Dispatch<SetStateAction<IMember[]>>,
  isAllSelected: boolean,
  splitType: string,
  totalCost: number,
  transactionType: string,
  payer: string
): void {
  const members = membersList.map((mem: IMember) => {
    const newMem = mem;
    newMem.isSelected = isAllSelected;
    newMem.weight = 0;
    return newMem;
  });
  const newList = getMembersListBySplitType(
    splitType,
    members,
    totalCost,
    transactionType,
    payer
  );
  setMembersList(newList);
}

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

export function getInitialMemberList(
  memberNames: string[],
  transactionType: string,
  payer: string
) {
  const names = memberNames.filter((name: string) => {
    if (transactionType === 'loan') return payer !== name;
    return true;
  });
  const list = names.map((name: string) => {
    const member = {} as IMember;
    member.name = name;
    member.isSelected = true;
    member.amount = 0;
    member.weight = 0;
    return member;
  });
  return list;
}

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
  const sum = membersList.reduce((cost: number, member: IMember) => {
    if (member.isSelected) {
      return cost + member.amount;
    }
    return cost;
  }, 0);
  return totalCost === sum;
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
