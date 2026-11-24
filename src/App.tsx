import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Dashboard from './pages/Dashboard'
import ModulePage from './pages/ModulePage'
import UsersPage from './pages/Users'
import Moderation from './pages/Moderation'
// import Verification from './pages/Verification'
import Content from './pages/Content'
// import MediaLibrary from './pages/MediaLibrary'
import Analytics from './pages/Analytics'
import Notifications from './pages/Notifications'
// import Matches from './pages/Matches'
import SystemHealth from './pages/SystemHealth'
import Settings from './pages/Settings'
import Login from './pages/auth/Login'

function DashboardLayout() {
  const { admin, logout } = useAuth()

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#09090b] flex">
      <Sidebar />

      <main className="flex-1 min-w-0 w-0 overflow-x-hidden">
        <div className="flex items-center justify-between pr-6">
          <div className="flex-1 min-w-0">
            <Topbar />
          </div>
          <div className="flex items-center gap-3 pl-4">
            <span className="text-xs text-zinc-400 hidden md:block">
              {admin?.displayName || admin?.email}
            </span>
            <button
              onClick={() => void logout()}
              className="text-xs text-zinc-400 hover:text-pink-400 border border-white/10 rounded-lg px-3 py-2"
            >
              Logout
            </button>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/system-health" element={<SystemHealth />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/moderation" element={<Moderation />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* <Route path="/matches" element={<Matches />} /> */}
          {/* <Route path="/verification" element={<Verification />} /> */}
          <Route path="/content" element={<Content />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* <Route path="/media-library" element={<MediaLibrary />} /> */}
          <Route path="*" element={<ModulePage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<DashboardLayout />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
