import axios from 'axios'

// In development: Vite proxies /api → localhost:5000 (see vite.config.js)
// In production:  VITE_API_URL must be set to your deployed backend, e.g.
//                 https://himalayan-roots-api.onrender.com
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hr_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hr_admin_token')
      localStorage.removeItem('hr_admin_user')
      if (
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
