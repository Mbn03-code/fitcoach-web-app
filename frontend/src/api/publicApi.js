import { http } from './httpClient.js';

export const publicApi = {
  landing: () => http('/public/landing'),
};
