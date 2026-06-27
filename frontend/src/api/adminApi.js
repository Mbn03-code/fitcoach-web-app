import { http } from './httpClient.js';

export const adminApi = {
  stats: () => http('/admin/stats'),
  users: () => http('/admin/users'),
  updateUserStatus: (id, isActive) => http(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  }),
  deleteUser: (id) => http(`/admin/users/${id}`, { method: 'DELETE' }),
  exercises: () => http('/admin/exercises'),
  createExercise: (payload) => http('/admin/exercises', { method: 'POST', body: JSON.stringify(payload) }),
  updateExercise: (id, payload) => http(`/admin/exercises/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteExercise: (id) => http(`/admin/exercises/${id}`, { method: 'DELETE' }),
  articles: () => http('/admin/articles'),
  createArticle: (payload) => http('/admin/articles', { method: 'POST', body: JSON.stringify(payload) }),
  updateArticle: (id, payload) => http(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteArticle: (id) => http(`/admin/articles/${id}`, { method: 'DELETE' }),
};
