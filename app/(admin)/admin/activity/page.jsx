'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import ErrorState from '@/components/ui/ErrorState'
import { Search, UserPlus, PencilLine, MessageSquare, CalendarCheck, FolderKanban, LifeBuoy } from 'lucide-react'

const ACTIVITY_META = {
  user_joined: { icon: UserPlus, color: 'cyan', label: 'joined' },
  task_updated: { icon: PencilLine, color: 'violet', label: 'updated a task' },
  message_sent: { icon: MessageSquare, color: 'blue', label: 'sent a message' },
  attendance: { icon: CalendarCheck, color: 'green', label: 'recorded attendance' },
  project_created: { icon: FolderKanban, color: 'yellow', label: 'created a project' },
}

export default function AdminActivityPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/analytics/user-activity')
      setActivities(res.data.activities || res.data.recentActivity || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
      </div>
    )
  }

  if (error) {
    return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Could not load activity" onRetry={fetchActivities} /></div>
  }

  const typeCounts = activities.reduce((acc, a) => {
    const t = a.type
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})

  const filtered = activities.filter((a) => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      (a.actor?.fullName || a.actor || a.user?.fullName || '').toLowerCase().includes(q) ||
      (a.action || a.description || '').toLowerCase().includes(q) ||
      (a.target || '').toLowerCase().includes(q)
    )
  })

  const getMeta = (type) => ACTIVITY_META[type] || ACTIVITY_META.task_updated

  return (
    <div className="space-y-6">
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Engagement</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>User Activity Center</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>A live feed of actions across the platform.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Activities" value={activities.length} icon={LifeBuoy} tone="cyan" />
        <StatCard label="Messages" value={typeCounts.message_sent || 0} icon={MessageSquare} tone="blue" />
        <StatCard label="Tasks Updated" value={typeCounts.task_updated || 0} icon={PencilLine} tone="purple" />
        <StatCard label="Projects" value={typeCounts.project_created || 0} icon={FolderKanban} tone="amber" />
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-2)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activity..."
          className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-colors"
          style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--stroke)' }}>
          <LifeBuoy size={32} className="mx-auto" style={{ color: 'var(--text-2)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--text-2)' }}>No activity found.</p>
        </div>
      ) : (
        <div className="relative">
          <span className="absolute left-[19px] top-2 bottom-2 w-px" style={{ background: 'var(--stroke)' }} />
          <div className="space-y-4">
            {filtered.map((a) => {
              const meta = getMeta(a.type)
              const Icon = meta.icon
              const actor = a.actor?.fullName || a.actor?.name || a.user?.fullName || a.actor || 'Someone'
              const action = a.action || a.description || meta.label
              const target = a.target || a.subject
              return (
                <div key={a.id || a._id || `${a.type}-${a.createdAt}`} className="relative flex gap-4">
                  <span
                    className="z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                    style={{ background: `var(--${meta.color}-soft)`, color: `var(--${meta.color})`, borderColor: 'var(--stroke)' }}
                  >
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border px-4 py-3" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
                    <div className="min-w-0">
                      <p className="text-sm" style={{ color: 'var(--text-0)' }}>
                        <span className="font-semibold">{actor}</span>{' '}
                        <span className={cn('font-medium')} style={{ color: `var(--${meta.color})` }}>{action}</span>
                        {target && <span className="truncate"> — <span className="font-medium" style={{ color: 'var(--text-0)' }}>{target}</span></span>}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px]" style={{ color: 'var(--text-2)' }}>{timeAgo(a.createdAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
