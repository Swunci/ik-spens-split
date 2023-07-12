import Decimal from 'decimal.js';

import type { ShareCost } from '@/interfaces/response';
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
