import type {
  GroupCreation,
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
}

export default NextApiClient;
