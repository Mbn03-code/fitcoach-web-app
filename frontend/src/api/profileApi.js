import { http } from './httpClient.js';

export const profileApi = {
  me: () => http('/profiles/me'),
  updateAthlete: (payload) => http('/profiles/athlete', { method: 'PUT', body: JSON.stringify(payload) }),
  updateCoach: (payload) => http('/profiles/coach', { method: 'PUT', body: JSON.stringify(payload) }),
};
