'use client'
import { useEffect, useState, useCallback } from 'react'
import { BarChart3, Users, FolderOpen, ClipboardList, Activity, TrendingUp, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { cn, fmtNum } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import StatCard from '@/components/ui/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, CartesianGrid, Legend
} from 'recharts'

const PERIODS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' },
]

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function ExecutiveAnalyticsPage() {
  const [period, setPeriod] = useState('30d')
  const [data, setData] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [users, projects, tasks, rev] = await Promise.all([
        api.get(`/analytics/users?period=${period}`),
        api.get('/analytics/projects'),
        api.get('/analytics/tasks'),
        api.get(`/analytics/revenue?period=${period}`),
      ])
      setData({ users: users.data, projects: projects.data, tasks: tasks.data })
      setRevenue(rev.data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}</div>
      </div>
    )
  }

  if (error) return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load analytics" onRetry={fetchAll} /></div>

  const u = data?.users || {}
  const p = data?.projects || {}
  const t = data?.tasks || {}
  const r = revenue?.summary || {}

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Analytics</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Executive Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border" style={{ borderColor: 'var(--stroke)' }}>
            {PERIODS.map(pe => (
              <button key={pe.value} onClick={() => setPeriod(pe.value)} className={cn('px-3 py-1.5 text-[11px] font-medium transition-colors', period === pe.value ? 'text-white' : '')} style={period === pe.value ? { background: 'var(--cyan)', color: 'var(--bg)' } : { color: 'var(--text-2)' }}>
                {pe.label}
              </button>
            ))}
          </div>
          <button onClick={fetchAll} className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={u.summary?.total} icon={Users} tone="cyan" hint={`${u.summary?.growth || 0}% growth`} />
        <StatCard label="Total Projects" value={p.summary?.total} icon={FolderOpen} tone="purple" hint={`${p.summary?.completionRate || 0}% completion`} />
        <StatCard label="Total Tasks" value={t.summary?.total} icon={ClipboardList} tone="green" hint={`${t.summary?.completionRate || 0}% done`} />
        <StatCard label="Revenue" value={fmtNum(r.totalRevenue)} icon={TrendingUp} tone="green" prefix="$" hint={`${r.growthRate || 0}% growth`} />
      </div>

      {/* SECONDARY KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Users" value={u.summary?.active} icon={Activity} tone="green" />
        <StatCard label="Pending Tasks" value={t.summary?.total - t.summary?.completionRate} icon={ClipboardList} tone="amber" />
        <StatCard label="Overdue Tasks" value={t.summary?.overdueTasks} icon={ClipboardList} tone="red" />
        <StatCard label="Avg Monthly Revenue" value={fmtNum(r.avgMonthly)} icon={BarChart3} tone="cyan" prefix="$" />
      </div>

      {/* CHARTS */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* User Distribution by Role */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Users by Role</h3>
          <div className="mt-4 h-56">
            {u.byRole?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={u.byRole.map(r => ({ name: r.role, value: r.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0}>
                    {u.byRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No data</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {u.byRole?.map((r, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-2)' }}>
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /> {r.role} ({r.count})
              </span>
            ))}
          </div>
        </div>

        {/* Task Status */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Tasks by Status</h3>
          <div className="mt-4 h-56">
            {t.byStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={t.byStatus.map(s => ({ name: s.status.replace('_', ' '), value: s.count }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={700}>
                    {t.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No tasks yet</div>
            )}
          </div>
        </div>

        {/* Revenue vs Expenses */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Revenue vs Expenses</h3>
          <div className="mt-4 h-56">
            {revenue?.monthly?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue.monthly}>
                  <defs>
                    <linearGradient id="revg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="expg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revg)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No revenue data</div>
            )}
          </div>
        </div>

        {/* Project Status */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Project Status</h3>
          <div className="mt-4 h-56">
            {p.byStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={p.byStatus.map(s => ({ name: s.status.replace('_', ' '), value: s.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0}>
                    {p.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No projects yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Department Distribution */}
      {u.byDepartment?.length > 0 && (
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Users by Department</h3>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={u.byDepartment.map(d => ({ name: d.department.replace(/_/g, ' '), value: d.count }))} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" fill="var(--cyan)" radius={[0, 6, 6, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
