import axios from 'axios';
import { buildHmacHeaders } from '../utils/hmac';
console.log('API_BASE:', import.meta.env.VITE_API_URL);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const storage = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k),
};

const http = axios.create({ baseURL: API_BASE });

http.interceptors.request.use((config) => {
  const token = storage.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return http(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = storage.get('refreshToken');
      if (!refreshToken) {
        storage.del('accessToken'); storage.del('refreshToken'); storage.del('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const refreshBody = { refreshToken };
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, refreshBody, {
          headers: buildHmacHeaders(refreshBody),  // ← HMAC adicionado
        });
        storage.set('accessToken', data.accessToken);
        if (data.refreshToken) storage.set('refreshToken', data.refreshToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return http(originalRequest);
      } catch (err) {
        processQueue(err, null);
        storage.del('accessToken'); storage.del('refreshToken'); storage.del('user');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    const msg = error.response?.data?.message || error.response?.data?.error || error.message || `Erro ${error.response?.status}`;
    return Promise.reject(new Error(msg));
  }
);

const api = {
  get:     (path, params) => http.get(path, { params }).then(r => r.data),
  post:    (path, body)   => http.post(path, body).then(r => r.data),
  patch:   (path, body)   => http.patch(path, body).then(r => r.data),
  del:     (path)         => http.delete(path).then(r => r.data),
  getRaw:  (path)         => http.get(path, { responseType: 'blob' }),  // ← novo, para download
};

export default api;
export { http };