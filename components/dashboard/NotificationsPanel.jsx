'use client'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'
import { Bell, Check, CheckCheck, Megaphone, AlertTriangle, Info, FileCheck, Loader2 } from 'lucide-react'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

const KIND_ICON = { announcement: Megaphone, alert: AlertTriangle, info: Info, system: Bell, task: FileCheck }
const KIND_TONE = { announcement: 'var(--cyan)', alert: 'var(--red)', info: 'var(--blue)', system: 'var(--text-2)', task: 'var(--green)' }

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [updating, setUpdating] = useState(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const markAsRead = async (id) => {
    setUpdating(id)
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      toast.error('Could not mark as read')
    } finally {
      setUpdating(null)
    }
  }

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead).map((n) => n.id)
    if (unread.length === 0) return
    try {
      await Promise.all(unread.map((id) => api.patch(`/notifications/${id}/read`)))
      setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (err) {
      toast.error('Could not mark all as read')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Could not load notifications" message="The notifications feed is unreachable right now." onRetry={fetchNotifications} />
      </div>
    )
  }

  const unread = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono text-xs uppercase tracking-[0.22em] text-[var(--text-2)]">Inbox</p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[var(--text-0)] md:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-[var(--text-1)]">{unread > 0 ? `${unread} unread · latest first.` : 'You are all caught up.'}</p>
        </div>
        {unread > 0 && (
          <button type="button" onClick={markAllRead} className="btn text-xs">
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-10">
          <EmptyState icon={Bell} title="No notifications yet" description="Updates about announcements, tasks and system events will appear here." />
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const Icon = KIND_ICON[n.type] || Bell
            const isRead = n.isRead
            return (
              <div
                key={n.id}
                className={cn(
                  'group flex items-start gap-3.5 rounded-2xl border p-4 transition-colors',
                  isRead ? 'border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)]' : 'border-[var(--cyan)]/30 bg-[var(--cyan-soft)]'
                )}
              >
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'var(--cyan-soft)', color: KIND_TONE[n.type] || 'var(--text-2)' }}
                >
                  <Icon size={17} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[var(--text-0)]">{n.title}</p>
                    {!isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />}
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--text-1)]">{n.message}</p>
                  <p className="mt-1.5 text-xs text-[var(--text-2)]">{timeAgo(n.createdAt)}</p>
                </div>
                {!isRead && (
                  <button
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    disabled={updating === n.id}
                    aria-label="Mark as read"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--stroke)] text-[var(--text-2)] transition-colors hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
                  >
                    {updating === n.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}