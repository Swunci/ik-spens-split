import type Decimal from 'decimal.js';
import type { Dispatch, SetStateAction } from 'react';
import { createContext } from 'react';

import type { TransactionMember } from '@/components/new-transaction/helpers';

export const TransactionContext = createContext<
  TransactionContextType | undefined
>(undefined);

type TransactionContextType = {
  payerId: string;
  setPayerId: Dispatch<SetStateAction<string>>;
  membersList: TransactionMember[];
  setMembersList: Dispatch<SetStateAction<TransactionMember[]>>;
  totalCost: Decimal;
  setTotalCost: Dispatch<SetStateAction<Decimal>>;
  transactionType: string;
  setTransactionType: Dispatch<SetStateAction<string>>;
  currency: string;
  splitType: string;
  setSplitType: Dispatch<SetStateAction<string>>;
};
