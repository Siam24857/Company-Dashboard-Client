'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, Search, Filter,
  Loader2, ChevronDown, Clock,
  CheckCircle2, XCircle, AlertCircle,
  Play, Pause, Database, Cpu,
  Layers, Zap, BarChart3,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.get('/enterprise/jobs')
      setJobs(res.data.jobs || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const toggleJob = async (job) => {
    try {
      await api.patch(`/enterprise/jobs/${job.id}`, { status: job.status === 'RUNNING' ? 'PAUSED' : 'RUNNING' })
      toast.success(`Job "${job.name}" ${job.status === 'RUNNING' ? 'paused' : 'resumed'}`)
      fetchJobs()
    } catch (err) {
      toast.error('Failed to toggle job')
    }
  }

  const statusColors = {
    RUNNING: 'bg-emerald-500/10 text-emerald-400',
    PAUSED: 'bg-amber-500/10 text-amber-400',
    COMPLETED: 'bg-blue-500/10 text-blue-400',
    FAILED: 'bg-red-500/10 text-red-400',
    PENDING: 'bg-gray-500/10 text-gray-400',
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
        <ErrorState title="Failed to load background jobs" message="Could not reach the jobs server." onRetry={fetchJobs} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Background Jobs</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Background Jobs</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Monitor and manage background job processing.</p>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-2)' }}>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> {jobs.filter(j => j.status === 'RUNNING').length} running</span>
          <span>{jobs.length} total</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Running', value: jobs.filter(j => j.status === 'RUNNING').length, icon: Play, tone: 'green' },
          { label: 'Paused', value: jobs.filter(j => j.status === 'PAUSED').length, icon: Pause, tone: 'amber' },
          { label: 'Failed', value: jobs.filter(j => j.status === 'FAILED').length, icon: XCircle, tone: 'red' },
          { label: 'Total Executed', value: jobs.reduce((s, j) => s + (j.executions || 0), 0), icon: Database, tone: 'cyan' },
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
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>All Jobs</h2>
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <EmptyState title="No background jobs" description="Background jobs will appear here when scheduled." icon={Clock} />
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', job.status === 'RUNNING' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400')}>
                  {job.status === 'RUNNING' ? <Play size={18} /> : <Clock size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{job.name}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', statusColors[job.status] || '')}>{job.status}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    {job.type} · {job.executions || 0} executions · Last: {job.lastRun ? timeAgo(job.lastRun) : 'Never'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {job.status === 'RUNNING' && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live
                    </span>
                  )}
                  <span className="text-[11px]" style={{ color: 'var(--text-2)' }}>{job.lastDuration ? `${job.lastDuration}ms` : '—'}</span>
                </div>
                <button onClick={() => toggleJob(job)} className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: job.status === 'RUNNING' ? 'var(--amber)' : 'var(--cyan)' }}>
                  {job.status === 'RUNNING' ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}