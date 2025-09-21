import axios from 'axios'

const RAW_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
const BASE_URL = RAW_BASE.replace(/\/+$/, '')

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

let CSRF_TOKEN = null

export async function initCsrf() {
  try {
    const { data } = await api.get('/api/csrf/')
    const t = data?.csrfToken
    if (t) {
      CSRF_TOKEN = t
      api.defaults.headers.common['X-CSRFToken'] = t
    }
  } catch {}
}

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase()
  if (['post','put','patch','delete'].includes(method) && CSRF_TOKEN) {
    config.headers = config.headers || {}
    config.headers['X-CSRFToken'] = CSRF_TOKEN
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
  }
  return config
})

api.interceptors.response.use((res) => {
  if (res?.config?.url?.endsWith('/api/csrf/') && res.data?.csrfToken) {
    CSRF_TOKEN = res.data.csrfToken
    api.defaults.headers.common['X-CSRFToken'] = CSRF_TOKEN
  }
  return res
})

export default api
