import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

import { getTodaysDate } from '@/utils/timeUtils';

export interface IMember {
  name: string;
  amount: number;
  isSelected: boolean;
}

export function setSelectAllMembers(
  membersList: IMember[],
  setMembersList: Dispatch<SetStateAction<IMember[]>>,
  setParentMembersList: Dispatch<SetStateAction<IMember[]>>,
  isAllSelected: boolean
): void {
  const newList = membersList.map((mem: IMember) => {
    const newMem = mem;
    newMem.isSelected = isAllSelected;
    return newMem;
  });
  setMembersList(newList);
  setParentMembersList(newList);
}

export function updateMembersSplitCost(
  membersList: IMember[],
  totalCost: number,
  setMembersList: Dispatch<SetStateAction<IMember[]>>,
  setParentMembersList: Dispatch<SetStateAction<IMember[]>>
): void {
  const updatedList = membersList.map((mem: IMember) => {
    const newMem = mem;
    newMem.amount = newMem.isSelected ? totalCost / membersList.length : 0;
    return newMem;
  });
  setMembersList(updatedList);
  setParentMembersList(updatedList);
}

// New transaction page handlers and dummy data

const transactionType = {
  expense: 'paid',
  loan: 'gave',
  income: 'received',
};
const transactionMap = new Map(Object.entries(transactionType));

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
  type: string,
  payer: string,
  totalCost: number
) {
  const names = memberNames.filter((name: string) => {
    if (type === 'loan') return payer !== name;
    return true;
  });
  const list = names.map((name: string) => {
    const member = {} as IMember;
    member.name = name;
    member.isSelected = true;
    member.amount = totalCost / names.length;
    return member;
  });
  return list;
}

export function getNewSplitMemberList(
  membersList: Array<IMember>,
  totalCost: number
) {
  const selectedCount = membersList.reduce((count: number, member: IMember) => {
    if (member.isSelected) {
      return count + 1;
    }
    return count;
  }, 0);
  const list = membersList.map((selectedMember: IMember) => {
    const member = selectedMember;
    member.amount = member.isSelected ? totalCost / selectedCount : 0;
    return member;
  });
  return list;
}
