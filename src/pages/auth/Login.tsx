import { useState, type FormEvent } from 'react'
import { Heart, LockKeyhole, Mail, ArrowRight, Loader2 } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { admin, loading, login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (admin) return <Navigate to="/" replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Unable to sign in. Check your credentials and try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-9">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/15 flex items-center justify-center mx-auto mb-5">
            <Heart className="text-pink-400" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">LovyDate</h1>
          <p className="text-xs tracking-[3px] text-zinc-500 mt-2">
            MANAGEMENT CONTROL CENTER
          </p>
        </div>

        <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white">Welcome back</h2>
          <p className="text-sm text-zinc-500 mt-2 mb-7">
            Sign in to manage your platform.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-zinc-500" size={17} />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lovydate.fun"
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-pink-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-2">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3.5 text-zinc-500" size={17} />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-pink-500/60"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-pink-500 hover:bg-pink-400 disabled:opacity-60 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition-colors"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-7">
          Authorized administrators only
        </p>
      </div>
    </div>
  )
}
