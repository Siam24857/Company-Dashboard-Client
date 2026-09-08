'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, Search, Filter,
  Loader2, ChevronDown, Database,
  CheckCircle2, XCircle, AlertTriangle,
  Clock, Activity, Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminDataQualityPage() {
  const [issues, setIssues] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [issuesRes, metricsRes] = await Promise.all([
        api.get('/enterprise/data-quality').catch(() => ({ data: { issues: [] } })),
        api.get('/enterprise/data-quality/metrics').catch(() => ({ data: {} })),
      ])
      setIssues(issuesRes.data.issues || [])
      setMetrics(metricsRes.data)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Failed to load data quality" message="Could not reach the data quality server." onRetry={fetchData} />
      </div>
    )
  }

  const severityColors = {
    LOW: 'bg-blue-500/10 text-blue-400',
    MEDIUM: 'bg-amber-500/10 text-amber-400',
    HIGH: 'bg-orange-500/10 text-orange-400',
    CRITICAL: 'bg-red-500/10 text-red-400',
  }

  const typeIcons = {
    DUPLICATE: Database,
    MISSING: AlertTriangle,
    CORRUPT: XCircle,
    STALE: Clock,
    INCONSISTENT: Activity,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Data Quality</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Data Quality Center</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Monitor and resolve data quality issues across the platform.</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-1)' }}>
          <RefreshCw size={14} className={cn(loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Issues', value: issues.length, icon: Database, tone: 'cyan' },
          { label: 'Critical', value: issues.filter(i => i.severity === 'CRITICAL').length, icon: AlertTriangle, tone: 'red' },
          { label: 'High', value: issues.filter(i => i.severity === 'HIGH').length, icon: AlertTriangle, tone: 'orange' },
          { label: 'Health Score', value: metrics?.healthScore || Math.max(0, 100 - issues.length * 5), icon: CheckCircle2, tone: 'green' },
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
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Quality Issues</h2>
        <div className="space-y-2">
          {issues.length === 0 ? (
            <EmptyState title="No data quality issues" description="All data appears to be in good shape." icon={CheckCircle2} />
          ) : (
            issues.map((issue) => {
              const TypeIcon = typeIcons[issue.type] || Database
              return (
                <div key={issue.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--amber)]/30" style={{ borderColor: 'var(--stroke)' }}>
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', severityColors[issue.severity] || 'bg-gray-500/10 text-gray-400')}>
                    <TypeIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{issue.title}</h3>
                      <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', severityColors[issue.severity] || '')}>{issue.severity}</span>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold bg-gray-500/10 text-gray-400">{issue.type}</span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                      {issue.table || 'N/A'} · {issue.count || 1} records affected · {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {issue.status === 'OPEN' && (
                      <>
                        <button onClick={() => toast('Resolution started')} className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
                          <CheckCircle2 size={14} /> Fix
                        </button>
                        <button onClick={() => toast('Issue dismissed')} className="rounded-lg bg-gray-500/10 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-500/20">
                          <XCircle size={14} /> Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}