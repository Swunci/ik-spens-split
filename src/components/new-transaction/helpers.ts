import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

import { getTodaysDate } from '@/utils/timeUtils';

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

export function handleTypeChange(
  e: ChangeEvent<HTMLSelectElement>,
  setAction: Dispatch<SetStateAction<string>>,
  setTransactionType: Dispatch<SetStateAction<string>>
) {
  const newType = e.target.value.toLowerCase();
  const newAction = transactionMap.get(newType);
  setAction(newAction!);
  setTransactionType(newType);
}

export function handleHowMuch(
  e: ChangeEvent<HTMLInputElement>,
  setTotalCost: Dispatch<SetStateAction<number>>,
  setAmountError: Dispatch<SetStateAction<boolean>>
) {
  const newTotalCost = e.target.valueAsNumber ? e.target.valueAsNumber : 0;
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

export function getInitialMemberList(
  memberNames: string[],
  transactionType: string,
  payer: string,
  totalCost: number
) {
  const names = memberNames.filter((name: string) => {
    if (transactionType === 'loan') return payer !== name;
    return true;
  });
  const list = names.map((name: string) => {
    const member = {} as IMember;
    member.name = name;
    member.isSelected = true;
    member.amount = totalCost / names.length;
    member.weight = 0;
    return member;
  });
  return list;
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
    member.amount = member.isSelected ? totalCost / selectedCount : 0;
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

  if (totalWeight === 0) {
    return membersList;
  }
  const list = membersList.map((currentMember: IMember) => {
    const member = currentMember;
    member.amount = totalCost * (member.weight / totalWeight);
    return member;
  });
  return list;
}

export function getMembersListBySplitType(
  splitType: string,
  members: IMember[],
  totalCost: number
) {
  let list = new Array<IMember>();
  switch (splitType.toLowerCase()) {
    case 'equal':
      list = getEqualSplitMemberList(members, totalCost);
      break;
    case 'weight':
      list = getWeightSplitMemberList(members, totalCost);
      break;
    case 'custom':
      list = getCustomSplitMemberList(members);
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
  totalCost: number
): void {
  const members = membersList.map((mem: IMember) => {
    const newMem = mem;
    newMem.isSelected = isAllSelected;
    return newMem;
  });
  const newList = getMembersListBySplitType(splitType, members, totalCost);
  setMembersList(newList);
}
