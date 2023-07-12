import Decimal from 'decimal.js';
import type { Dispatch } from 'react';
import { mutate } from 'swr';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type { CommentCreation } from '@/interfaces/request';
import type {
  Member,
  PaidDebt,
  ShareCost,
  Transaction,
} from '@/interfaces/response';
import NextApiClient from '@/utils/api/NextApiClient';

export interface MemberDetails {
  cost: Decimal;
  paid: Decimal;
  received: Decimal;
  debt: Decimal;
}

export function getOverviewStats(
  transactions: Array<Transaction>,
  members: Array<Member>,
  paidDebts: Array<PaidDebt>
): [Decimal, Map<string, MemberDetails>] {
  let groupCost = new Decimal(0);
  const membersMap = members.reduce(
    (map: Map<string, MemberDetails>, member: Member) => {
      map.set(member.memberId, {
        cost: new Decimal(0),
        paid: new Decimal(0),
        received: new Decimal(0),
        debt: new Decimal(0),
      } as MemberDetails);
      return map;
    },
    new Map<string, MemberDetails>()
  );
  paidDebts.forEach((paidDebt: PaidDebt) => {
    const { creditor, debtor, amount } = paidDebt;
    membersMap.get(creditor)!.received = membersMap
      .get(creditor)!
      .received.plus(amount);
    membersMap.get(debtor)!.paid = membersMap.get(debtor)!.paid.plus(amount);
  });
  transactions.forEach((transaction: Transaction) => {
    const type = transaction.type.toLowerCase();
    const { payerId, amount } = transaction;

    if (type === 'expense' || type === 'loan') {
      groupCost = groupCost.plus(amount);
      membersMap.get(payerId)!.paid = membersMap
        .get(payerId)!
        .paid.plus(amount);
      transaction.shareCosts.forEach((split: ShareCost) => {
        membersMap.get(split.memberId)!.cost = membersMap
          .get(split.memberId)!
          .cost.plus(split.shareCost);
      });
    }
    if (type === 'income') {
      groupCost = groupCost.minus(amount);
      membersMap.get(payerId)!.received = membersMap
        .get(payerId)!
        .received.plus(amount);
      transaction.shareCosts.forEach((split: ShareCost) => {
        membersMap.get(split.memberId)!.cost = membersMap
          .get(split.memberId)!
          .cost.minus(split.shareCost);
      });
    }
  });
  membersMap.forEach((memberDetails, _memberName) => {
    const details = memberDetails;
    details.debt = memberDetails.paid
      .minus(memberDetails.cost)
      .minus(memberDetails.received);
  });
  return [groupCost, membersMap];
}

export async function createComment(
  e: React.MouseEvent,
  groupId: string,
  commenterId: string,
  comment: string,
  currentPath: string,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const requestBody = {} as CommentCreation;
  requestBody.groupId = groupId;
  requestBody.commenterId = commenterId;
  requestBody.comment = comment.trim();

  if (requestBody.comment === '') {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message: 'Comment is empty',
    });
    return;
  }

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.comments.create(requestBody);

  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message: 'Failed to create comment',
    });
    return;
  }
  dispatch({
    type: ACTION_TYPES.OPEN_SUCCESS,
    message: 'Comment created',
  });
  mutate(`/api${currentPath}/comments`);
}
