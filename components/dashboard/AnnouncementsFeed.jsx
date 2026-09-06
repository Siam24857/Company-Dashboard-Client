'use client'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'
import Pill from '@/components/ui/Pill'
import { Megaphone, Check, CheckCheck, Loader2 } from 'lucide-react'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

const PRIORITY_TONE = { NORMAL: 'info', IMPORTANT: 'warn', URGENT: 'critical' }
const TARGET_TONE = { EVERYONE: 'info', MEMBER: 'success', ADMIN: 'critical' }

export default function AnnouncementsFeed() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [updating, setUpdating] = useState(null)

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/announcements')
      setAnnouncements(res.data.announcements)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  const markAsRead = async (id) => {
    setUpdating(id)
    try {
      await api.patch(`/announcements/${id}/read`)
      setAnnouncements((as) => as.map((a) => (a.id === id ? { ...a, isRead: true } : a)))
    } catch (err) {
      toast.error('Could not mark as read')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Could not load announcements" message="Announcements are unreachable right now." onRetry={fetchAnnouncements} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mono text-xs uppercase tracking-[0.22em] text-[var(--text-2)]">Broadcast</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[var(--text-0)] md:text-3xl">Announcements</h1>
        <p className="mt-1 text-sm text-[var(--text-1)]">Company-wide updates, sorted newest first.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-10">
          <EmptyState icon={Megaphone} title="No announcements yet" description="When leadership shares an update it will appear here." />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {announcements.map((a) => {
            const unread = !a.isRead
            return (
              <article
                key={a.id}
                className={cn(
                  'flex flex-col rounded-2xl border p-5 transition-colors',
                  unread ? 'border-[var(--cyan)]/30 bg-[var(--cyan-soft)]' : 'border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)]'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                      <Megaphone size={16} strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-0)]">{a.title}</h3>
                      <p className="text-[11px] text-[var(--text-2)]">{timeAgo(a.createdAt)}</p>
                    </div>
                  </div>
                  {!unread && <Check size={15} className="mt-1 text-[var(--text-2)]" aria-label="Read" />}
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-1)]">{a.content}</p>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--stroke)] pt-3">
                  <div className="flex gap-2">
                    {a.priority && <Pill key="p" tone={PRIORITY_TONE[a.priority] || 'info'}>{a.priority.toLowerCase()}</Pill>}
                    {a.targetRole && <Pill key="t" tone={TARGET_TONE[a.targetRole] || 'info'}>{a.targetRole.toLowerCase()}</Pill>}
                  </div>
                  {unread && (
                    <button
                      type="button"
                      onClick={() => markAsRead(a.id)}
                      disabled={updating === a.id}
                      className="btn text-xs"
                    >
                      {updating === a.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
                      Mark read
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}