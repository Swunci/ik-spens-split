import type { Group, Member, ShareCost } from '@/interfaces/response';
import type { TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { currencyCodeSymbolMap } from '@/utils/currencyUtil';

export function getAction(action: string) {
  switch (action) {
    case 'put':
      return 'Updated';
    case 'post':
      return 'Added';
    case 'delete':
      return 'Deleted';
    default:
      return '';
  }
}

export function getGroupMemberNames(group: Group) {
  const memberNames = group.members.map((member: Member) => {
    return member.memberName;
  });
  return memberNames.join(', ');
}

export function displaySplit(
  splits: Array<ShareCost>,
  currencyCode: string,
  memberIdToNameMap: TwoWayReadonlyMap<string, string>
) {
  const shares = new Array<string>();
  splits.forEach((split: ShareCost) => {
    shares.push(
      `${memberIdToNameMap.get(split.memberId)}: ${currencyCodeSymbolMap.get(
        currencyCode
      )}${split.shareCost}`
    );
  });
  return shares.join(', ');
}
