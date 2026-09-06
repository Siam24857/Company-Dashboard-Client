'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Users, UserCheck, FolderOpen, FolderCheck, ClipboardList, Megaphone, CalendarClock, AlertTriangle, RefreshCw } from 'lucide-react'
import ErrorState from '@/components/ui/ErrorState'
import StatCard from '@/components/ui/StatCard'
import { StatCardSkeleton } from '@/components/ui/Skeletons'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie } from 'recharts'

const COLORS = { IN_PROGRESS: 'var(--blue)', PLANNING: 'var(--yellow)', ON_HOLD: 'var(--orange)', COMPLETED: 'var(--green)', CANCELLED: 'var(--red)' }

export default function AdminDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/dashboard/admin')
      setData(res.data)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton h-8 w-64 rounded-lg" />
          <div className="skeleton mt-2 h-4 w-80 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-[var(--stroke)] p-5">
              <div className="skeleton h-4 w-40 rounded" />
              <div className="skeleton mt-4 h-64 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <ErrorState
          title="Could not load company analytics"
          message="We couldn't reach the command center. Check your connection and try again."
          onRetry={load}
        />
      </div>
    )
  }

  const { users, projects, tasks, attendance, leave, announcements, pipeline } = data

  const stats = [
    { label: 'Total users', value: users.total, icon: Users, tone: 'cyan', hint: `${users.pending} pending approval` },
    { label: 'Active users', value: users.active, icon: UserCheck, tone: 'success', hint: `${users.suspended} suspended` },
    { label: 'Active projects', value: projects.byStatus?.IN_PROGRESS || 0, icon: FolderOpen, tone: 'info', hint: `${projects.byStatus?.COMPLETED || 0} completed` },
    { label: 'Pending tasks', value: tasks.pending, icon: ClipboardList, tone: 'warn', hint: `${tasks.completed} completed overall` },
  ]

  const projectChart = Object.entries(projects.byStatus || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
    fill: COLORS[name] || 'var(--text-2)',
  }))

  const attendanceChart = Object.entries(attendance.byStatus || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
    fill: COLORS[name] || 'var(--text-2)',
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono text-xs uppercase tracking-[0.22em] text-[var(--text-2)]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[var(--text-0)] md:text-3xl">Command overview</h1>
          <p className="mt-1 text-sm text-[var(--text-1)]">Company-wide analytics from the live system.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="chip tone-success">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: 'var(--green)' }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: 'var(--green)' }} />
            </span>
            All systems nominal
          </span>
          <button type="button" onClick={load} aria-label="Refresh" className="icon-btn"><RefreshCw size={15} className={loading ? 'animate-spin-slow' : ''} /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-0)]">Projects by status</h3>
          {projectChart.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--text-2)]">No projects yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectChart} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 10 }} axisLine={{ stroke: 'var(--stroke)' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--glass)' }} contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12, color: 'var(--text-0)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={700}>
                    {projectChart.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-0)]">Today&apos;s attendance</h3>
          {attendance.today === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--text-2)]">No attendance recorded today yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attendanceChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} animationDuration={700}>
                    {attendanceChart.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12, color: 'var(--text-0)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending leave', value: leave.pending, icon: CalendarClock, tone: 'warn', onClick: () => router.push('/admin/leave') },
          { label: 'Announcements', value: announcements.published, suffix: ` of ${announcements.total}`, icon: Megaphone, tone: 'cyan', onClick: () => router.push('/admin/announcements') },
          { label: 'Pending approvals', value: users.pending, icon: Users, tone: 'warn', onClick: () => router.push('/admin/users') },
          { label: 'Pipeline deals', value: pipeline.activeDeals, icon: FolderCheck, tone: 'info', onClick: () => router.push('/admin/projects') },
        ].map((s) => <StatCard key={s.label} {...s} />)}
      </div>
    </div>
  )
}