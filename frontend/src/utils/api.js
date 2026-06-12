import axios from 'axios'

// Axios instance using relative API path.
// When running locally, Vite's proxy forwards it to 8000.
// When running in Docker/Nginx, Nginx handles routing.
const api = axios.create({
  baseURL: '/api'
})

// Request Interceptor to append JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lira_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor to capture auth errors (e.g. expired tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('lira_token')
      localStorage.removeItem('lira_user')
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api
