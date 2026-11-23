import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute() {
  const { admin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-pink-400 text-sm">Loading LovyDate Control Center...</div>
      </div>
    )
  }

  return admin ? <Outlet /> : <Navigate to="/login" replace />
}
