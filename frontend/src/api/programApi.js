import { http } from './httpClient.js';

export const programApi = {
  exercises: () => http('/programs/exercises'),
  athletes: () => http('/programs/athletes'),
  list: () => http('/programs'),
  detail: (id) => http(`/programs/${id}`),
  create: (payload) => http('/programs', { method: 'POST', body: JSON.stringify(payload) }),
  createFromRequest: (requestId, payload) => http(`/programs/from-request/${requestId}`, { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => http(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => http(`/programs/${id}`, { method: 'DELETE' }),
  completeWeek: (id, payload) => http(`/programs/${id}/complete-week`, { method: 'POST', body: JSON.stringify(payload) }),
};
