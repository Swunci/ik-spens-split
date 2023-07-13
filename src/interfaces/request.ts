export interface GroupCreation {
  groupName: string;
  currency: string;
  members: Array<string>;
}

export interface GroupUpdate {
  groupId: string;
  groupName: string;
  currency: string;
}

export interface ShareCost {
  memberId: string;
  shareCost: string;
}

export interface TransactionCreation {
  groupId: string;
  payerId: string;
  description: string;
  amount: string;
  splits: Array<ShareCost>;
  type: string;
  splitType: string;
  date: string;
  currency: string;
}

export interface TransactionUpdate extends TransactionCreation {
  transactionId: string;
}

export interface PaidDebtCreation {
  groupId: string;
  creditor: string;
  debtor: string;
  amount: string;
  currency: string;
}

export interface PaidDebtUpdate extends PaidDebtCreation {
  debtId: string;
}

export interface PaidDebtDeletion {
  debtId: string;
}

export interface CommentCreation {
  groupId: string;
  commenterId: string;
  comment: string;
}

export interface CommentUpdate extends CommentCreation {
  commentId: string;
}
