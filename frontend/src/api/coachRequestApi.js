import { http } from './httpClient.js';

export const coachRequestApi = {
  create: (payload) => http('/coach-requests', { method: 'POST', body: JSON.stringify(payload) }),
  my: () => http('/coach-requests/my'),
  incoming: () => http('/coach-requests/incoming'),
  detail: (id) => http(`/coach-requests/${id}`),
  updateStatus: (id, status) => {
    const endpoint = status === 'accepted'
      ? `/coach-requests/${id}/accept`
      : `/coach-requests/${id}/reject`;
    return http(endpoint, { method: 'POST' });
  },
};
