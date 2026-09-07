'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { FolderOpen, CheckCircle2, AlertTriangle, Clock, RefreshCw, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import StatCard from '@/components/ui/StatCard'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ProjectAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try { const res = await api.get('/analytics/projects'); setData(res.data) }
    catch { setError(true) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
  if (error) return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load project analytics" onRetry={load} /></div>

  const s = data?.summary || {}
  const projects = data?.projects || []

  return (
    <div className="space-y-6">
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Analytics</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Project Analytics</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={s.total} icon={FolderOpen} tone="cyan" />
        <StatCard label="Completion Rate" value={s.completionRate} icon={CheckCircle2} tone="green" suffix="%" />
        <StatCard label="Overdue Tasks" value={s.overdueTasks} icon={AlertTriangle} tone="red" />
        <StatCard label="Active Projects" value={data?.byStatus?.find(x => x.status === 'IN_PROGRESS')?.count || 0} icon={Clock} tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Projects by Status</h3>
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
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Tasks by Status</h3>
          <div className="mt-4 h-56">
            {data?.tasksByStatus?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tasksByStatus.map(s => ({ name: s.status.replace('_', ' '), value: s.count }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {data.tasksByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No tasks</div>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>All Projects</h3>
        <div className="mt-3 space-y-2">
          {projects.length === 0 ? (
            <p className="py-8 text-center text-xs" style={{ color: 'var(--text-2)' }}>No projects yet</p>
          ) : projects.map(p => (
            <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-[var(--glass-soft)]">
              <div className="flex items-center gap-3">
                <FolderOpen size={16} style={{ color: 'var(--cyan)' }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-0)' }}>{p.title}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-2)' }}>{p.department} · {p._count?.tasks || 0} tasks · {p._count?.members || 0} members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', p.status === 'IN_PROGRESS' ? 'bg-cyan-500/10 text-cyan-400' : p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : p.status === 'PLANNING' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400')}>
                  {p.status?.replace('_', ' ')}
                </span>
                <ChevronRight size={14} style={{ color: 'var(--text-2)' }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
