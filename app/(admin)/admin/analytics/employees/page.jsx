'use client'
import { useEffect, useState, useCallback } from 'react'
import { Users, UserCheck, UserX, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import ErrorState from '@/components/ui/ErrorState'
import StatCard from '@/components/ui/StatCard'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const LEVEL_COLORS = {
  CRITICAL: { hex: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#ef4444', bar: '#ef4444', label: 'Critical' },
  HIGH: { hex: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', bar: '#f59e0b', label: 'High' },
  NORMAL: { hex: '#06b6d4', bg: 'rgba(6,182,212,0.1)', text: '#06b6d4', bar: '#06b6d4', label: 'Normal' },
  LOW: { hex: '#10b981', bg: 'rgba(16,185,129,0.1)', text: '#10b981', bar: '#10b981', label: 'Low' },
}

export default function EmployeeAnalyticsPage() {
  const [data, setData] = useState(null)
  const [workload, setWorkload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const [emplRes, wlRes] = await Promise.all([
        api.get('/analytics/employees'),
        api.get('/analytics/workload'),
      ])
      setData(emplRes.data)
      setWorkload(wlRes.data)
    } catch { setError(true) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-56 rounded-lg" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
      <div className="skeleton h-72 rounded-2xl" />
    </div>
  )

  if (error) return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load employee analytics" onRetry={load} /></div>

  const s = data?.summary || {}
  const employees = data?.employees || []
  const byDepartment = data?.byDepartment || []
  const byRole = data?.byRole || []
  const workloadEmployees = workload?.employees || []

  const workloadMap = {}
  workloadEmployees.forEach(w => { workloadMap[w.id] = w })

  const enriched = employees.map(e => {
    const wl = workloadMap[e.id]
    return {
      ...e,
      assignedTasks: wl?.assignedTasks ?? e._count?.taskSubmissions ?? 0,
      completedTasks: wl?.completedTasks ?? 0,
      pendingTasks: wl?.pendingTasks ?? 0,
      workloadPct: wl?.workloadPct ?? 0,
      level: wl?.level ?? 'LOW',
    }
  })

  const workloadDistribution = [
    { name: 'Low (<30%)', value: workloadEmployees.filter(e => e.workloadPct < 30).length },
    { name: 'Normal (30-60%)', value: workloadEmployees.filter(e => e.workloadPct >= 30 && e.workloadPct < 60).length },
    { name: 'High (60-80%)', value: workloadEmployees.filter(e => e.workloadPct >= 60 && e.workloadPct < 80).length },
    { name: 'Critical (80%+)', value: workloadEmployees.filter(e => e.workloadPct >= 80).length },
  ].filter(x => x.value > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Analytics</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Employee Analytics</h1>
        </div>
        <button onClick={load} className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Employees" value={s.total} icon={Users} tone="cyan" />
        <StatCard label="Active" value={s.active} icon={UserCheck} tone="green" />
        <StatCard label="Inactive" value={s.inactive} icon={UserX} tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Employees by Department */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Employees by Department</h3>
          <div className="mt-4 h-56">
            {byDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byDepartment.map(d => ({ name: d.department.replace(/_/g, ' '), value: d.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0}>
                    {byDepartment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No data</div>}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {byDepartment.map((d, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-2)' }}>
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /> {d.department.replace(/_/g, ' ')} ({d.count})
              </span>
            ))}
          </div>
        </div>

        {/* Employees by Role */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Employees by Role</h3>
          <div className="mt-4 h-56">
            {byRole.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byRole.map(r => ({ name: r.role.replace(/_/g, ' '), value: r.count }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="value" fill="var(--cyan)" radius={[6, 6, 0, 0]} animationDuration={700}>
                    {byRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No data</div>}
          </div>
        </div>
      </div>

      {/* Workload Distribution */}
      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Workload Distribution</h3>
        <div className="mt-4 h-56">
          {workloadDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadDistribution}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={700}>
                  {workloadDistribution.map((w, i) => {
                    const colors = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444']
                    return <Cell key={i} fill={colors[i % colors.length]} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No workload data</div>}
        </div>
      </div>

      {/* Employee Table */}
      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Employees</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--text-2)', borderColor: 'var(--stroke)' }} className="border-b">
                <th className="px-3 py-2 text-left font-medium">Employee</th>
                <th className="px-3 py-2 text-left font-medium">Department</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-center font-medium">Assigned</th>
                <th className="px-3 py-2 text-center font-medium">Completed</th>
                <th className="px-3 py-2 text-left font-medium">Workload</th>
                <th className="px-3 py-2 text-center font-medium">Level</th>
              </tr>
            </thead>
            <tbody>
              {enriched.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center" style={{ color: 'var(--text-2)' }}>No employees found</td></tr>
              ) : enriched.map((e, i) => {
                  const lc = LEVEL_COLORS[e.level] || LEVEL_COLORS.NORMAL
                  return (
                  <tr key={e.id} className="border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                          {e.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--text-0)' }}>{e.fullName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--text-2)' }}>{e.department?.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--text-2)' }}>{e.role?.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2.5 text-center tabular" style={{ color: 'var(--text-0)' }}>{e.assignedTasks}</td>
                    <td className="px-3 py-2.5 text-center tabular text-emerald-400">{e.completedTasks}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${e.workloadPct}%`, background: lc.bar }} />
                        </div>
                        <span className="w-10 text-right tabular" style={{ color: lc.text }}>{e.workloadPct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: lc.bg, color: lc.text }}>{lc.label}</span>
                    </td>
                  </tr>
                  )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
