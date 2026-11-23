import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import api, { tokenStorage } from '../lib/api'

export interface Admin {
  id: string
  email: string
  displayName: string
  avatarUrl?: string | null
  roles: string[]
  permissions: string[]
}

interface AuthContextType {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  const clearAuth = useCallback(() => {
    tokenStorage.clear()
    setAdmin(null)
  }, [])

  useEffect(() => {
    let active = true

    const restoreSession = async () => {
      const refreshToken = tokenStorage.getRefresh()

      if (!refreshToken) {
        if (active) setLoading(false)
        return
      }

      try {
        const response = await api.post('/auth/refresh', { refreshToken })
        const result = response.data.data

        tokenStorage.setTokens(result.accessToken)
        if (active) setAdmin(result.admin)
      } catch {
        clearAuth()
      } finally {
        if (active) setLoading(false)
      }
    }

    restoreSession()

    const handleUnauthorized = () => clearAuth()
    window.addEventListener('admin:unauthorized', handleUnauthorized)

    return () => {
      active = false
      window.removeEventListener('admin:unauthorized', handleUnauthorized)
    }
  }, [clearAuth])

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const result = response.data.data

    tokenStorage.setTokens(result.accessToken, result.refreshToken)
    setAdmin(result.admin)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      clearAuth()
    }
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
