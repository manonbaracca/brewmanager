import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? 'http://localhost:8000',
  withCredentials: true,
})

let CSRF_TOKEN = null

export async function initCsrf() {
  try {
    const { data } = await api.get('/api/csrf/')
    CSRF_TOKEN = data?.csrfToken || null
    if (CSRF_TOKEN) {
      api.defaults.headers.common['X-CSRFToken'] = CSRF_TOKEN
    }
  } catch {
    
  }
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

export default api
