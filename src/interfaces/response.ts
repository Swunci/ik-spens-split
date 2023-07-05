export interface Group {
  groupId: string;
  groupName: string;
  currency: string;
  memberNames: string[];
  createdDate: Date;
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
  date: Date;
}

export interface PaidDebtResponse {
  paidDebts: Array<PaidDebt>;
}

export interface History {
  groupId: string;
  historyId: string;
  table: string;
  action: string;
  details: string;
  createdDate: Date;
}

export interface HistoryResponse {
  history: Array<History>;
}

export interface Comment {
  groupId: string;
  commentId: string;
  commenter: string;
  comment: string;
  createdDate: Date;
}

export interface CommentResponse {
  comments: Array<Comment>;
}
