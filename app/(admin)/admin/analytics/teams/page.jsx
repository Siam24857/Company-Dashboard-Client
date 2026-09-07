'use client'
import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, TrendingUp, AlertOctagon, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const LEVEL_COLORS = {
  CRITICAL: { hex: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#ef4444', bar: '#ef4444', label: 'Critical' },
  HIGH: { hex: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', bar: '#f59e0b', label: 'High' },
  NORMAL: { hex: '#06b6d4', bg: 'rgba(6,182,212,0.1)', text: '#06b6d4', bar: '#06b6d4', label: 'Normal' },
  LOW: { hex: '#10b981', bg: 'rgba(16,185,129,0.1)', text: '#10b981', bar: '#10b981', label: 'Low' },
}

function workloadLevel(workloadPct) {
  if (workloadPct >= 80) return 'CRITICAL'
  if (workloadPct >= 60) return 'HIGH'
  if (workloadPct >= 30) return 'NORMAL'
  return 'LOW'
}

export default function TeamAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try { const res = await api.get('/analytics/teams'); setData(res.data) }
    catch { setError(true) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-64 rounded-lg" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}</div>
      <div className="skeleton h-72 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  )

  if (error) return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load team analytics" onRetry={load} /></div>

  const teams = data?.teams || []
  const rankedTeams = [...teams].sort((a, b) => b.completionRate - a.completionRate)
  const attentionTeams = teams.filter(t => t.overdueTasks > 0 || t.workloadPct > 60)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Analytics</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Team Performance Analytics</h1>
        </div>
        <button onClick={load} className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Team Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((t, i) => {
          const lv = LEVEL_COLORS[workloadLevel(t.workloadPct)] || LEVEL_COLORS.NORMAL
          return (
            <div key={i} className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{t.department?.replace(/_/g, ' ')}</p>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: lv.bg, color: lv.text }}>{lv.label}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Members</p>
                  <p className="mt-0.5 text-lg font-bold tabular" style={{ color: 'var(--text-0)' }}>{t.memberCount}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Total Tasks</p>
                  <p className="mt-0.5 text-lg font-bold tabular" style={{ color: 'var(--text-0)' }}>{t.totalTasks}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Completed</p>
                  <p className="mt-0.5 text-lg font-bold tabular text-emerald-400">{t.completedTasks}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Pending</p>
                  <p className="mt-0.5 text-lg font-bold tabular text-amber-400">{t.pendingTasks}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Overdue</p>
                  <p className="mt-0.5 text-lg font-bold tabular text-red-400">{t.overdueTasks}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Productivity</p>
                  <p className="mt-0.5 text-lg font-bold tabular" style={{ color: lv.text }}>{t.productivity}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Completion</p>
                  <p className="mt-0.5 text-lg font-bold tabular" style={{ color: 'var(--text-0)' }}>{t.completionRate}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Workload</p>
                  <p className="mt-0.5 text-lg font-bold tabular" style={{ color: lv.text }}>{t.workloadPct}%</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span style={{ color: 'var(--text-2)' }}>Workload level</span>
                  <span className="font-semibold tabular" style={{ color: lv.text }}>{t.workloadPct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${t.workloadPct}%`, background: lv.bar }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] mb-1">
                  <span style={{ color: 'var(--text-2)' }}>Completion rate</span>
                  <span className="font-semibold tabular" style={{ color: 'var(--cyan)' }}>{t.completionRate}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${t.completionRate}%`, background: 'var(--cyan)' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion Rate Chart */}
      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Team Completion Rates</h3>
        <div className="mt-4 h-64">
          {rankedTeams.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankedTeams.map(t => ({ name: t.department.replace(/_/g, ' '), value: t.completionRate }))}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} formatter={(v) => [`${v}%`, 'Completion Rate']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={700}>
                  {rankedTeams.map((t, i) => <Cell key={i} fill={LEVEL_COLORS[workloadLevel(t.workloadPct)]?.hex || '#06b6d4'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No team data</div>}
        </div>
      </div>

      {/* Team Ranking Table */}
      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Team Ranking</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--text-2)', borderColor: 'var(--stroke)' }} className="border-b">
                <th className="px-3 py-2 text-left font-medium">Rank</th>
                <th className="px-3 py-2 text-left font-medium">Team</th>
                <th className="px-3 py-2 text-center font-medium">Members</th>
                <th className="px-3 py-2 text-center font-medium">Tasks</th>
                <th className="px-3 py-2 text-center font-medium">Completed</th>
                <th className="px-3 py-2 text-center font-medium">Overdue</th>
                <th className="px-3 py-2 text-center font-medium">Completion</th>
                <th className="px-3 py-2 text-center font-medium">Workload</th>
                <th className="px-3 py-2 text-center font-medium">Level</th>
              </tr>
            </thead>
            <tbody>
              {rankedTeams.map((t, i) => {
                const lv = LEVEL_COLORS[workloadLevel(t.workloadPct)] || LEVEL_COLORS.NORMAL
                return (
                  <tr key={t.department} className="border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <td className="px-3 py-2.5">
                      <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold', i === 0 ? 'bg-amber-400/10 text-amber-400' : i === 1 ? 'bg-gray-500/10 text-gray-400' : i === 2 ? 'bg-orange-400/10 text-orange-400' : '')} style={{ color: i > 2 ? 'var(--text-2)' : '' }}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--text-0)' }}>{t.department?.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2.5 text-center tabular" style={{ color: 'var(--text-0)' }}>{t.memberCount}</td>
                    <td className="px-3 py-2.5 text-center tabular" style={{ color: 'var(--text-0)' }}>{t.totalTasks}</td>
                    <td className="px-3 py-2.5 text-center tabular text-emerald-400">{t.completedTasks}</td>
                    <td className="px-3 py-2.5 text-center tabular text-red-400">{t.overdueTasks}</td>
                    <td className="px-3 py-2.5 text-center tabular font-semibold" style={{ color: 'var(--cyan)' }}>{t.completionRate}%</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                          <div className="h-full rounded-full" style={{ width: `${t.workloadPct}%`, background: lv.bar }} />
                        </div>
                        <span className="w-10 text-right tabular" style={{ color: lv.text }}>{t.workloadPct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: lv.bg, color: lv.text }}>{lv.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teams Requiring Attention */}
      {attentionTeams.length > 0 && (
        <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <div className="flex items-center gap-2">
            <AlertOctagon size={16} style={{ color: 'var(--red)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Teams Requiring Attention</h3>
          </div>
          <div className="mt-3 space-y-2">
            {attentionTeams.map((t, i) => {
              const lv = LEVEL_COLORS[workloadLevel(t.workloadPct)] || LEVEL_COLORS.NORMAL
              return (
                <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'var(--glass-soft)' }}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: lv.bg, color: lv.text }}>
                      {t.overdueTasks > 0 ? <AlertTriangle size={15} /> : <TrendingUp size={15} />}
                    </span>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-0)' }}>{t.department?.replace(/_/g, ' ')}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-2)' }}>
                        {t.overdueTasks > 0 && `${t.overdueTasks} overdue task${t.overdueTasks > 1 ? 's' : ''}`}
                        {t.overdueTasks > 0 && t.workloadPct > 60 && ' · '}
                        {t.workloadPct > 60 && `${t.workloadPct}% workload`}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: lv.bg, color: lv.text }}>{lv.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
