import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
axios.defaults.withCredentials = true

let CSRF_TOKEN = null

async function initCsrf() {
  try {
    const { data } = await axios.get('/api/csrf/', { withCredentials: true })
    CSRF_TOKEN = data?.csrfToken || null
    if (CSRF_TOKEN) {
      axios.defaults.headers.common['X-CSRFToken'] = CSRF_TOKEN
    }
  } catch { /* no-op */ }
}
initCsrf()

axios.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase()
  if (['post','put','patch','delete'].includes(method) && CSRF_TOKEN) {
    config.headers = config.headers || {}
    config.headers['X-CSRFToken'] = CSRF_TOKEN
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
  }
  return config
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
