
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search, Image, MessageSquare, FileText, Eye, RefreshCw,
  Loader2, X, Trash2, RotateCcw, ChevronDown, AlertTriangle
} from 'lucide-react'
import api from '../lib/api'

type Tab = 'feed' | 'photos' | 'comments'

type ContentItem = {
  id: string
  postId?: string | null
  userId?: string
  content?: string
  commentText?: string
  url?: string
  photos?: string[]
  authorName?: string | null
  authorEmail?: string
  userName?: string | null
  userEmail?: string
  moderationStatus: string
  createdAt: string
  reportsCount?: number
  likesCount?: number
  commentsCount?: number
  sourceType?: 'profile' | 'post'
  isPrimary?: boolean
}

const tabs: { id: Tab; label: string; icon: typeof Image }[] = [
  { id: 'feed', label: 'Posts', icon: FileText },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
]

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

function pretty(value?: string) {
  if (!value) return 'Unknown'
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function statusStyle(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-500/10 text-emerald-400'
    case 'pending_review':
      return 'bg-amber-500/10 text-amber-400'
    case 'removed':
    case 'rejected':
      return 'bg-red-500/10 text-red-400'
    default:
      return 'bg-white/5 text-zinc-400'
  }
}

export default function Content() {
  const [tab, setTab] = useState<Tab>('feed')
  const [items, setItems] = useState<ContentItem[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [removeTarget, setRemoveTarget] = useState<ContentItem | null>(null)
  const [reason, setReason] = useState('')

  const fetchItems = useCallback(async (cursor?: string, append = false) => {
    try {
      setLoading(true)
      setError('')

      const params: Record<string, string | number> = { limit: 25 }
      if (status !== 'all') params.status = status
      if (cursor) params.cursor = cursor

      const response = await api.get(`/content/${tab}`, { params })
      const result = response.data.data
      const incoming: ContentItem[] = result.items || []

      setItems(previous => append ? [...previous, ...incoming] : incoming)
      setNextCursor(result.nextCursor || null)
      setHasMore(Boolean(result.hasMore))
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Unable to load content.')
    } finally {
      setLoading(false)
    }
  }, [tab, status])

  useEffect(() => {
    setItems([])
    setNextCursor(null)
    fetchItems()
  }, [fetchItems])

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items

    return items.filter(item => [
      item.id,
      item.content,
      item.commentText,
      item.authorName,
      item.authorEmail,
      item.userName,
      item.userEmail,
    ].some(value => value?.toLowerCase().includes(term)))
  }, [items, search])

  async function restoreContent(item: ContentItem) {
    try {
      setActionLoading(true)
      setError('')

      const type = tab === 'feed'
        ? 'post'
        : tab === 'comments'
          ? 'comment'
          : item.sourceType === 'post'
            ? 'post_photo'
            : 'photo'

      await api.post(`/content/${type}/${item.id}/restore`, {})
      await fetchItems()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Restore failed.')
    } finally {
      setActionLoading(false)
    }
  }

  async function performModeration(action: 'remove' | 'restore') {
    const target = removeTarget
    if (!target) return

    if (action === 'remove' && !reason.trim()) {
      setError('Please provide a reason for removing this content.')
      return
    }

    const contentType = tab === 'feed'
      ? 'post'
      : tab === 'comments'
        ? 'comment'
        : target.sourceType === 'post'
          ? 'post_photo'
          : 'photo'

    try {
      setActionLoading(true)
      setError('')

      await api.post(
        `/content/${contentType}/${target.id}/${action}`,
        action === 'remove' ? { reason: reason.trim() } : {}
      )

      setRemoveTarget(null)
      setReason('')
      setSelected(null)
      await fetchItems()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Moderation action failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const activeCount = items.length
  const removedCount = items.filter(item =>
    ['removed', 'rejected'].includes(item.moderationStatus)
  ).length
  const pendingCount = items.filter(item =>
    item.moderationStatus === 'pending_review'
  ).length
  const reportCount = items.reduce(
    (sum, item) => sum + (item.reportsCount || 0),
    0
  )

  function getContentText(item: ContentItem) {
    return tab === 'feed'
      ? item.content
      : tab === 'comments'
        ? item.commentText
        : item.sourceType === 'post'
          ? 'Photo attached to a post'
          : item.isPrimary
            ? 'Primary profile photo'
            : 'Profile photo'
  }

  function getAuthor(item: ContentItem) {
    return item.authorName || item.userName || 'Unknown user'
  }

  function getEmail(item: ContentItem) {
    return item.authorEmail || item.userEmail || ''
  }

  return (
    <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 text-white overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">Platform / Content</p>
          <h1 className="text-2xl font-semibold mt-1">Content Management</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Review and manage live posts, photos, and comments.
          </p>
        </div>

        <button
          onClick={() => fetchItems()}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-[#111115] text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          <span className="break-words min-w-0">{error}</span>
          <button
            onClick={() => setError('')}
            className="shrink-0"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Loaded content', value: activeCount, icon: FileText },
          { label: 'Pending review', value: pendingCount, icon: AlertTriangle },
          { label: 'Removed / rejected', value: removedCount, icon: Trash2 },
          { label: 'Reports on loaded items', value: reportCount, icon: MessageSquare },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="min-w-0 rounded-xl border border-white/[0.07] bg-[#111115] p-3 sm:p-5"
          >
            <div className="flex justify-between items-start gap-2">
              <p className="text-xs sm:text-sm text-zinc-400">{label}</p>
              <Icon size={18} className="text-zinc-500 shrink-0" />
            </div>
            <p className="text-2xl font-semibold mt-3">{value}</p>
            <p className="text-[10px] sm:text-[11px] text-zinc-600 mt-1">
              Current tab and loaded results
            </p>
          </div>
        ))}
      </div>

      {/* Content library */}
      <div className="min-w-0 rounded-xl border border-white/[0.07] bg-[#111115] overflow-hidden">

        {/* Search and status filters */}
        <div className="p-4 sm:p-5 border-b border-white/[0.07] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-semibold">Content Library</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Showing {visibleItems.length} loaded records
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 min-w-0">
            <div className="relative min-w-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search content or users..."
                className="w-full sm:w-64 min-w-0 rounded-lg border border-white/10 bg-[#09090c] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-pink-500/50"
              />
            </div>

            <div className="relative min-w-0">
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/10 bg-[#09090c] px-3 py-2.5 pr-9 text-sm outline-none"
              >
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="pending_review">Pending review</option>
                <option value="removed">Removed</option>
                {tab === 'photos' && (
                  <option value="rejected">Rejected</option>
                )}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-3 sm:p-4 border-b border-white/[0.05]">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id)
                setSearch('')
                setStatus('all')
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2.5 text-xs sm:text-sm transition ${
                tab === id
                  ? 'bg-pink-500/15 text-pink-300 border border-pink-500/20'
                  : 'bg-white/[0.03] text-zinc-400 border border-transparent hover:bg-white/[0.06]'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-4">Content</th>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Reports</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500">
                    <Loader2 className="mx-auto animate-spin mb-3" size={22} />
                    Loading content...
                  </td>
                </tr>
              ) : visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-zinc-500">
                    No content found.
                  </td>
                </tr>
              ) : visibleItems.map(item => (
                <tr
                  key={`${item.sourceType || tab}-${item.id}`}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 max-w-[360px]">
                    <div className="flex items-start gap-3">
                      {item.url ? (
                        <img
                          src={item.url}
                          alt="Content"
                          className="h-14 w-14 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          {tab === 'comments'
                            ? <MessageSquare size={19} />
                            : <FileText size={19} />}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-sm text-zinc-200 line-clamp-2">
                          {getContentText(item) || 'No text content'}
                        </p>
                        <p className="text-[11px] text-zinc-600 mt-1 break-all">
                          {item.id}
                        </p>
                        {item.sourceType === 'post' && (
                          <p className="text-[11px] text-amber-400 mt-1">
                            Part of a post
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm">{getAuthor(item)}</p>
                    <p className="text-xs text-zinc-500 mt-1">{getEmail(item)}</p>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${statusStyle(item.moderationStatus)}`}>
                      {pretty(item.moderationStatus)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-400">
                    {item.reportsCount || 0}
                  </td>

                  <td className="px-5 py-4 text-xs text-zinc-400">
                    {formatDate(item.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelected(item)}
                        title="View details"
                        className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-pink-300"
                      >
                        <Eye size={16} />
                      </button>

                      {item.moderationStatus === 'approved' ? (
                        <button
                          onClick={() => {
                            setRemoveTarget(item)
                            setReason('')
                          }}
                          title="Remove content"
                          className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => restoreContent(item)}
                          disabled={actionLoading}
                          title="Restore content"
                          className="rounded-lg p-2 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-300 disabled:opacity-50"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile content cards */}
        <div className="md:hidden divide-y divide-white/[0.06]">
          {loading && items.length === 0 ? (
            <div className="py-14 text-center text-zinc-500">
              <Loader2 className="mx-auto animate-spin mb-3" size={22} />
              <p className="text-sm">Loading content...</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="py-14 text-center text-sm text-zinc-500">
              No content found.
            </div>
          ) : visibleItems.map(item => (
            <div
              key={`${item.sourceType || tab}-${item.id}`}
              className="p-4 space-y-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                {item.url ? (
                  <img
                    src={item.url}
                    alt="Content"
                    className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    {tab === 'comments'
                      ? <MessageSquare size={20} className="text-zinc-400" />
                      : <FileText size={20} className="text-zinc-400" />}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-200 line-clamp-3 break-words">
                    {getContentText(item) || 'No text content'}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-1 break-all">
                    {item.id}
                  </p>
                  {item.sourceType === 'post' && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      Part of a post
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-white/[0.03] p-3 space-y-2">
                <div>
                  <p className="text-[11px] text-zinc-500">User</p>
                  <p className="text-sm text-zinc-200 break-words">
                    {getAuthor(item)}
                  </p>
                  {getEmail(item) && (
                    <p className="text-xs text-zinc-500 break-all">
                      {getEmail(item)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-2">
                  <div>
                    <p className="text-[11px] text-zinc-500">Reports</p>
                    <p className="text-sm text-zinc-300">
                      {item.reportsCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500">Date</p>
                    <p className="text-xs text-zinc-300">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs ${statusStyle(item.moderationStatus)}`}>
                  {pretty(item.moderationStatus)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelected(item)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:border-pink-500/30 hover:text-pink-300"
                  >
                    <Eye size={14} />
                    Details
                  </button>

                  {item.moderationStatus === 'approved' ? (
                    <button
                      onClick={() => {
                        setRemoveTarget(item)
                        setReason('')
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => restoreContent(item)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 disabled:opacity-50"
                    >
                      <RotateCcw size={14} />
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {hasMore && (
          <div className="p-4 border-t border-white/[0.06] flex justify-center">
            <button
              disabled={loading || !nextCursor}
              onClick={() => nextCursor && fetchItems(nextCursor, true)}
              className="w-full sm:w-auto rounded-lg border border-white/10 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>

      {/* Content details modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start sm:items-center justify-center overflow-y-auto p-0 sm:p-4">
          <div className="w-full sm:max-w-xl min-h-full sm:min-h-0 sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-xl border-0 sm:border border-white/10 bg-[#151518] p-4 sm:p-6">
            <div className="flex justify-between items-center mb-5 sticky top-0 bg-[#151518] py-2 z-10">
              <h2 className="font-semibold">Content details</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={19} />
              </button>
            </div>

            {selected.url && (
              <img
                src={selected.url}
                alt="Content preview"
                className="w-full max-h-80 object-contain rounded-lg bg-black mb-4"
              />
            )}

            {!!selected.photos?.length && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {selected.photos.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt="Post attachment"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <p className="text-xs text-zinc-500">Content</p>
            <p className="text-sm mt-1 whitespace-pre-wrap break-words">
              {selected.content ||
                selected.commentText ||
                (selected.sourceType === 'post'
                  ? 'Photo attached to a post'
                  : 'Photo')}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <p className="text-xs text-zinc-500">Author</p>
                <p className="text-sm mt-1 break-words">
                  {selected.authorName || selected.userName || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Status</p>
                <p className="text-sm mt-1">
                  {pretty(selected.moderationStatus)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Reports</p>
                <p className="text-sm mt-1">
                  {selected.reportsCount || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Created</p>
                <p className="text-sm mt-1">
                  {formatDate(selected.createdAt)}
                </p>
              </div>
            </div>

            {selected.sourceType === 'post' && (
              <p className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                This photo belongs to a post. Removing it will remove the entire parent post, not just this photo.
              </p>
            )}

            <button
              onClick={() => setSelected(null)}
              className="w-full mt-6 rounded-lg bg-pink-600 hover:bg-pink-500 py-2.5 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Remove confirmation modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-start sm:items-center justify-center overflow-y-auto p-0 sm:p-4">
          <div className="w-full sm:max-w-md min-h-full sm:min-h-0 sm:my-auto rounded-none sm:rounded-xl border-0 sm:border border-white/10 bg-[#151518] p-4 sm:p-6 flex flex-col justify-center">
            <h2 className="font-semibold">Remove content</h2>

            {tab === 'photos' && removeTarget.sourceType === 'post' && (
              <p className="text-sm text-amber-300 mt-3">
                Warning: this will remove the entire post containing this photo.
              </p>
            )}

            <label className="block text-xs text-zinc-400 mt-5 mb-2">
              Reason for removal
            </label>

            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              placeholder="Enter a clear moderation reason..."
              className="w-full rounded-lg border border-white/10 bg-[#09090c] p-3 text-sm outline-none focus:border-pink-500/50 resize-y"
            />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setRemoveTarget(null)
                  setReason('')
                }}
                className="rounded-lg px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading || !reason.trim()}
                onClick={() => performModeration('remove')}
                className="rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2.5 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Confirm removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
