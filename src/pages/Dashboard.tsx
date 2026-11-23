
import { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  Heart,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  MoreHorizontal,
} from 'lucide-react'

import StatCard from '../components/dashboard/StatCard'
import api from '../lib/api'

interface Summary {
  metrics: {
    totalUsers: { value: number }
    activeToday: { value: number }
    newUsers: { value: number }
    openReports: { value: number }
    pendingModeration: { value: number }
  }
  secondary: {
    matchesToday: { value: number }
    likesToday: { value: number }
    messagesToday: { value: number }
    postsToday: { value: number }
  }
}

interface LiveActivity {
  onlineNow: number
  messagesPerMin: number
  likesPerMin: number
  matchesPerMin: number
  timestamp: string
}

interface ChartPoint {
  date: string
  activeUsers: number
  likes: number
  matches: number
  messages: number
}

interface AuditActivity {
  id: string | number
  adminEmail: string
  action: string
  targetType: string
  createdAt: string
}

const activities = [
  { title: 'User Management', detail: 'Manage platform accounts', icon: Users },
  { title: 'Content Moderation', detail: 'Review flagged content', icon: ShieldAlert },
  { title: 'Platform Analytics', detail: 'Monitor platform performance', icon: Activity },
]

const formatNumber = (value?: number) =>
  typeof value === 'number' ? value.toLocaleString() : '—'

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [live, setLive] = useState<LiveActivity | null>(null)
  const [chart, setChart] = useState<ChartPoint[]>([])
  const [recentActivity, setRecentActivity] = useState<AuditActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      try {
        const [summaryRes, liveRes, chartRes, activityRes] =
          await Promise.all([
            api.get('/dashboard/summary', { params: { range: '7D' } }),
            api.get('/dashboard/live'),
            api.get('/dashboard/chart', { params: { period: '7D' } }),
            api.get('/dashboard/activity', { params: { limit: 5 } }),
          ])

        if (!active) return

        setSummary(summaryRes.data.data)
        setLive(liveRes.data.data)
        setChart(chartRes.data.data)
        setRecentActivity(activityRes.data.data)
        setError('')
      } catch (err) {
        if (!active) return

        console.error('Dashboard loading failed:', err)
        setError('Unable to load dashboard data. Please try again.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()

    const interval = window.setInterval(async () => {
      try {
        const response = await api.get('/dashboard/live')
        if (active) setLive(response.data.data)
      } catch (err) {
        console.error('Live activity refresh failed:', err)
      }
    }, 15000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  const stats = [
    {
      title: 'Total Users',
      value: formatNumber(summary?.metrics.totalUsers.value),
      change: 'All registered accounts',
      icon: Users,
      description: 'Registered platform accounts',
    },
    {
      title: 'New Registrations',
      value: formatNumber(summary?.metrics.newUsers.value),
      change: 'Last 24 hours',
      icon: UserPlus,
      description: 'Recently created accounts',
    },
    {
      title: 'Matches Today',
      value: formatNumber(summary?.secondary.matchesToday.value),
      change: 'Last 24 hours',
      icon: Heart,
      description: 'Matches created today',
    },
    {
      title: 'Pending Reports',
      value: formatNumber(summary?.metrics.openReports.value),
      change: 'Awaiting review',
      icon: ShieldAlert,
      description: 'Open and in-review reports',
    },
  ]

  const maxActivity = Math.max(
    1,
    ...chart.flatMap((item) => [
      item.activeUsers,
      item.likes,
      item.matches,
      item.messages,
    ]),
  )

  const chartMetrics = [
    { key: 'activeUsers', label: 'Active users', color: 'bg-pink-500/70', legend: 'bg-pink-400' },
    { key: 'likes', label: 'Likes', color: 'bg-blue-500/70', legend: 'bg-blue-400' },
    { key: 'matches', label: 'Matches', color: 'bg-violet-500/70', legend: 'bg-violet-400' },
    { key: 'messages', label: 'Messages', color: 'bg-emerald-500/70', legend: 'bg-emerald-400' },
  ] as const

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Platform Overview
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Monitor and manage your LovyDate platform.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className={`w-2 h-2 rounded-full ${
            live ? 'bg-emerald-400' : 'bg-zinc-500'
          }`} />
          <span className={`text-xs ${
            live ? 'text-emerald-400' : 'text-zinc-400'
          }`}>
            {live ? 'Live data connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
            value={loading ? '...' : stat.value}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-[#111115] border border-white/[0.07] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold">Platform Activity</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Daily platform activity · Last 7 days
              </p>
            </div>
            <MoreHorizontal size={20} className="text-zinc-500" />
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-sm text-zinc-500">
              Loading analytics...
            </div>
          ) : chart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-zinc-500">
              No activity data available yet.
            </div>
          ) : (
            <div className="h-64 flex items-end gap-3 sm:gap-5 px-2 pt-4">
              {chart.map((item) => (
                <div
                  key={item.date}
                  className="flex-1 min-w-0 h-full flex flex-col items-center"
                >
                  <div className="flex-1 w-full flex items-end justify-center gap-1">
                    {chartMetrics.map((metric) => {
                      const value = item[metric.key]

                      return (
                        <div
                          key={metric.key}
                          title={`${item.date} · ${metric.label}: ${formatNumber(value)}`}
                          className={`flex-1 max-w-4 rounded-t-sm ${metric.color} transition-colors hover:opacity-100`}
                          style={{
                            height: value > 0
                              ? `${Math.max(3, (value / maxActivity) * 75)}%`
                              : '0%',
                          }}
                        />
                      )
                    })}
                  </div>

                  <span className="pt-2 text-[10px] text-zinc-500 whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-5 mt-5">
            {chartMetrics.map((metric) => (
              <div
                key={metric.key}
                className="flex items-center gap-2 text-xs text-zinc-400"
              >
                <span className={`w-2 h-2 rounded-full ${metric.legend}`} />
                {metric.label}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111115] border border-white/[0.07] rounded-xl p-6">
          <h2 className="text-white font-semibold">Live Activity</h2>
          <p className="text-xs text-zinc-500 mt-1 mb-6">
            Updated automatically every 15 seconds
          </p>

          <div className="space-y-5">
            {[
              { label: 'Online Now', value: live?.onlineNow },
              { label: 'Messages / min', value: live?.messagesPerMin },
              { label: 'Likes / min', value: live?.likesPerMin },
              { label: 'Matches / min', value: live?.matchesPerMin },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{item.label}</span>
                <span className="text-lg font-semibold text-white">
                  {live ? formatNumber(item.value) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-[#111115] border border-white/[0.07] rounded-xl p-6">
          <h2 className="text-white font-semibold">Recent Admin Activity</h2>
          <p className="text-xs text-zinc-500 mt-1 mb-6">
            Latest recorded management actions
          </p>

          {loading ? (
            <p className="text-sm text-zinc-500">Loading activity...</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-zinc-500">No admin activity recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b border-white/[0.05] pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium">
                      {item.action}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 truncate">
                      {item.adminEmail} · {item.targetType || 'System'}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#111115] border border-white/[0.07] rounded-xl p-6">
          <h2 className="text-white font-semibold">Quick Management</h2>
          <p className="text-xs text-zinc-500 mt-1 mb-6">
            Platform management shortcuts
          </p>

          <div className="space-y-3">
            {activities.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]"
                >
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Icon size={18} className="text-pink-400" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{item.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">{item.detail}</p>
                  </div>

                  <ArrowUpRight size={16} className="text-zinc-600" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
