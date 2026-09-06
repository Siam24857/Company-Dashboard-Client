'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { cn, timeAgo, fmtNum } from '@/lib/utils'
import { currentBase } from '@/lib/routes'
import {
  CalendarCheck,
  FolderOpen,
  FolderCheck,
  ClipboardList,
  BellRing,
  MessageSquare,
  Megaphone,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import StatCard from '@/components/ui/StatCard'
import { StatCardSkeleton } from '@/components/ui/Skeletons'
import Pill, { PRIORITY_TONE, STATUS_TONE } from '@/components/ui/Pill'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const dateLabel = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

export default function MissionControl({ hub = 'Overview', subtitle }) {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/dashboard/overview')
      setData(res.data)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton h-8 w-56 rounded-lg" />
          <div className="skeleton mt-2 h-4 w-72 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--stroke)] p-5">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-10 w-full rounded-lg" />)}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] p-5 lg:col-span-2">
            <div className="skeleton h-4 w-40 rounded" />
            <div className="skeleton mt-4 h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <ErrorState
          title="Could not load your dashboard"
          message="We couldn't reach the mission data. Check your connection and try again."
          onRetry={load}
        />
      </div>
    )
  }

  const { user, attendance, projects, tasks, messages, notifications, announcements, leave } = data
  const base = currentBase()
  const firstName = (user?.fullName || '').split(' ')[0] || 'there'

  const stats = [
    { label: 'Attendance (this month)', value: attendance.rate, suffix: '%', icon: CalendarCheck, tone: 'success', hint: `${attendance.present}/${attendance.total} days present` },
    { label: 'Active projects', value: projects.active, icon: FolderOpen, tone: 'cyan', hint: `${projects.completed} completed` },
    { label: 'Tasks pending', value: tasks.pending, icon: ClipboardList, tone: 'warn', hint: `${tasks.inProgress} in progress` },
    { label: 'Unread messages', value: messages.unread, icon: MessageSquare, tone: 'info', hint: 'Across all conversations' },
  ]

  const taskChart = [
    { name: 'To do', value: tasks.todo, fill: 'var(--yellow)' },
    { name: 'In progress', value: tasks.inProgress, fill: 'var(--blue)' },
    { name: 'In review', value: tasks.inReview, fill: 'var(--violet)' },
    { name: 'Done', value: tasks.completed, fill: 'var(--green)' },
  ]

  const activity = notifications.recent?.length || announcements.recent?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono text-xs uppercase tracking-[0.22em] text-[var(--text-2)]">{dateLabel()}</p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[var(--text-0)] md:text-3xl">
            {greeting()}, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-[var(--text-1)]">{subtitle || `Here's what's happening in ${hub}.`}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="chip tone-success">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: 'var(--green)' }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: 'var(--green)' }} />
            </span>
            All systems nominal
          </span>
          <button type="button" onClick={load} aria-label="Refresh dashboard" className="icon-btn">
            <RefreshCw size={15} className={loading ? 'animate-spin-slow' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-0)]">Task pipeline</h3>
            {tasks.total > 0 && (
              <Link href={`${base}/projects`} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--cyan)] hover:underline">
                Details <ArrowRight size={12} />
              </Link>
            )}
          </div>
          {tasks.total === 0 ? (
            <EmptyState
              className="mt-3 border-0 py-10"
              icon={ClipboardList}
              title="No tasks assigned"
              description="Tasks assigned to you will appear here with their pipeline stage."
            />
          ) : (
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskChart} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 10 }} axisLine={{ stroke: 'var(--stroke)' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--glass)' }} contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12, color: 'var(--text-0)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={700}>
                    {taskChart.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--stroke)] pt-4">
            {[
              ['Pending', tasks.pending, 'var(--yellow)'],
              ['In review', tasks.inReview, 'var(--violet)'],
              ['Done', tasks.completed, 'var(--green)'],
            ].map(([label, val, color]) => (
              <div key={label}>
                <p className="tabular text-lg font-semibold" style={{ color }}>{val}</p>
                <p className="text-[11px] text-[var(--text-2)]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-0)]">Projects</h3>
            {projects.total > 0 && (
              <Link href={`${base}/projects`} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--cyan)] hover:underline">
                View all <ArrowRight size={12} />
              </Link>
            )}
          </div>
          {projects.total === 0 ? (
            <EmptyState className="mt-3 border-0 py-12" icon={FolderOpen} title="No projects" description="Projects you're part of will show here with live status." />
          ) : (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--glass-soft)] px-3 py-2">
                <span className="flex items-center gap-2 text-xs text-[var(--text-1)]"><FolderOpen size={14} className="text-[var(--cyan)]" /> Active</span>
                <Pill tone="info">{projects.active}</Pill>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--glass-soft)] px-3 py-2">
                <span className="flex items-center gap-2 text-xs text-[var(--text-1)]"><FolderCheck size={14} className="text-[var(--green)]" /> Completed</span>
                <Pill tone="success">{projects.completed}</Pill>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--glass-soft)] px-3 py-2">
                <span className="flex items-center gap-2 text-xs text-[var(--text-1)]"><ClipboardList size={14} className="text-[var(--yellow)]" /> Planning / on-hold</span>
                <Pill tone="warn">{projects.planning + projects.onHold}</Pill>
              </div>
              <Link href={`${base}/projects`} className="btn mt-1 w-full">
                Open project board
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-0)]">Mission feed</h3>
            <Link href={`${base}/notifications`} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--cyan)] hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {activity === 0 ? (
            <EmptyState className="mt-3 border-0 py-12" icon={BellRing} title="All quiet" description="New announcements and notifications will appear here." />
          ) : (
            <div className="mt-3 space-y-2.5">
              {announcements.recent.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--glass-soft)] p-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--tone-soft)' }}>
                    <Megaphone size={13} className="text-[var(--cyan)]" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[var(--text-0)]">{a.title}</p>
                    <p className="text-[11px] text-[var(--text-2)]">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))}
              {notifications.recent.slice(0, 2).map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--glass-soft)] p-3">
                  <span className={cn('mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full', !n.isRead && 'animate-pulse-soft')} style={{ background: n.isRead ? 'var(--text-2)' : 'var(--cyan)' }} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[var(--text-0)]">{n.title}</p>
                    <p className="truncate text-[11px] text-[var(--text-2)]">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-0)]">Quick actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['Mark attendance', `${base}/attendance`],
              ['Projects', `${base}/projects`],
              ['Messages', `${base}/messages`],
              ['Leave', `${base}/leave`],
            ].map(([label, href]) => (
              <button key={href} onClick={() => router.push(href)} className="btn justify-center text-xs">
                {label}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-[var(--stroke)] pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[var(--text-1)]"><BellRing size={13} /> Unread notifications</span>
              <span className="tabular font-semibold text-[var(--text-0)]">{notifications.unreadCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[var(--text-1)]"><Megaphone size={13} /> Unread announcements</span>
              <span className="tabular font-semibold text-[var(--text-0)]">{announcements.unread}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[var(--text-1)]"><CalendarCheck size={13} /> Pending leave</span>
              <span className="tabular font-semibold text-[var(--text-0)]">{leave.pending}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}