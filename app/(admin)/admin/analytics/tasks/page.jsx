'use client'
import { useEffect, useState, useCallback } from 'react'
import { ClipboardList, CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import StatCard from '@/components/ui/StatCard'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const COLORS = ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#ec4899']
const PRIORITY_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444', URGENT: '#dc2626' }

export default function TaskAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try { const res = await api.get('/analytics/tasks'); setData(res.data) }
    catch { setError(true) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
  if (error) return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load task analytics" onRetry={load} /></div>

  const s = data?.summary || {}

  return (
    <div className="space-y-6">
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Analytics</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Task Analytics</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tasks" value={s.total} icon={ClipboardList} tone="cyan" />
        <StatCard label="Completion Rate" value={s.completionRate} icon={CheckCircle2} tone="green" suffix="%" />
        <StatCard label="Overdue Tasks" value={s.overdueTasks} icon={AlertTriangle} tone="red" />
        <StatCard label="In Progress" value={data?.byStatus?.find(x => x.status === 'IN_PROGRESS')?.count || 0} icon={Clock} tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Tasks by Status</h3>
          <div className="mt-4 h-56">
            {data?.byStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.byStatus.map(s => ({ name: s.status.replace('_', ' '), value: s.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0}>
                    {data.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No data</div>}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {data?.byStatus?.map((s, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-2)' }}>
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /> {s.status.replace('_', ' ')} ({s.count})
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Tasks by Priority</h3>
          <div className="mt-4 h-56">
            {data?.byPriority?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byPriority.map(p => ({ name: p.priority, value: p.count }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {data.byPriority.map((p, i) => <Cell key={i} fill={PRIORITY_COLORS[p.priority] || COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No data</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
