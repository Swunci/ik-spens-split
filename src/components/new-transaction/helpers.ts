import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

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
    member.amount = getDecimalPrecisionCurrency(totalCost / names.length, 2);
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
