
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Bell,
  Search,
  Send,
  Clock,
  X,
  RefreshCw,
  Loader2,
  Plus,
  Users,
  Smartphone,
  CalendarDays,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowUpRight,
  Radio,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react'
import api from '../lib/api'

type Campaign = {
  id: string
  name: string
  title: string
  body: string
  status: string
  audienceType: string
  audienceCount: number
  sentCount: number
  deliveredCount: number
  openedCount: number
  failedCount: number
  createdAt: string
  sentAt?: string | null
  scheduledAt?: string | null
}

type Stats = {
  metrics: {
    sentToday: number
    deliveredToday: number
    openedToday: number
    failedToday: number
    openRate: string
  }
}

const statusStyles: Record<string, string> = {
  SENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SENDING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SCHEDULED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  CANCELLED: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
}

const formatDate = (date?: string | null) => {
  if (!date) return '—'

  const parsed = new Date(date)

  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleString()
}

const getError = (err: any) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  'Something went wrong. Please try again.'

const formatNumber = (value?: number) =>
  (value ?? 0).toLocaleString()

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        statusStyles[status] || statusStyles.DRAFT
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function NotificationPreview({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#09090c] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-pink-400" />
          <span className="text-sm font-medium text-zinc-300">
            Live preview
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-zinc-600">
          Recipient view
        </span>
      </div>

      <div className="mx-auto max-w-[320px] rounded-[28px] border border-white/10 bg-[#17171d] p-3 shadow-2xl">
        <div className="mb-4 flex items-center justify-center">
          <div className="h-1 w-12 rounded-full bg-zinc-700" />
        </div>

        <div className="mb-5 flex items-center justify-between px-2">
          <span className="text-xs font-medium text-zinc-300">
            Notifications
          </span>
          <span className="text-[10px] text-zinc-500">Now</span>
        </div>

        <div className="rounded-2xl border border-pink-500/15 bg-[#242129] p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-700 shadow-lg shadow-pink-950/40">
              <HeartIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white">LovyDate</p>
              <p className="text-[10px] text-zinc-500">App notification</p>
            </div>
            <span className="text-[10px] text-zinc-500">now</span>
          </div>

          <p className="break-words text-sm font-semibold text-white">
            {title || 'Your notification title'}
          </p>

          <p className="mt-1.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-400">
            {body || 'Your notification message will appear here.'}
          </p>
        </div>

        <div className="mt-4 flex justify-center pb-1">
          <div className="h-1 w-20 rounded-full bg-zinc-700" />
        </div>
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-zinc-600">
        Preview only. Actual appearance may vary by device.
      </p>
    </div>
  )
}

function HeartIcon() {
  return <Bell size={17} className="text-white" />
}

