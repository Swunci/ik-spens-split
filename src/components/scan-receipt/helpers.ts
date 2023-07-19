import Decimal from 'decimal.js';

import type { Member } from '@/interfaces/response';
import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';

import { assignRemainingToSomeone } from '../new-transaction/helpers';

export function getInitialMemberList(
  members: Array<Member>,
  totalCost: Decimal
) {
  const list = members.map((member: Member) => {
    const transactionMember = {} as TransactionMember;
    transactionMember.memberId = member.memberId;
    transactionMember.memberName = member.memberName;
    transactionMember.isSelected = true;
    transactionMember.amount = totalCost
      .dividedBy(members.length)
      .toDecimalPlaces(2);
    transactionMember.weight = 0;
    return transactionMember;
  });
  return assignRemainingToSomeone(list, totalCost, false);
}

export function getInvolvedMembers(members: Array<TransactionMember>) {
  const memberNames = new Array<string>();
  members.forEach((member: TransactionMember) => {
    if (!member.amount.equals(0)) {
      memberNames.push(member.memberName);
    }
  });
  if (memberNames.length === members.length) {
    return 'everyone';
  }
  return memberNames.join(', ');
}

export function isMemberInvolved(
  members: Array<TransactionMember>,
  memberId: string
) {
  for (let i = 0; i < members.length; i += 1) {
    if (members.at(i)!.memberId === memberId) {
      return true;
    }
  }
  return false;
}

export function getYourShare(
  members: Array<TransactionMember>,
  memberId: string
) {
  for (let i = 0; i < members.length; i += 1) {
    if (members.at(i)!.memberId === memberId) {
      return members.at(i)!.amount;
    }
  }
  return new Decimal(0);
}
