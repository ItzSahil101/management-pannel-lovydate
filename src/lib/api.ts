import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_BASE = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')}/api/v1/admin`

const ACCESS_KEY = 'lovydate_admin_access'
const REFRESH_KEY = 'lovydate_admin_refresh'

export const tokenStorage = {
  getAccess: () => sessionStorage.getItem(ACCESS_KEY),
  getRefresh: () => sessionStorage.getItem(REFRESH_KEY),
  setTokens: (access: string, refresh?: string) => {
    sessionStorage.setItem(ACCESS_KEY, access)
    if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    sessionStorage.removeItem(ACCESS_KEY)
    sessionStorage.removeItem(REFRESH_KEY)
  },
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

let refreshPromise: Promise<string> | null = null

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStorage.getRefresh()

    if (!refreshToken) {
      tokenStorage.clear()
      window.dispatchEvent(new Event('admin:unauthorized'))
      return Promise.reject(error)
    }

    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${API_BASE}/auth/refresh`,
            { refreshToken },
            { withCredentials: true },
          )
          .then((response) => {
            const accessToken = response.data.data.accessToken
            tokenStorage.setTokens(accessToken)
            return accessToken
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const newToken = await refreshPromise
      original.headers.set('Authorization', `Bearer ${newToken}`)
      return api(original)
    } catch (refreshError) {
      tokenStorage.clear()
      window.dispatchEvent(new Event('admin:unauthorized'))
      return Promise.reject(refreshError)
    }
  },
)

export default api
