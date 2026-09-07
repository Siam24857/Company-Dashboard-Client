'use client'
import { useEffect, useState, useCallback } from 'react'
import { Users, UserCheck, UserX, Clock, RefreshCw, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import StatCard from '@/components/ui/StatCard'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function UserAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try { const res = await api.get('/analytics/users'); setData(res.data) }
    catch { setError(true) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
  if (error) return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load user analytics" onRetry={load} /></div>

  const s = data?.summary || {}

  return (
    <div className="space-y-6">
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Analytics</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>User Analytics</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={s.total} icon={Users} tone="cyan" hint={`${s.growth || 0}% growth`} />
        <StatCard label="Active Users" value={s.active} icon={UserCheck} tone="green" />
        <StatCard label="Pending Users" value={s.pending} icon={Clock} tone="amber" />
        <StatCard label="Suspended Users" value={s.suspended} icon={UserX} tone="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Users by Role</h3>
          <div className="mt-4 h-56">
            {data?.byRole?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.byRole.map(r => ({ name: r.role, value: r.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0}>
                    {data.byRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No data</div>}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {data?.byRole?.map((r, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-2)' }}>
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /> {r.role} ({r.count})
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Users by Department</h3>
          <div className="mt-4 h-56">
            {data?.byDepartment?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byDepartment.map(d => ({ name: d.department.replace(/_/g, ' '), value: d.count }))} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="value" fill="var(--cyan)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No data</div>}
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Recent Registrations</h3>
        <div className="mt-3 space-y-2">
          {data?.recentRegistrations?.length === 0 ? (
            <p className="py-8 text-center text-xs" style={{ color: 'var(--text-2)' }}>No recent registrations</p>
          ) : data?.recentRegistrations?.map(u => (
            <div key={u.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--glass-soft)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                {u.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium" style={{ color: 'var(--text-0)' }}>{u.fullName}</p>
                <p className="truncate text-[10px]" style={{ color: 'var(--text-2)' }}>{u.email} · {u.department?.replace(/_/g, ' ')}</p>
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : u.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400')}>
                {u.status}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-2)' }}>{timeAgo(u.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
