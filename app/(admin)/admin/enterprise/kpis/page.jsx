'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import {
  RefreshCw, Plus, Target, Search, Filter,
  Loader2, ChevronDown, TrendingUp, ArrowUpRight,
  ArrowDownRight, Activity, BarChart3,
  AlertTriangle, CheckCircle2, XCircle,
  Layers, Grid3X3, LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminKPIsPage() {
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [q, setQ] = useState('')

  const fetchKpis = useCallback(async () => {
    try {
      const res = await api.get('/enterprise/kpis')
      setKpis(res.data.kpis || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchKpis() }, [fetchKpis])

  const handleCreateKPI = async () => {
    const name = prompt('Enter KPI name:')
    if (!name) return
    try {
      await api.post('/enterprise/kpis', { name, metric: 'count', threshold: 100 })
      toast.success(`KPI "${name}" created`)
      fetchKpis()
    } catch (err) {
      toast.error('Failed to create KPI')
    }
  }

  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUpRight size={14} className="text-emerald-400" />
    if (value < 0) return <ArrowDownRight size={14} className="text-red-400" />
    return null
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
        <ErrorState title="Failed to load KPIs" message="Could not reach the KPI server." onRetry={fetchKpis} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>KPI Builder</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Custom KPIs</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Create, track, and monitor custom key performance indicators.</p>
        </div>
        <button onClick={handleCreateKPI} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
          <Plus size={14} /> Create KPI
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total KPIs', value: kpis.length, icon: Target, tone: 'cyan' },
          { label: 'Above Target', value: kpis.filter(k => k.status === 'on_target' || k.status === 'above').length, icon: CheckCircle2, tone: 'green' },
          { label: 'At Risk', value: kpis.filter(k => k.status === 'at_risk').length, icon: AlertTriangle, tone: 'orange' },
          { label: 'Below Target', value: kpis.filter(k => k.status === 'below').length, icon: XCircle, tone: 'red' },
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
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>KPI Dashboard</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.length === 0 ? (
            <EmptyState title="No KPIs configured" description="Create your first KPI to start tracking performance." icon={Target} action={<button onClick={handleCreateKPI} className="btn btn-primary text-xs">Create KPI</button>} />
          ) : (
            kpis.map((kpi) => (
              <div key={kpi.id} className="rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{kpi.name}</h3>
                  {getTrendIcon(kpi.trend)}
                </div>
                <div className="mb-2">
                  <span className="text-2xl font-bold" style={{ color: 'var(--cyan)' }}>
                    {kpi.value != null ? kpi.value.toLocaleString() : 'N/A'}
                  </span>
                  <span className="text-xs ml-1" style={{ color: 'var(--text-2)' }}>{kpi.metric || ''}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all"
                    style={{ width: `${Math.min(100, kpi.percentage || 0)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-2)' }}>
                  <span>{kpi.target ? `Target: ${kpi.target}` : 'No target'}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', kpi.status === 'on_target' ? 'bg-emerald-500/10 text-emerald-400' : kpi.status === 'above' ? 'bg-emerald-500/10 text-emerald-400' : kpi.status === 'at_risk' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400')}>
                    {kpi.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}