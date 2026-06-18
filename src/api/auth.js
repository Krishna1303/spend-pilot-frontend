import { mockRequest, mockError } from './client';

export const authApi = {
  async login({ email, password }) {
    if (password === 'fail') {
      return mockError('Invalid email or password. Please try again.');
    }
    return mockRequest({
      user: { id: '1', name: 'Alex Johnson', email },
      token: 'mock-token-abc123',
    });
  },

  async signup({ name, email }) {
    return mockRequest({
      user: { id: '1', name, email },
      token: 'mock-token-abc123',
    });
  },
};
