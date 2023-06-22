import type { GroupCreation, TransactionCreation } from '@/interfaces/request';

import HttpClient from './HttpClient';

class NextApiClient extends HttpClient {
  static debtsURL = '/api/users/current/debts';

  static groupsURL = '/api/groups';

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

  get debts() {
    return {
      create: (debt: Object) => this.post('/api/users/current/debts', debt),
      retrieve: () => this.get(NextApiClient.debtsURL),
    };
  }
}

export default NextApiClient;
