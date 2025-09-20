import axios from 'axios';

const rawBase =
  (import.meta.env?.VITE_API_BASE) ||
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    ? 'https://brewmanager.onrender.com'
    : 'http://localhost:8000');

const BASE_URL = rawBase.replace(/\/$/, '');

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

let CSRF_TOKEN = null;

export async function initCsrf() {
  try {
    const { data } = await api.get('/api/csrf/', { withCredentials: true });
    CSRF_TOKEN = data?.csrfToken || null;
  } catch {
    // no-op
  }
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    if (!CSRF_TOKEN) await initCsrf();
    if (CSRF_TOKEN) {
      config.headers = {
        ...(config.headers || {}),
        'X-CSRFToken': CSRF_TOKEN,
        'X-Requested-With': 'XMLHttpRequest',
      };
    }
  }
  return config;
});

export default api;
