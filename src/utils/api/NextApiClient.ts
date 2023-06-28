import type {
  GroupCreation,
  PaidDebtCreation,
  TransactionCreation,
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
    };
  }

  get paidDebts() {
    return {
      create: (body: PaidDebtCreation) =>
        this.post(`/api/groups/${body.groupId}/debts`, body),
      get: (groupId: string) => this.get(`/api/groups/${groupId}/debts`),
      delete: (groupId: string, debtId: string) =>
        this.delete(`/api/groups/${groupId}/debts/${debtId}`),
    };
  }
}

export default NextApiClient;
