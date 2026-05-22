import api, { http } from './api';
import { buildHmacHeaders } from '../utils/hmac';

export const authService = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  logout:   (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh:  (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const vehicleService = {
  search:        (q, page = 0, size = 12, sort = 'brand') =>
                   api.get('/vehicles/spec/search', { q, page, size, sort }),
  getById:       (id)   => api.get(`/vehicles/spec/${id}`),
  generate:      (form) => {
    const headers = buildHmacHeaders(form);
    return http.post('/vehicles/spec', form, { headers }).then(r => r.data);
  },
  compare:       (idA, idB) => api.get('/vehicles/spec/compare', { idA, idB }),
  compareBySpec: (vehicleA, vehicleB) => api.post('/vehicles/spec/compare', { vehicleA, vehicleB }),
};

export const analysisService = {
  analyze: (id) => api.get(`/analysis/${id}`),
};

export const garageService = {
  list:     ()          => api.get('/garage'),
  insights: ()          => api.get('/garage/insights'),
  add:      (body)      => api.post('/garage', body),
  update:   (id, body)  => api.patch(`/garage/${id}`, body),
  remove:   (id)        => api.del(`/garage/${id}`),
};

export const historyService = {
  list: (page = 0, size = 15, actionType) => {
    const params = { page, size };
    if (actionType && actionType !== 'ALL') params.actionType = actionType;
    return api.get('/history', params);
  },
  delete:   (id) => api.del(`/history/${id}`),
  clearAll: ()   => api.del('/history'),
};

export const comparisonService = {
  savedList: (size = 10) => api.get('/comparisons/saved', { size }),
  save:      (body)      => api.post('/comparisons/saved', body),
  delete:    (id)        => api.del(`/comparisons/saved/${id}`),
};

export const reportService = {
  generateComparison: (vehicleAId, vehicleBId, params) =>
    api.post('/reports/comparison', { vehicleAId, vehicleBId, ...params }),
  generateDossier: (vehicleId) =>
    api.post('/reports/dossier', { vehicleId }),
  download: (downloadUrl) =>
    api.getRaw(downloadUrl),
};

export const userService = {
  me:                () => api.get('/users/me'),
  update:            (body) => api.patch('/users/me', body),
  changePassword:    (body) => api.patch('/users/me/password', body),
  sessions:          ()     => api.get('/users/me/sessions'),
  revokeSession:     (id)   => api.del(`/users/me/sessions/${id}`),
  revokeAllSessions: ()     => api.del('/users/me/sessions'),

  // Admin
  listAll:    ()            => api.get('/users'),
  updateRole: (id, role)    => api.patch(`/users/${id}/role`, { role }),
};