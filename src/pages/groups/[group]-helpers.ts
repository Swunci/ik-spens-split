import Decimal from 'decimal.js';
import type { Dispatch } from 'react';
import { mutate } from 'swr';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type { CommentCreation } from '@/interfaces/request';
import type {
  Group,
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

function convertCurrency(
  amount: Decimal,
  exchangeRates: Map<Date, Map<string, Decimal>>,
  group: Group,
  transaction: Transaction
): [Decimal, boolean] {
  if (group.level > 0 && transaction.currency !== group.currency) {
    const rates = exchangeRates.get(transaction.date);
    if (!rates) {
      return [new Decimal(0), true];
    }
    const usdAmount = amount.dividedBy(rates.get(transaction.currency)!);
    return [
      group.currency === 'USD'
        ? usdAmount
        : usdAmount.mul(rates.get(group.currency)!).toDecimalPlaces(2),
      false,
    ];
  }
  return [amount, false];
}

function calculatePaidDebts(
  paidDebts: Array<PaidDebt>,
  membersMap: Map<string, MemberDetails>
) {
  const updatedMembersMap = membersMap;
  paidDebts.forEach((paidDebt: PaidDebt) => {
    const { creditor, debtor, amount } = paidDebt;
    updatedMembersMap.get(creditor)!.received = membersMap
      .get(creditor)!
      .received.plus(amount);
    updatedMembersMap.get(debtor)!.paid = membersMap
      .get(debtor)!
      .paid.plus(amount);
  });
  return updatedMembersMap;
}

function calculateMoneySpent(
  exchangeRates: Map<Date, Map<string, Decimal>>,
  group: Group,
  transaction: Transaction,
  membersMap: Map<string, MemberDetails>
): [Decimal, boolean, Map<string, MemberDetails>] {
  let conversionError = false;
  let amount = new Decimal(0);
  const updatedMembersMap = membersMap;
  transaction.shareCosts.forEach((split: ShareCost) => {
    const [share, shareError] = convertCurrency(
      new Decimal(split.shareCost),
      exchangeRates,
      group,
      transaction
    );
    conversionError = shareError;
    if (shareError) {
      return;
    }
    updatedMembersMap.get(split.memberId)!.cost = membersMap
      .get(split.memberId)!
      .cost.plus(share);
    amount = amount.plus(share);
    conversionError = shareError;
  });
  updatedMembersMap.get(transaction.payerId)!.paid = membersMap
    .get(transaction.payerId)!
    .paid.plus(amount);
  return [amount, conversionError, updatedMembersMap];
}

function calculateMoneyReceived(
  exchangeRates: Map<Date, Map<string, Decimal>>,
  group: Group,
  transaction: Transaction,
  membersMap: Map<string, MemberDetails>
): [Decimal, boolean, Map<string, MemberDetails>] {
  let conversionError = false;
  let amount = new Decimal(0);
  const updatedMembersMap = membersMap;
  transaction.shareCosts.forEach((split: ShareCost) => {
    const [share, shareError] = convertCurrency(
      new Decimal(split.shareCost),
      exchangeRates,
      group,
      transaction
    );
    conversionError = shareError;
    if (shareError) {
      return;
    }
    updatedMembersMap.get(split.memberId)!.cost = membersMap
      .get(split.memberId)!
      .cost.minus(share);
    amount = amount.plus(share);
  });
  updatedMembersMap.get(transaction.payerId)!.received = membersMap
    .get(transaction.payerId)!
    .received.plus(amount);
  return [amount, conversionError, updatedMembersMap];
}

export function getOverviewStats(
  transactions: Array<Transaction>,
  members: Array<Member>,
  paidDebts: Array<PaidDebt>,
  exchangeRates: Map<Date, Map<string, Decimal>>,
  group: Group
): [Decimal, Map<string, MemberDetails>, boolean] {
  let groupCost = new Decimal(0);
  let membersMap = members.reduce(
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

  membersMap = calculatePaidDebts(paidDebts, membersMap);

  const conversionError = false;
  transactions.forEach((transaction: Transaction) => {
    const type = transaction.type.toLowerCase();

    if (type === 'expense' || type === 'loan') {
      const [amount, error, updatedMap] = calculateMoneySpent(
        exchangeRates,
        group,
        transaction,
        membersMap
      );
      if (error) {
        return;
      }
      groupCost = groupCost.plus(amount);
      membersMap = updatedMap;
    }

    if (type === 'income') {
      const [amount, error, updatedMap] = calculateMoneyReceived(
        exchangeRates,
        group,
        transaction,
        membersMap
      );
      if (error) {
        return;
      }
      groupCost = groupCost.minus(amount);
      membersMap = updatedMap;
    }
  });

  membersMap.forEach((memberDetails, _memberName) => {
    const details = memberDetails;
    details.debt = memberDetails.paid
      .minus(memberDetails.cost)
      .minus(memberDetails.received);
  });

  return [groupCost, membersMap, conversionError];
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
    return false;
  }

  const nextApiClient = new NextApiClient().jsonBody();
  const response = await nextApiClient.comments.create(requestBody);

  if (!response.ok) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message: 'Failed to create comment',
    });
    return false;
  }
  dispatch({
    type: ACTION_TYPES.OPEN_SUCCESS,
    message: 'Comment created',
  });
  mutate(`/api${currentPath}/comments`);
  return true;
}
