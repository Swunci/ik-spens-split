import type { Dispatch, SetStateAction } from 'react';
import { createContext } from 'react';

import type { Group } from '@/interfaces/response';
import type { TwoWayReadonlyMap } from '@/utils/currencyUtil';

import type { PendingTransaction } from '../scan-receipt/PendingTransactionsList';
import type { ActionType } from './snackbarReducer';

export const ReceiptScanningContext = createContext<
  ReceiptScanningContextType | undefined
>(undefined);

type ReceiptScanningContextType = {
  payerId: string;
  group: Group;
  currency: string;
  memberIdToNameMap: TwoWayReadonlyMap<string, string>;
  currentMemberId: string;
  transactions: Array<PendingTransaction>;
  setTransactions: Dispatch<SetStateAction<Array<PendingTransaction>>>;
  dispatch: Dispatch<ActionType>;
};
