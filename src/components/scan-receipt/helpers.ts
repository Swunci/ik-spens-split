import type Decimal from 'decimal.js';

import type { Member } from '@/interfaces/response';

import type { TransactionMember } from '../new-transaction/helpers';

export function getInitialMemberList(
  members: Array<Member>,
  totalCost: Decimal
) {
  const list = members.map((member: Member) => {
    const transactionMember = {} as TransactionMember;
    transactionMember.memberId = member.memberId;
    transactionMember.memberName = member.memberName;
    transactionMember.isSelected = true;
    transactionMember.amount = totalCost.dividedBy(members.length);
    transactionMember.weight = 0;
    return transactionMember;
  });
  return list;
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
