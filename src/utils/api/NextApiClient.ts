import type { GroupCreation } from '@/interfaces/request';

import HttpClient from './HttpClient';

class NextApiClient extends HttpClient {
  static debtsURL = '/api/users/current/debts';

  static friendsURL = '/api/users/current/friends';

  constructor() {
    super({});
  }

  get groups() {
    return {
      create: (groupDetails: GroupCreation) =>
        this.post('http://localhost:3000/api/groups', groupDetails),
      get: () => this.get('/api/groups'),
    };
  }

  get friends() {
    return {
      create: (friend: Object) =>
        this.post('/api/users/current/friends', friend),
      retrieve: () => this.get(NextApiClient.friendsURL),
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
