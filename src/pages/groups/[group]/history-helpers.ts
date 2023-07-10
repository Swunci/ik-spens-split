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

export function displaySplit(split: string, currencyCode: string) {
  const splitObj = JSON.parse(split);
  const shares = new Array<string>();
  for (const [name, share] of Object.entries(splitObj)) {
    shares.push(
      `${name}: ${currencyCodeSymbolMap.get(currencyCode)}${(
        share as number
      ).toFixed(2)}`
    );
  }
  return shares.join(', ');
}
