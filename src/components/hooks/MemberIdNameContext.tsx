import { createContext } from 'react';

import type { TwoWayReadonlyMap } from '@/utils/currencyUtil';

export const MemberIdNameContext = createContext<
  MemberIdNameContextType | undefined
>(undefined);

type MemberIdNameContextType = {
  memberIdToNameMap: TwoWayReadonlyMap<string, string>;
};
