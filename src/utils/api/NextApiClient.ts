import type {
  CommentCreation,
  CommentUpdate,
  GroupCreation,
  GroupUpdate,
  PaidDebtCreation,
  PaidDebtUpdate,
  TransactionCreation,
  TransactionUpdate,
} from '@/interfaces/request';

import HttpClient from './HttpClient';

class NextApiClient extends HttpClient {
  constructor() {
    super({});
  }

  get groups() {
    return {
      create: (body: GroupCreation) => this.post('/api/groups', body),
      get: (groupId: string) => this.get(`/api/groups/${groupId}`),
      update: (body: GroupUpdate) =>
        this.put(`/api/groups/${body.groupId}`, body),
      delete: (groupId: string) => this.delete(`/api/groups/${groupId}`),
    };
  }

  get transactions() {
    return {
      create: (body: TransactionCreation) =>
        this.post(`/api/groups/${body.groupId}/transactions`, body),
      get: (groupId: string) => this.get(`/api/groups/${groupId}/transactions`),
      update: (body: TransactionUpdate) =>
        this.put(
          `/api/groups/${body.groupId}/transactions/${body.transactionId}`,
          body
        ),
      delete: (groupId: string, transactionId: string) =>
        this.delete(`/api/groups/${groupId}/transactions/${transactionId}`),
    };
  }

  get paidDebts() {
    return {
      create: (body: PaidDebtCreation) =>
        this.post(`/api/groups/${body.groupId}/debts`, body),
      get: (groupId: string) => this.get(`/api/groups/${groupId}/debts`),
      update: (body: PaidDebtUpdate) =>
        this.put(`/api/groups/${body.groupId}/debts/${body.debtId}`, body),
      delete: (groupId: string, debtId: string) =>
        this.delete(`/api/groups/${groupId}/debts/${debtId}`),
    };
  }

  get comments() {
    return {
      create: (body: CommentCreation) =>
        this.post(`/api/groups/${body.groupId}/comments`, body),
      get: (groupId: string) => this.get(`/api/groups/${groupId}/comments`),
      update: (body: CommentUpdate) =>
        this.put(
          `/api/groups/${body.groupId}/comments/${body.commentId}`,
          body
        ),
      delete: (groupId: string, commentId: string) =>
        this.delete(`/api/groups/${groupId}/comments/${commentId}`),
    };
  }
}

export default NextApiClient;
