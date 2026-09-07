'use client'
import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, FolderCheck, TrendingUp, AlertTriangle, TrendingDown, RefreshCw, ClipboardList, Target, Zap } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import StatCard from '@/components/ui/StatCard'

function metricColor(value, { good, warning, bad }) {
  if (value >= good) return { hex: '#10b981', bg: 'rgba(16,185,129,0.1)', text: '#10b981', label: 'Good' }
  if (value >= warning) return { hex: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', label: 'Average' }
  return { hex: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#ef4444', label: 'Needs Attention' }
}

export default function ProductivityOverviewPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try { const res = await api.get('/analytics/productivity'); setData(res.data) }
    catch { setError(true) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-56 rounded-lg" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  )

  if (error) return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load productivity data" onRetry={load} /></div>

  const d = data || {}
  const completion = metricColor(d.completionRate || 0, { good: 80, warning: 60 })
  const projectCompletion = metricColor(d.projectCompletionRate || 0, { good: 70, warning: 50 })
  const velocity = metricColor(d.weeklyVelocity || 0, { good: 50, warning: 25 })
  const overdue = d.overdueTasks > 0
    ? { hex: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#ef4444', label: 'Overdue' }
    : { hex: '#10b981', bg: 'rgba(16,185,129,0.1)', text: '#10b981', label: 'On Track' }
  const change = (d.productivityChange || 0) >= 0
    ? { hex: '#10b981', bg: 'rgba(16,185,129,0.1)', text: '#10b981', label: `${d.productivityChange > 0 ? '+' : ''}${d.productivityChange}%` }
    : { hex: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#ef4444', label: `${d.productivityChange}%` }

  const insights = []
  if (d.completionRate >= 80) insights.push({ type: 'success', text: `Task completion rate is strong at ${d.completionRate}%.` })
  else if (d.completionRate >= 60) insights.push({ type: 'warning', text: `Task completion rate is moderate at ${d.completionRate}%. Consider improving workflow efficiency.` })
  else insights.push({ type: 'critical', text: `Task completion rate is low at ${d.completionRate}%. Immediate attention required.` })

  if (d.projectCompletionRate >= 70) insights.push({ type: 'success', text: `Project completion rate is healthy at ${d.projectCompletionRate}%.` })
  else if (d.projectCompletionRate >= 50) insights.push({ type: 'warning', text: `Project completion rate is ${d.projectCompletionRate}%. Some projects may need prioritization.` })
  else insights.push({ type: 'critical', text: `Project completion rate is concerning at ${d.projectCompletionRate}%.` })

  if (d.weeklyVelocity >= 50) insights.push({ type: 'success', text: `Weekly velocity is excellent: ${d.weeklyVelocity} tasks completed this week.` })
  else if (d.weeklyVelocity >= 25) insights.push({ type: 'info', text: `Weekly velocity is ${d.weeklyVelocity} tasks. A steady but improvable pace.` })
  else insights.push({ type: 'warning', text: `Weekly velocity is low at ${d.weeklyVelocity} tasks. Explore bottlenecks.` })

  if (d.overdueTasks > 0) insights.push({ type: 'critical', text: `${d.overdueTasks} task${d.overdueTasks > 1 ? 's are' : ' is'} overdue. Prioritize clearing these backlogs.` })
  else insights.push({ type: 'success', text: 'No overdue tasks. Everything is on schedule.' })

  if (d.productivityChange > 0) insights.push({ type: 'success', text: `Productivity is up ${d.productivityChange}% compared to the previous month.` })
  else if (d.productivityChange < 0) insights.push({ type: 'warning', text: `Productivity dropped ${Math.abs(d.productivityChange)}% vs last month. Review recent changes.` })
  else insights.push({ type: 'info', text: 'Productivity is steady compared to the previous month.' })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Analytics</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Productivity Overview</h1>
        </div>
        <button onClick={load} className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Completion Rate" value={d.completionRate} icon={CheckCircle2} tone="green" suffix="%" hint="Task completion" />
        <StatCard label="Project Completion" value={d.projectCompletionRate} icon={FolderCheck} tone="cyan" suffix="%" hint="Projects done" />
        <StatCard label="Weekly Velocity" value={d.weeklyVelocity} icon={Zap} tone="purple" hint="Tasks this week" />
        <StatCard label="Overdue Tasks" value={d.overdueTasks} icon={AlertTriangle} tone="red" hint="Needs attention" />
        <StatCard label="Productivity Change" value={Math.abs(d.productivityChange)} icon={TrendingUp} tone={d.productivityChange >= 0 ? 'green' : 'red'} suffix="%" hint={d.productivityChange >= 0 ? 'vs last month' : 'decline vs last month'} />
      </div>

      {/* Visual Indicators */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Completion Rate', value: d.completionRate, color: completion },
          { label: 'Project Completion', value: d.projectCompletionRate, color: projectCompletion },
          { label: 'Weekly Velocity', value: d.weeklyVelocity, color: velocity },
          { label: 'Overdue Status', value: d.overdueTasks, color: overdue },
          { label: 'Productivity Change', value: d.productivityChange, color: change },
        ].map((m, i) => (
          <div key={i} className="rounded-2xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>{m.label}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold tabular" style={{ color: m.color.text }}>{m.value}{m.label === 'Overdue Status' ? '' : '%'}</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: m.color.bg, color: m.color.text }}>{m.color.label}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
              <div className={cn('h-full rounded-full transition-all', m.label === 'Overdue Status' && d.overdueTasks === 0 && 'bg-emerald-500')} style={{ width: `${Math.min(100, Math.max(0, m.label === 'Overdue Status' ? (d.overdueTasks > 0 ? 100 : 0) : m.value))}%`, background: m.color.hex }} />
            </div>
          </div>
        ))}
      </div>

      {/* Task Completion Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <div className="flex items-center gap-2">
            <ClipboardList size={16} style={{ color: 'var(--cyan)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Task Completion Summary</h3>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-2)' }}>Completed Tasks</span>
                <span className="font-semibold tabular" style={{ color: 'var(--green)' }}>{d.completedTasks} / {d.totalTasks}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                <div className="h-full rounded-full" style={{ width: `${d.completionRate}%`, background: 'var(--green)' }} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--glass-soft)' }}>
              <span style={{ color: 'var(--text-2)' }}>Total tasks tracked</span>
              <span className="font-semibold tabular" style={{ color: 'var(--text-0)' }}>{d.totalTasks}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--glass-soft)' }}>
              <span style={{ color: 'var(--text-2)' }}>Completion rate</span>
              <span className="font-semibold tabular" style={{ color: completion.text }}>{d.completionRate}%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--glass-soft)' }}>
              <span style={{ color: 'var(--text-2)' }}>Overdue</span>
              <span className={cn('font-semibold tabular', d.overdueTasks > 0 ? 'text-red-400' : 'text-emerald-400')}>{d.overdueTasks}</span>
            </div>
          </div>
        </div>

        {/* Project Progress */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <div className="flex items-center gap-2">
            <FolderCheck size={16} style={{ color: 'var(--purple)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Project Progress</h3>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-2)' }}>Project Completion</span>
                <span className="font-semibold tabular" style={{ color: 'var(--purple)' }}>{d.completedProjects} / {d.completedProjects + d.activeProjects}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                <div className="h-full rounded-full" style={{ width: `${d.projectCompletionRate}%`, background: 'var(--purple)' }} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--glass-soft)' }}>
              <span style={{ color: 'var(--text-2)' }}>Active projects</span>
              <span className="font-semibold tabular" style={{ color: 'var(--text-0)' }}>{d.activeProjects}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--glass-soft)' }}>
              <span style={{ color: 'var(--text-2)' }}>Completed projects</span>
              <span className="font-semibold tabular" style={{ color: 'var(--text-0)' }}>{d.completedProjects}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--glass-soft)' }}>
              <span style={{ color: 'var(--text-2)' }}>Completion rate</span>
              <span className="font-semibold tabular" style={{ color: projectCompletion.text }}>{d.projectCompletionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color: 'var(--cyan)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Productivity Insights</h3>
        </div>
        <div className="mt-4 space-y-2">
          {insights.length === 0 ? (
            <p className="py-8 text-center text-xs" style={{ color: 'var(--text-2)' }}>No insights available</p>
          ) : insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--glass-soft)' }}>
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: ins.type === 'success' ? 'rgba(16,185,129,0.1)' : ins.type === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                  color: ins.type === 'success' ? '#10b981' : ins.type === 'warning' ? '#f59e0b' : '#ef4444',
                }}
              >
                {ins.type === 'success' ? <TrendingUp size={12} /> : ins.type === 'warning' ? <TrendingDown size={12} /> : <AlertTriangle size={12} />}
              </span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-1)' }}>{ins.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
