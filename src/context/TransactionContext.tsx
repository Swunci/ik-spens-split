import type { Dispatch, SetStateAction } from 'react';
import React from 'react';

import type { IMember } from '@/components/new-transaction/helpers';

export const TransactionContext = React.createContext<
  TransactionContextType | undefined
>(undefined);

type TransactionContextType = {
  payer: string;
  setPayer: Dispatch<SetStateAction<string>>;
  membersList: IMember[];
  setMembersList: Dispatch<SetStateAction<IMember[]>>;
  totalCost: number;
  setTotalCost: Dispatch<SetStateAction<number>>;
  transactionType: string;
  setTransactionType: Dispatch<SetStateAction<string>>;
};
