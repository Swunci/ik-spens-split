export interface Group {
  groupId: string;
  groupName: string;
  currency: string;
  members: Array<Member>;
  createdDate: Date;
  level: number;
}

export interface GroupList {
  groups: Array<Group>;
}

export interface Member {
  memberId: string;
  memberName: string;
}

export interface ShareCost {
  memberId: string;
  shareCost: string;
  weight: number;
}

export interface Transaction {
  groupId: string;
  transactionId: string;
  payerId: string;
  description: string;
  amount: string;
  shareCosts: Array<ShareCost>;
  date: Date;
  type: string;
  splitType: string;
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
  amount: string;
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
  commenterId: string;
  comment: string;
  createdDate: Date;
}

export interface CommentResponse {
  comments: Array<Comment>;
}
