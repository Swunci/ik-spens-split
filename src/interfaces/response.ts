export interface Group {
  groupId: string;
  groupName: string;
  currency: string;
  memberNames: string[];
}

export interface Transaction {
  groupId: string;
  transactionId: string;
  payer: string;
  description: string;
  amount: number;
  split: string;
  date: Date;
  type: string;
  currency: string;
}

export interface TransactionResponse {
  transactions: Array<Transaction>;
}

export interface PaidDebt {
  groupId: string;
  debtId: string;
  creditor: string;
  debtor: string;
  amount: number;
  currency: string;
}

export interface PaidDebtResponse {
  paidDebts: Array<PaidDebt>;
}
