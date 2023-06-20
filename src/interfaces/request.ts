export interface GroupCreation {
  groupName: string;
  currency: string;
  members: Array<string>;
}

export interface TransactionCreation {
  groupId: string;
  payer: string;
  description: string;
  totalCost: number;
  split: Map<string, number>;
  type: string;
  date: string;
}
