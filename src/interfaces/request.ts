export interface GroupCreation {
  groupName: string;
  currency: string;
  members: Array<string>;
}

export interface TransactionCreation {
  groupId: string;
  payer: string;
  description: string;
  amount: number;
  split: string;
  type: string;
  date: string;
  currency: string;
}
