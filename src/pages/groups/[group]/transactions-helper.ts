import Decimal from 'decimal.js';

import type { PaidDebt, ShareCost, Transaction } from '@/interfaces/response';
import type { TwoWayReadonlyMap } from '@/utils/currencyUtil';

export function getYourShare(splits: Array<ShareCost>, memberId: string) {
  for (let i = 0; i < splits.length; i += 1) {
    const split = splits.at(i)!;
    if (split.memberId === memberId) {
      return new Decimal(split.shareCost);
    }
  }
  return new Decimal(0);
}

export function getInvolvedMembers(
  splits: Array<ShareCost>,
  idNameMap: TwoWayReadonlyMap<string, string>
) {
  const memberNames = new Array<string>();
  splits.forEach((split: ShareCost) => {
    if (!new Decimal(split.shareCost).equals(0)) {
      memberNames.push(idNameMap.get(split.memberId)!);
    }
  });
  if (memberNames.length === idNameMap.map.size) {
    return 'everyone';
  }
  return memberNames.join(', ');
}

export function isMemberInvolved(splits: Array<ShareCost>, memberId: string) {
  for (let i = 0; i < splits.length; i += 1) {
    const split = splits.at(i)!;
    if (
      split.memberId === memberId &&
      !new Decimal(split.shareCost).equals(0)
    ) {
      return true;
    }
  }
  return false;
}

export function separateTransactions(
  currentMemberId: string,
  transactions: Array<Transaction>
): [Array<Transaction>, Array<Transaction>] {
  const myTransactions = new Array<Transaction>();
  const otherTransactions = new Array<Transaction>();

  transactions.forEach((transaction: Transaction) => {
    if (isMemberInvolved(transaction.shareCosts, currentMemberId)) {
      myTransactions.push(transaction);
    } else {
      otherTransactions.push(transaction);
    }
  });
  return [myTransactions, otherTransactions];
}

export function separatePaidDebts(
  currentMemberId: string,
  paidDebts: Array<PaidDebt>
): [Array<PaidDebt>, Array<PaidDebt>] {
  const myPaidDebts = new Array<PaidDebt>();
  const otherPaidDebts = new Array<PaidDebt>();

  paidDebts.forEach((paidDebt: PaidDebt) => {
    if (
      paidDebt.creditor === currentMemberId ||
      paidDebt.debtor === currentMemberId
    ) {
      myPaidDebts.push(paidDebt);
    } else {
      otherPaidDebts.push(paidDebt);
    }
  });
  return [myPaidDebts, otherPaidDebts];
}
