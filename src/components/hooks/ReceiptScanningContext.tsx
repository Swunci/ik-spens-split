import type { Dispatch } from 'react';
import { createContext } from 'react';

import type { Group } from '@/interfaces/response';
import type { TwoWayReadonlyMap } from '@/utils/currencyUtil';

import type { ActionType } from './snackbarReducer';

export const ReceiptScanningContext = createContext<
  ReceiptScanningContextType | undefined
>(undefined);

type ReceiptScanningContextType = {
  payerId: string;
  group: Group;
  date: string;
  currency: string;
  memberIdToNameMap: TwoWayReadonlyMap<string, string>;
  dispatch: Dispatch<ActionType>;
};
