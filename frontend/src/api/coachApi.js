import { http } from './httpClient.js';

export const coachApi = {
  list: () => http('/coaches'),
  detail: (id) => http(`/coaches/${id}`),
};
