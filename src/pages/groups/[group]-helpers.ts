import type { Transaction } from '@/interfaces/response';

export interface MemberDetails {
  cost: number;
  paid: number;
  received: number;
  debt: number;
}

export function getOverviewStats(
  transactions: Array<Transaction>,
  memberNames: Array<string>
): [number, Map<string, MemberDetails>] {
  let groupCost = 0;
  const membersMap = memberNames.reduce(
    (members: Map<string, MemberDetails>, name: string) => {
      members.set(name, {
        cost: 0,
        paid: 0,
        received: 0,
        debt: 0,
      } as MemberDetails);
      return members;
    },
    new Map<string, MemberDetails>()
  );
  transactions.forEach((transaction: Transaction) => {
    const type = transaction.type.toLowerCase();
    const { payer, amount } = transaction;
    const split: Map<string, number> = new Map(
      Object.entries(JSON.parse(transaction.split))
    );

    switch (type) {
      case 'expense':
        groupCost += amount;
        membersMap.get(payer)!.paid += amount;
        split.forEach((share: number, name: string) => {
          membersMap.get(name)!.cost += share;
        });
        break;
      case 'loan':
        break;
      case 'income':
        break;
      default:
        throw Error('Unknown transaction type');
    }
  });
  membersMap.forEach((memberDetails, _memberName) => {
    const details = memberDetails;
    details.debt = memberDetails.paid - memberDetails.cost;
  });
  return [groupCost, membersMap];
}
