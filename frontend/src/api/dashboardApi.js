import { http } from './httpClient.js';

export const dashboardApi = {
  me: () => http('/dashboard/me'),
};
