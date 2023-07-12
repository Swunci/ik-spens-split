import Decimal from 'decimal.js';
import type {
  ChangeEvent,
  Dispatch,
  FormEvent,
  RefObject,
  SetStateAction,
} from 'react';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type {
  PaidDebtUpdate,
  ShareCost,
  TransactionCreation,
  TransactionUpdate,
} from '@/interfaces/request';
import type { Member } from '@/interfaces/response';
import NextApiClient from '@/utils/api/NextApiClient';

import { trimLeadingZeros } from '../../utils/currencyUtil';

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

function assignRemainingToSomeone(
  membersList: Array<TransactionMember>,
  totalCost: Decimal,
  isWeightSplit: boolean
) {
  let updatedMemberList = membersList;
  const calculatedTotal = membersList.reduce(
    (count: Decimal, member: TransactionMember) => {
      return count.plus(member.amount);
    },
    new Decimal(0)
  );
  if (!totalCost.equals(calculatedTotal)) {
    const remaining = totalCost.minus(calculatedTotal);
    let assigned = false;
    updatedMemberList = membersList.map((member: TransactionMember) => {
      const currentMember = member;
      if (isWeightSplit && currentMember.weight === 0) {
        return currentMember;
      }
      if (!assigned && currentMember.isSelected) {
        currentMember.amount = currentMember.amount.plus(remaining);
        assigned = true;
      }
      return currentMember;
    });
  }

  return updatedMemberList;
}

export function getEqualSplitMemberList(
  membersList: Array<TransactionMember>,
  totalCost: Decimal
) {
  const selectedCount = membersList.reduce(
    (count: number, member: TransactionMember) => {
      if (member.isSelected) {
        return count + 1;
      }
      return count;
    },
    0
  );

  const list = membersList.map((currentMember: TransactionMember) => {
    const member = currentMember;
    member.amount = member.isSelected
      ? totalCost.dividedBy(selectedCount).toDecimalPlaces(2)
      : new Decimal(0);
    return member;
  });
  return list;
}

export function getCustomSplitMemberList(
  membersList: Array<TransactionMember>
) {
  const list = membersList.map((currentMember: TransactionMember) => {
    const member = currentMember;
    if (!member.isSelected) {
      member.amount = new Decimal(0);
    }
    return member;
  });
  return list;
}

export function getWeightSplitMemberList(
  membersList: Array<TransactionMember>,
  totalCost: Decimal
) {
  const totalWeight = membersList.reduce(
    (weight: number, member: TransactionMember) => {
      if (member.isSelected) {
        return weight + member.weight;
      }
      return weight;
    },
    0
  );

  const list = membersList.map((currentMember: TransactionMember) => {
    const member = currentMember;
    member.amount =
      totalWeight !== 0
        ? totalCost
            .mul(new Decimal(member.weight).dividedBy(new Decimal(totalWeight)))
            .toDecimalPlaces(2)
        : new Decimal(0);
    return member;
  });
  return list;
}

export function getMembersListBySplitType(
  splitType: string,
  members: TransactionMember[],
  totalCost: Decimal,
  transactionType: string,
  payerId: string
) {
  let list = new Array<TransactionMember>();
  const updatedMembers = members.map((member: TransactionMember) => {
    const updatedMember = member;
    if (transactionType === 'loan' && member.memberId === payerId) {
      updatedMember.amount = new Decimal(0);
      updatedMember.isSelected = false;
      updatedMember.weight = 0;
    }
    return updatedMember;
  });
  switch (splitType.toLowerCase()) {
    case 'equal':
      list = getEqualSplitMemberList(updatedMembers, totalCost);
      list = assignRemainingToSomeone(list, totalCost, false);
      break;
    case 'weight':
      list = getWeightSplitMemberList(updatedMembers, totalCost);
      list = assignRemainingToSomeone(list, totalCost, true);
      break;
    case 'custom':
      list = getCustomSplitMemberList(updatedMembers);
      break;
    default:
  }
  return list;
}

export function setSelectAllMembers(
  membersList: TransactionMember[],
  setMembersList: Dispatch<SetStateAction<TransactionMember[]>>,
  isAllSelected: boolean,
  splitType: string,
  totalCost: Decimal,
  transactionType: string,
  payerId: string
): void {
  const members = membersList.map((mem: TransactionMember) => {
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
    payerId
  );
  setMembersList(newList);
}

export type CreateTransactionForm = {
  groupId: string;
  date: string;
  description: string;
  payerId: string;
  totalCost: Decimal;
  membersList: TransactionMember[];
  currency: string;
  transactionType: string;
};

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
};

export type UpdatePaidDebtForm = {
  groupId: string;
  debtId: string;
  creditor: string;
  debtor: string;
  amount: Decimal;
};

export function getInitialMemberList(
  members: Array<Member>,
  transactionType: string,
  payerId: string
) {
  const currentMembers = members.filter((member: Member) => {
    if (transactionType === 'loan') return payerId !== member.memberId;
    return true;
  });
  const list = currentMembers.map((member: Member) => {
    const transactionMember = {} as TransactionMember;
    transactionMember.memberId = member.memberId;
    transactionMember.memberName = member.memberName;
    transactionMember.isSelected = true;
    transactionMember.amount = new Decimal(0);
    transactionMember.weight = 0;
    return transactionMember;
  });
  return list;
}

function mathChecksOut(membersList: TransactionMember[], totalCost: Decimal) {
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
  dispatch: Dispatch<ActionType>,
  setTotalCost: Dispatch<SetStateAction<Decimal>>,
  descriptionRef: RefObject<HTMLInputElement>
) {
  e.preventDefault();

  if (formDetails.totalCost.greaterThan(10 ** 9)) {
    dispatch({
      type: ACTION_TYPES.OPEN_WARNING,
      message: 'Maximum value is 1,000,000,000',
    });
    return;
  }
  const requestBody: TransactionCreation = {} as TransactionCreation;
  requestBody.groupId = formDetails.groupId;
  requestBody.payerId = formDetails.payerId;
  requestBody.type = formDetails.transactionType.toLowerCase();
  requestBody.amount = formDetails.totalCost.toString();
  requestBody.date = formDetails.date;
  requestBody.description = formDetails.description;
  requestBody.splits = formDetails.membersList.map(
    (member: TransactionMember) => {
      return {
        memberId: member.memberId,
        shareCost: member.amount.toString(),
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
  setTotalCost(new Decimal(0));
  const description = descriptionRef.current!;
  description.value = '';
}

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
  requestBody.amount = formDetails.totalCost.toString();
  requestBody.date = formDetails.date;
  requestBody.description = formDetails.description;
  requestBody.splits = formDetails.membersList.map(
    (member: TransactionMember) => {
      return {
        memberId: member.memberId,
        shareCost: member.amount.toString(),
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
