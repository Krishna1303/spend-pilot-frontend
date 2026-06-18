import { mockRequest } from './client';

export const profileApi = {
  async get() {
    return mockRequest({
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      connectedAccounts: [],
    });
  },

  async update(data) {
    return mockRequest({ ...data });
  },
};
