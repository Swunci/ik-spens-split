import type { Dispatch } from 'react';
import { mutate } from 'swr';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type { CommentCreation } from '@/interfaces/request';
import type { PaidDebt, Transaction } from '@/interfaces/response';
import NextApiClient from '@/utils/api/NextApiClient';

export interface MemberDetails {
  cost: number;
  paid: number;
  received: number;
  debt: number;
}

export function getOverviewStats(
  transactions: Array<Transaction>,
  memberNames: Array<string>,
  paidDebts: Array<PaidDebt>
): [number, Map<string, MemberDetails>] {
  let groupCost = 0;
  const membersMap = memberNames.reduce(
    (members: Map<string, MemberDetails>, name: string) => {
      members.set(name, {
        cost: 0,
        paid: 0,
        received: 0,
        debt: 0,
      } as MemberDetails);
      return members;
    },
    new Map<string, MemberDetails>()
  );
  paidDebts.forEach((paidDebt: PaidDebt) => {
    const { creditor, debtor, amount } = paidDebt;
    membersMap.get(creditor)!.received += amount;
    membersMap.get(debtor)!.paid += amount;
  });
  transactions.forEach((transaction: Transaction) => {
    const type = transaction.type.toLowerCase();
    const { payer, amount } = transaction;
    const split: Map<string, number> = new Map(
      Object.entries(JSON.parse(transaction.split))
    );

    if (type === 'expense' || type === 'loan') {
      groupCost += amount;
      membersMap.get(payer)!.paid += amount;
      split.forEach((share: number, name: string) => {
        membersMap.get(name)!.cost += share;
      });
    }
    if (type === 'income') {
      groupCost -= amount;
      membersMap.get(payer)!.received += amount;
      split.forEach((share: number, name: string) => {
        membersMap.get(name)!.cost -= share;
      });
    }
  });
  membersMap.forEach((memberDetails, _memberName) => {
    const details = memberDetails;
    details.debt =
      memberDetails.paid - memberDetails.cost - memberDetails.received;
  });
  return [groupCost, membersMap];
}

export async function createComment(
  e: React.MouseEvent,
  groupId: string,
  commenter: string,
  comment: string,
  currentPath: string,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const requestBody = {} as CommentCreation;
  requestBody.groupId = groupId;
  requestBody.commenter = commenter;
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
