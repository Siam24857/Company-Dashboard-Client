'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import {
  RefreshCw, Plus, CalendarCheck, Search, Filter,
  Loader2, ChevronDown, Target, Clock,
  CheckCircle2, AlertTriangle, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminMilestonesPage() {
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchMilestones = useCallback(async () => {
    try {
      const res = await api.get('/projects/milestones')
      setMilestones(res.data.milestones || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMilestones() }, [fetchMilestones])

  const statusColors = {
    NOT_STARTED: 'bg-gray-500/10 text-gray-400',
    IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400',
    DELAYED: 'bg-red-500/10 text-red-400',
  }

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Failed to load milestones" message="Could not reach the milestones server." onRetry={fetchMilestones} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Milestones</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Milestones</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Track project milestones and key deliverables.</p>
        </div>
        <button onClick={() => toast.info('Create milestone coming soon')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
          <Plus size={14} /> New Milestone
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Milestones', value: milestones.length, icon: Target, tone: 'cyan' },
          { label: 'Completed', value: milestones.filter(m => m.status === 'COMPLETED').length, icon: CheckCircle2, tone: 'green' },
          { label: 'In Progress', value: milestones.filter(m => m.status === 'IN_PROGRESS').length, icon: Clock, tone: 'blue' },
          { label: 'Delayed', value: milestones.filter(m => m.status === 'DELAYED').length, icon: AlertTriangle, tone: 'red' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{s.label}</span>
              <s.icon size={14} style={{ color: 'var(--text-2)' }} />
            </div>
            <div className="mt-2 text-lg font-bold" style={{ color: 'var(--text-0)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>All Milestones</h2>
        <div className="space-y-2">
          {milestones.length === 0 ? (
            <EmptyState title="No milestones" description="Create milestones to track project progress." icon={CalendarCheck} />
          ) : (
            milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', m.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : m.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400')}>
                  <Target size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{m.title}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', statusColors[m.status] || '')}>{m.status?.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    {m.project?.name || 'Unknown project'} · Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'No date'}
                  </p>
                </div>
                <div className="text-right text-[11px]" style={{ color: 'var(--text-2)' }}>
                  <p>{m.progress || 0}% complete</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}