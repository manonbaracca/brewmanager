import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

axios.defaults.withCredentials = true
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

;(async () => {
  try { await axios.get('/api/csrf/') } catch {}
})()

function getCSRFCookie() {
  const m = document.cookie.match(/(^|;\s*)csrftoken=([^;]+)/)
  return m ? decodeURIComponent(m[2]) : null
}

axios.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = getCSRFCookie()
    if (token) config.headers['X-CSRFToken'] = token
  }
  return config
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
