import type { NextRouter } from 'next/router';
import type { Dispatch } from 'react';
import * as XLSX from 'xlsx';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import { ACTION_TYPES } from '@/components/hooks/snackbarReducer';
import type {
  Group,
  Member,
  PaidDebt,
  PaidDebtResponse,
  ShareCost,
  Transaction,
  TransactionResponse,
} from '@/interfaces/response';
import type { TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { getUTCDateString } from '@/utils/timeUtils';

export function handleNewGroup(
  e: React.MouseEvent,
  groupId: string,
  router: NextRouter
) {
  e.preventDefault();
  if (typeof groupId === 'string') {
    router.push('/new-group');
  }
}

export function handleEditGroup(
  e: React.MouseEvent,
  groupId: string,
  router: NextRouter
) {
  e.preventDefault();
  if (typeof groupId === 'string') {
    router.push(`/groups/${groupId}/edit`);
  }
}

export function handleHistoryClick(
  e: React.MouseEvent,
  groupId: string,
  router: NextRouter
) {
  e.preventDefault();
  if (typeof groupId === 'string') {
    router.push(`/groups/${groupId}/history`);
  }
}

export function handleExportToExcel(
  e: React.MouseEvent,
  groupData: Group,
  transactionsData: TransactionResponse,
  paidDebtsData: PaidDebtResponse,
  memberIdToNameMap: TwoWayReadonlyMap<string, string>
) {
  e.preventDefault();
  if (groupData && transactionsData && paidDebtsData) {
    const { members } = groupData;
    const jsonObjects: any[] = [];
    transactionsData.transactions.forEach((transaction: Transaction) => {
      const shareCostsWithName = new Map<string, string>();
      transaction.shareCosts.forEach((shareCost: ShareCost) => {
        shareCostsWithName.set(
          memberIdToNameMap.get(shareCost.memberId)!,
          shareCost.shareCost
        );
      });
      jsonObjects.push({
        date: getUTCDateString(transaction.date),
        payer: memberIdToNameMap.get(transaction.payerId),
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        ...Object.fromEntries(shareCostsWithName.entries()),
      });
    });

    paidDebtsData.paidDebts.forEach((paidDebt: PaidDebt) => {
      const splitMap: Map<string, string> = new Map<string, string>();
      splitMap.set(memberIdToNameMap.get(paidDebt.creditor)!, paidDebt.amount);
      members.forEach((member: Member) => {
        if (!splitMap.has(member.memberName)) {
          splitMap.set(member.memberName, '0');
        }
      });
      jsonObjects.push({
        date: getUTCDateString(paidDebt.date),
        payer: paidDebt.debtor,
        type: 'settlement',
        amount: paidDebt.amount,
        currency: paidDebt.currency,
        description: 'paid money back',
        ...Object.fromEntries(splitMap.entries()),
      });
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(jsonObjects);
    XLSX.utils.book_append_sheet(wb, ws, groupData.groupName);
    XLSX.writeFile(wb, `${groupData.groupName}.xlsx`);
  }
}

export function handleCopyGroupLink(
  e: React.MouseEvent,
  groupId: string,
  dispatch: Dispatch<ActionType>
) {
  e.preventDefault();
  if (groupId) {
    dispatch({
      type: ACTION_TYPES.OPEN_SUCCESS,
      message: 'Group link copied!',
    });
  }
}
