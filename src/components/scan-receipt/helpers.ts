import Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';

import type { TransactionCreation } from '@/interfaces/request';
import type { Member, ShareCost } from '@/interfaces/response';
import NextApiClient from '@/utils/api/NextApiClient';

import { ACTION_TYPES, type ActionType } from '../hooks/snackbarReducer';
import {
  assignRemainingToSomeone,
  mathChecksOut,
  type TransactionMember,
} from '../new-transaction/helpers';
import type { PendingTransaction } from './PendingTransactionsList';

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

export interface MultiTransactionCreationForm {
  groupId: string;
  payerId: string;
  transactions: Array<PendingTransaction>;
  type: string;
  date: string;
  currency: string;
}

export async function handleCreateTransactions(
  e: React.MouseEvent,
  formDetails: MultiTransactionCreationForm,
  setTransactions: Dispatch<SetStateAction<Array<PendingTransaction>>>,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  const { groupId } = formDetails;
  const { payerId } = formDetails;
  const { transactions } = formDetails;
  const { type } = formDetails;
  const { date } = formDetails;
  const { currency } = formDetails;

  const nextApiClient = new NextApiClient().jsonBody();

  const results: Array<string> = await Promise.all(
    transactions.map(async (transaction: PendingTransaction) => {
      console.log(
        `${transaction.description}: ${!mathChecksOut(
          transaction.membersList,
          transaction.amount
        )} `
      );
      if (
        transaction.amount.greaterThan(10 ** 9) ||
        transaction.amount.lessThanOrEqualTo(0) ||
        !mathChecksOut(transaction.membersList, transaction.amount)
      ) {
        return '';
      }

      const requestBody: TransactionCreation = {} as TransactionCreation;
      requestBody.groupId = groupId;
      requestBody.payerId = payerId;
      requestBody.type = type.toLowerCase();
      requestBody.date = date;
      requestBody.currency = currency;
      requestBody.splitType = transaction.splitType.toLowerCase();
      requestBody.amount = transaction.amount.toFixed(2);
      requestBody.description = transaction.description;
      requestBody.splits = transaction.membersList.map(
        (member: TransactionMember) => {
          return {
            memberId: member.memberId,
            shareCost: member.amount.toString(),
            weight: member.weight,
          } as ShareCost;
        }
      );
      requestBody.currency = currency;
      const response = await nextApiClient.transactions.create(requestBody);

      if (!response.ok) {
        return '';
      }
      return transaction.id;
    })
  );

  const successfullIds = new Set(results);
  const failedTransactions = transactions.filter(
    (transaction: PendingTransaction) => {
      return !successfullIds.has(transaction.id);
    }
  );
  setTransactions(failedTransactions);
  if (failedTransactions.length > 0) {
    dispatch({
      type: ACTION_TYPES.OPEN_ERROR,
      message: 'Failed to create some transactions',
    });
  } else {
    dispatch({
      type: ACTION_TYPES.OPEN_SUCCESS,
      message: 'Successfully created all transactions',
    });
  }
}
