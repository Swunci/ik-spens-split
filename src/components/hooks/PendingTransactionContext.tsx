import type Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';
import { createContext } from 'react';

import type { TransactionMember } from '@/pages/groups/[group]/new-transaction-helpers';

import type { PendingTransaction } from '../scan-receipt/PendingTransactionsList';

export const PendingTransactionContext = createContext<
  PendingTransactionType | undefined
>(undefined);

type PendingTransactionType = {
  splitType: string;
  setSplitType: Dispatch<SetStateAction<string>>;
  membersList: Array<TransactionMember>;
  setMembersList: Dispatch<SetStateAction<Array<TransactionMember>>>;
  transaction: PendingTransaction;
  totalCost: Decimal;
  setTotalCost: Dispatch<SetStateAction<Decimal>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
};