export default function Notifications() {
  const [items, setItems] = useState<Campaign[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [showComposer, setShowComposer] = useState(false)

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audienceType, setAudienceType] = useState('everyone')
  const [scheduleAt, setScheduleAt] = useState('')
  const [actionType, setActionType] = useState('DRAFT')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [campaignResponse, statsResponse] = await Promise.all([
        api.get('/campaigns', { params: { limit: 100 } }),
        api.get('/notifications'),
      ])

      setItems(campaignResponse.data.data?.items || [])
      setStats(statsResponse.data.data || null)
    } catch (err) {
      console.error('Notifications loading failed:', err)
      setError(getError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        `${item.name} ${item.title} ${item.body}`
          .toLowerCase()
          .includes(search.toLowerCase())

      return matchesSearch &&
        (filter === 'ALL' || item.status === filter)
    })
  }, [items, search, filter])

  const scheduledCount = items.filter(
    item => item.status === 'SCHEDULED'
  ).length

  const draftCount = items.filter(
    item => item.status === 'DRAFT'
  ).length

  const closeComposer = () => {
    setShowComposer(false)
    setName('')
    setTitle('')
    setBody('')
    setAudienceType('everyone')
    setScheduleAt('')
    setActionType('DRAFT')
  }

  const closeModals = () => {
    setSelected(null)
    closeComposer()
    setError('')
  }

  const createCampaign = async (e: FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !title.trim() || !body.trim()) {
      setError('Please complete all required fields.')
      return
    }

    if (actionType === 'SCHEDULED') {
      if (!scheduleAt || new Date(scheduleAt) <= new Date()) {
        setError('Choose a valid future date and time.')
        return
      }
    }

    if (
      actionType === 'SENT' &&
      !window.confirm(
        'This will send the notification to all selected active users. Continue?'
      )
    ) {
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const response = await api.post('/campaigns', {
        name: name.trim(),
        title: title.trim(),
        body: body.trim(),
        audienceType,
        audienceFilters: {},
        destinationType: 'open_app',
      })

      const campaign = response.data.data

      if (actionType === 'SENT') {
        await api.post(`/campaigns/${campaign.id}/send`, {})
      } else if (actionType === 'SCHEDULED') {
        await api.post(`/campaigns/${campaign.id}/schedule`, {
          scheduledAt: new Date(scheduleAt).toISOString(),
        })
      }

      closeComposer()
      await loadData()
    } catch (err) {
      console.error('Campaign action failed:', err)
      setError(getError(err))
    } finally {
      setActionLoading(false)
    }
  }

  const sendCampaign = async (campaign: Campaign) => {
    if (
      !window.confirm(
        `Send "${campaign.title}" to the selected active users now?`
      )
    ) {
      return
    }

    setActionLoading(true)
    setError('')

    try {
      await api.post(`/campaigns/${campaign.id}/send`, {})
      setSelected(null)
      await loadData()
    } catch (err) {
      setError(getError(err))
    } finally {
      setActionLoading(false)
    }
  }

  const cancelCampaign = async (campaign: Campaign) => {
    if (!window.confirm(`Cancel "${campaign.title}"?`)) return

    setActionLoading(true)
    setError('')

    try {
      await api.post(`/campaigns/${campaign.id}/cancel`, {})
      setSelected(null)
      await loadData()
    } catch (err) {
      setError(getError(err))
    } finally {
      setActionLoading(false)
    }
  }

  const cards = [
    {
      label: 'Sent · 24 hours',
      value: stats?.metrics.sentToday ?? '—',
      icon: Send,
      description: 'Notifications sent',
    },
    {
      label: 'Scheduled',
      value: scheduledCount,
      icon: Clock,
      description: 'Upcoming campaigns',
    },
    {
      label: 'Drafts',
      value: draftCount,
      icon: FileText,
      description: 'Saved campaigns',
    },
  ]

  const closeButton = (
    <button
      type="button"
      onClick={closeModals}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
      aria-label="Close"
    >
      <X size={17} />
    </button>
  )

  return (
    <div className="min-h-screen space-y-7 p-5 text-white sm:p-6 lg:p-8">

      {/* Page header */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
            <span>Engagement</span>
            <ChevronRight size={13} />
            <span className="text-pink-400">Notifications</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Notifications Center
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Create, manage and monitor your notification campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.07] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          <button
            onClick={() => {
              setError('')
              setShowComposer(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-pink-950/30 transition hover:brightness-110"
          >
            <Plus size={17} />
            Create notification
          </button>
        </div>
      </div>

      {/* Error */}
      {error && !selected && !showComposer && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-400">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, description }) => (
          <div
            key={label}
            className="group rounded-2xl border border-white/[0.07] bg-[#111114] p-5 transition hover:border-pink-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                <Icon size={18} />
              </div>
              <ArrowUpRight
                size={16}
                className="text-zinc-700 transition group-hover:text-pink-400"
              />
            </div>

            <p className="mt-5 text-sm text-zinc-400">{label}</p>

            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {typeof value === 'number'
                ? value.toLocaleString()
                : value}
            </p>

            <p className="mt-1 text-xs text-zinc-600">{description}</p>
          </div>
        ))}
      </div>

      {/* Performance stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Delivered',
              value: stats.metrics.deliveredToday,
              icon: CheckCircle2,
            },
            {
              label: 'Opened',
              value: stats.metrics.openedToday,
              icon: Eye,
            },
            {
              label: 'Failed',
              value: stats.metrics.failedToday,
              icon: AlertCircle,
            },
            {
              label: 'Open rate',
              value: stats.metrics.openRate,
              icon: Radio,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#111114] p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400">
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-zinc-500">{label}</p>
                <p className="mt-1 text-lg font-semibold">
                  {typeof value === 'number'
                    ? value.toLocaleString()
                    : value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaign history */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111114]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Campaign history</h2>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400">
                {filtered.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              All notification campaigns stored in your database.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full rounded-xl border border-white/10 bg-[#09090c] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-pink-500/50 sm:w-64"
              />
            </div>

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#09090c] px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-pink-500/50"
            >
              {[
                'ALL',
                'SENT',
                'SENDING',
                'SCHEDULED',
                'DRAFT',
                'FAILED',
                'CANCELLED',
              ].map(value => (
                <option key={value} value={value}>
                  {value === 'ALL' ? 'All statuses' : value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-4">Campaign</th>
                <th className="px-5 py-4">Audience</th>
                <th className="px-5 py-4">Sent</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading && filtered.map(item => (
                <tr
                  key={item.id}
                  className="border-b border-white/[0.04] transition hover:bg-white/[0.025]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-pink-500/10 bg-pink-500/[0.07] text-pink-400">
                        <Bell size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[250px] truncate text-sm font-medium text-zinc-200">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-zinc-600" />
                      {item.audienceType === 'everyone'
                        ? 'All active users'
                        : item.audienceType}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm tabular-nums text-zinc-300">
                    {formatNumber(item.sentCount)}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-5 py-4 text-xs text-zinc-500">
                    {formatDate(
                      item.sentAt ||
                      item.scheduledAt ||
                      item.createdAt
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        setError('')
                        setSelected(item)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-pink-500/30 hover:bg-pink-500/[0.07] hover:text-pink-300"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-zinc-500">
                    <Loader2
                      size={21}
                      className="mr-2 inline animate-spin text-pink-400"
                    />
                    Loading campaigns...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-500">
                      <Bell size={21} />
                    </div>
                    <p className="mt-3 text-sm font-medium text-zinc-300">
                      No campaigns found
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Try another search or create a notification.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal backdrop */}
      {(selected || showComposer) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !actionLoading) {
              closeModals()
            }
          }}
        >
          {/* CREATE MODAL */}
          {showComposer && !selected && (
            <div className="my-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.10] bg-[#111114] shadow-2xl shadow-black/60">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 text-pink-400">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      Create notification
                    </h2>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Compose a new campaign for LovyDate users.
                    </p>
                  </div>
                </div>
                {closeButton}
              </div>

              <form onSubmit={createCampaign}>
                <div className="grid grid-cols-1 gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_0.85fr]">
                  {/* Form fields */}
                  <div className="space-y-6">
                    {error && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-3 text-sm text-red-400">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-200">
                          Campaign name
                        </label>
                        <span className="text-[10px] text-zinc-600">
                          INTERNAL NAME
                        </span>
                      </div>
                      <input
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. November announcement"
                        className="w-full rounded-xl border border-white/[0.09] bg-[#09090c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10"
                      />
                      <p className="mt-2 text-xs text-zinc-600">
                        Only administrators use this name to identify the campaign.
                      </p>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-200">
                          Notification title
                        </label>
                        <span className="text-[10px] text-zinc-600">
                          REQUIRED
                        </span>
                      </div>
                      <input
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Write a clear notification title"
                        className="w-full rounded-xl border border-white/[0.09] bg-[#09090c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-200">
                          Message
                        </label>
                        <span className="text-[10px] text-zinc-600">
                          REQUIRED
                        </span>
                      </div>
                      <textarea
                        required
                        rows={5}
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="Write the notification message..."
                        className="w-full resize-y rounded-xl border border-white/[0.09] bg-[#09090c] px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-zinc-600 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10"
                      />
                      <p className="mt-2 text-right text-xs text-zinc-600">
                        {body.length} characters
                      </p>
                    </div>

                    {/* Audience */}
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Users size={16} className="text-pink-400" />
                        <span className="text-sm font-medium text-zinc-200">
                          Target audience
                        </span>
                      </div>

                      <select
                        value={audienceType}
                        onChange={e => setAudienceType(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#09090c] px-3 py-3 text-sm text-white outline-none focus:border-pink-500/50"
                      >
                        <option value="everyone">All active users</option>
                      </select>

                      <div className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
                        <ShieldCheck
                          size={14}
                          className="mt-0.5 shrink-0 text-emerald-400"
                        />
                        This audience targets all active app accounts.
                      </div>
                    </div>

                    {/* Delivery */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <CalendarDays size={16} className="text-pink-400" />
                        <span className="text-sm font-medium text-zinc-200">
                          Delivery method
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {[
                          {
                            value: 'DRAFT',
                            label: 'Save draft',
                            icon: FileText,
                            description: 'Send later',
                          },
                          {
                            value: 'SENT',
                            label: 'Send now',
                            icon: Send,
                            description: 'Immediate',
                          },
                          {
                            value: 'SCHEDULED',
                            label: 'Schedule',
                            icon: Clock,
                            description: 'Choose time',
                          },
                        ].map(option => {
                          const Icon = option.icon
                          const active = actionType === option.value

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setActionType(option.value)
                                setError('')
                              }}
                              className={`rounded-xl border p-3 text-left transition ${
                                active
                                  ? 'border-pink-500/50 bg-pink-500/[0.09]'
                                  : 'border-white/[0.08] bg-[#09090c] hover:border-white/20'
                              }`}
                            >
                              <Icon
                                size={17}
                                className={
                                  active ? 'text-pink-400' : 'text-zinc-500'
                                }
                              />
                              <p className="mt-2 text-xs font-semibold text-zinc-200">
                                {option.label}
                              </p>
                              <p className="mt-1 text-[10px] text-zinc-600">
                                {option.description}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {actionType === 'SCHEDULED' && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-200">
                          Schedule date and time
                        </label>
                        <input
                          required
                          type="datetime-local"
                          value={scheduleAt}
                          onChange={e => setScheduleAt(e.target.value)}
                          min={new Date(
                            Date.now() -
                            new Date().getTimezoneOffset() * 60000
                          ).toISOString().slice(0, 16)}
                          className="w-full rounded-xl border border-white/[0.09] bg-[#09090c] px-4 py-3 text-sm text-white outline-none focus:border-pink-500/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Preview column */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-pink-400" />
                      <h3 className="text-sm font-medium text-zinc-200">
                        Notification preview
                      </h3>
                    </div>

                    <NotificationPreview
                      title={title}
                      body={body}
                    />

                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <p className="text-xs font-medium text-zinc-300">
                        Campaign summary
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-zinc-500">Audience</span>
                          <span className="text-right text-zinc-300">
                            All active users
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-zinc-500">Delivery</span>
                          <span className="text-zinc-300">
                            {actionType === 'DRAFT'
                              ? 'Save as draft'
                              : actionType === 'SENT'
                                ? 'Send immediately'
                                : 'Scheduled'}
                          </span>
                        </div>
                        {actionType === 'SCHEDULED' && scheduleAt && (
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="text-zinc-500">Date</span>
                            <span className="text-right text-zinc-300">
                              {formatDate(new Date(scheduleAt).toISOString())}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {actionType === 'SENT' && (
                      <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-xs leading-relaxed text-amber-300">
                        <AlertCircle size={15} className="mt-0.5 shrink-0" />
                        Sending immediately will target all selected active users.
                        Double-check your message before continuing.
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse justify-between gap-3 border-t border-white/[0.07] bg-white/[0.015] px-5 py-4 sm:flex-row sm:items-center sm:px-7">
                  <p className="text-xs text-zinc-600">
                    Changes are saved through the LovyDate backend.
                  </p>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeModals}
                      disabled={actionLoading}
                      className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.05] disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-950/30 transition hover:brightness-110 disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : actionType === 'SENT' ? (
                        <Send size={16} />
                      ) : actionType === 'SCHEDULED' ? (
                        <Clock size={16} />
                      ) : (
                        <FileText size={16} />
                      )}

                      {actionLoading
                        ? 'Processing...'
                        : actionType === 'SENT'
                          ? 'Send notification'
                          : actionType === 'SCHEDULED'
                            ? 'Schedule notification'
                            : 'Save draft'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* VIEW CAMPAIGN MODAL */}
          {selected && (
            <div className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.10] bg-[#111114] shadow-2xl shadow-black/60">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                    <Bell size={20} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        Campaign details
                      </h2>
                      <StatusBadge status={selected.status} />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Review campaign information and performance.
                    </p>
                  </div>
                </div>
                {closeButton}
              </div>

              <div className="space-y-6 p-5 sm:p-7">
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-3 text-sm text-red-400">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Campaign identity */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                      Campaign name
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-white">
                      {selected.name}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-500">
                      Created {formatDate(selected.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                    <p className="text-xs text-zinc-500">Campaign ID</p>
                    <p className="mt-1 max-w-[180px] truncate font-mono text-xs text-zinc-300">
                      {selected.id}
                    </p>
                  </div>
                </div>

                {/* Performance metrics */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: 'Sent',
                      value: selected.sentCount,
                      icon: Send,
                      color: 'text-pink-400',
                    },
                    {
                      label: 'Delivered',
                      value: selected.deliveredCount,
                      icon: CheckCircle2,
                      color: 'text-emerald-400',
                    },
                    {
                      label: 'Opened',
                      value: selected.openedCount,
                      icon: Eye,
                      color: 'text-blue-400',
                    },
                    {
                      label: 'Failed',
                      value: selected.failedCount,
                      icon: AlertCircle,
                      color: 'text-red-400',
                    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.07] bg-[#09090c] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">{label}</span>
                        <Icon size={15} className={color} />
                      </div>
                      <p className="mt-3 text-2xl font-semibold tabular-nums">
                        {formatNumber(value)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Details and preview */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_0.85fr]">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Notification content
                      </p>

                      <div className="mt-4">
                        <p className="text-xs text-zinc-500">Title</p>
                        <p className="mt-1 text-base font-semibold text-white">
                          {selected.title}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-white/[0.06] pt-4">
                        <p className="text-xs text-zinc-500">Message</p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300">
                          {selected.body}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Delivery information
                      </p>

                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Users size={15} />
                            Audience
                          </div>
                          <span className="text-right text-sm text-zinc-200">
                            {selected.audienceType === 'everyone'
                              ? 'All active users'
                              : selected.audienceType}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <CalendarDays size={15} />
                            Created
                          </div>
                          <span className="text-right text-xs text-zinc-300">
                            {formatDate(selected.createdAt)}
                          </span>
                        </div>

                        {selected.sentAt && (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <Send size={15} />
                              Sent at
                            </div>
                            <span className="text-right text-xs text-zinc-300">
                              {formatDate(selected.sentAt)}
                            </span>
                          </div>
                        )}

                        {selected.scheduledAt && (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <Clock size={15} />
                              Scheduled
                            </div>
                            <span className="text-right text-xs text-zinc-300">
                              {formatDate(selected.scheduledAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <NotificationPreview
                      title={selected.title}
                      body={selected.body}
                    />
                  </div>
                </div>

                {/* Action warning */}
                {selected.status === 'DRAFT' && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0 text-amber-400"
                    />
                    <div>
                      <p className="text-sm font-medium text-amber-300">
                        This campaign is still a draft
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                        Sending it will deliver the notification to the selected
                        active users. Make sure the content and audience are correct.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex flex-col-reverse justify-between gap-3 border-t border-white/[0.07] bg-white/[0.015] px-5 py-4 sm:flex-row sm:items-center sm:px-7">
                <button
                  onClick={closeModals}
                  disabled={actionLoading}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.05] disabled:opacity-50"
                >
                  Close
                </button>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {['DRAFT', 'SCHEDULED'].includes(selected.status) && (
                    <button
                      disabled={actionLoading}
                      onClick={() => cancelCampaign(selected)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <X size={15} />
                      Cancel campaign
                    </button>
                  )}

                  {selected.status === 'DRAFT' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => sendCampaign(selected)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-950/30 transition hover:brightness-110 disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={15} />
                      )}
                      Send now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
