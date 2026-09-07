'use client'
import { useEffect, useState, useCallback } from 'react'
import { Activity, Users, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'

const LEVEL_COLORS = { CRITICAL: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', bar: '#ef4444' }, HIGH: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', bar: '#f59e0b' }, NORMAL: { bg: 'rgba(6,182,212,0.1)', text: '#06b6d4', bar: '#06b6d4' }, LOW: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', bar: '#10b981' } }

export default function WorkloadPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try { const res = await api.get('/analytics/workload'); setData(res.data) }
    catch { setError(true) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
  if (error) return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load workload data" onRetry={load} /></div>

  const employees = data?.employees || []
  const departments = data?.departments || []

  return (
    <div className="space-y-6">
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Operations</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Workload Management</h1>
      </div>

      {/* Department Summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d, i) => {
          const lc = LEVEL_COLORS[d.level] || LEVEL_COLORS.NORMAL
          return (
            <div key={i} className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-0)' }}>{d.department?.replace(/_/g, ' ')}</p>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: lc.bg, color: lc.text }}>{d.level}</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular" style={{ color: 'var(--text-0)' }}>{d.avgWorkload}%</p>
              <p className="text-[10px]" style={{ color: 'var(--text-2)' }}>{d.memberCount} members</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${d.avgWorkload}%`, background: lc.bar }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Employee Workload Table */}
      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Employee Workload</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--text-2)' }}>
                <th className="px-3 py-2 text-left font-medium">Employee</th>
                <th className="px-3 py-2 text-left font-medium">Department</th>
                <th className="px-3 py-2 text-center font-medium">Assigned</th>
                <th className="px-3 py-2 text-center font-medium">Completed</th>
                <th className="px-3 py-2 text-center font-medium">Pending</th>
                <th className="px-3 py-2 text-center font-medium">Projects</th>
                <th className="px-3 py-2 text-left font-medium">Workload</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, i) => {
                const lc = LEVEL_COLORS[e.level] || LEVEL_COLORS.NORMAL
                return (
                  <tr key={i} className="border-t" style={{ borderColor: 'var(--stroke)' }}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                          {e.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--text-0)' }}>{e.fullName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--text-2)' }}>{e.department?.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2.5 text-center tabular" style={{ color: 'var(--text-0)' }}>{e.assignedTasks}</td>
                    <td className="px-3 py-2.5 text-center tabular text-emerald-400">{e.completedTasks}</td>
                    <td className="px-3 py-2.5 text-center tabular text-amber-400">{e.pendingTasks}</td>
                    <td className="px-3 py-2.5 text-center tabular" style={{ color: 'var(--text-0)' }}>{e.activeProjects}/{e.totalProjects}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${e.workloadPct}%`, background: lc.bar }} />
                        </div>
                        <span className="w-10 text-right tabular" style={{ color: lc.text }}>{e.workloadPct}%</span>
                      </div>
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
