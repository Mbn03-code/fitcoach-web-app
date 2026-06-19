import { http } from './httpClient.js';

export const authApi = {
  register: (payload) => http('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  verifySignup: (payload) => http('/auth/verify-signup', { method: 'POST', body: JSON.stringify(payload) }),
  loginPassword: (payload) => http('/auth/login-password', { method: 'POST', body: JSON.stringify(payload) }),
  requestLoginCode: (payload) => http('/auth/request-login-code', { method: 'POST', body: JSON.stringify(payload) }),
  loginCode: (payload) => http('/auth/login-code', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => http('/auth/me'),
};
