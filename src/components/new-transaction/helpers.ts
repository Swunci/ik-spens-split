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
  numSelected: number,
  setMembersList: Dispatch<SetStateAction<IMember[]>>,
  setParentMembersList: Dispatch<SetStateAction<IMember[]>>
): void {
  const updatedList = membersList.map((mem: IMember) => {
    const newMem = mem;
    newMem.amount =
      numSelected !== 0 && newMem.isSelected ? totalCost / numSelected : 0;
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
  setAction: Dispatch<SetStateAction<string>>
) {
  const newType = e.target.value.toLowerCase();
  const newAction = transactionMap.get(newType);
  setAction(newAction!);
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
