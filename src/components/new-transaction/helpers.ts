import Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';

import type { Member } from '@/interfaces/response';
import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';

export function assignRemainingToSomeone(
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
