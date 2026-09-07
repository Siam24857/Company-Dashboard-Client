'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'

export default function AdminKPIDetailPage() {
  const [kpi, setKpi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const kpiId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : ''

  const fetchKpi = useCallback(async () => {
    try {
      const res = await api.get(`/enterprise/kpis/${kpiId}`)
      setKpi(res.data.kpi)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [kpiId])

  useEffect(() => { fetchKpi() }, [fetchKpi])

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error || !kpi) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="KPI not found" message="Could not load KPI details." onRetry={fetchKpi} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <a href="/admin/enterprise/kpis" className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--cyan)' }}>
            KPIs <ArrowRight size={14} />
          </a>
          <span className="text-xs" style={{ color: 'var(--text-2)' }}>/</span>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>{kpi.name}</h1>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Current Value', value: kpi.value != null ? kpi.value.toLocaleString() : 'N/A', icon: Target, tone: 'cyan' },
          { label: 'Target', value: kpi.target || 'N/A', icon: CheckCircle2, tone: 'green' },
          { label: 'Status', value: kpi.status?.replace(/_/g, ' '), icon: AlertTriangle, tone: kpi.status === 'on_target' ? 'green' : kpi.status === 'above' ? 'green' : kpi.status === 'at_risk' ? 'orange' : 'red' },
          { label: 'Trend', value: `${kpi.trend != null ? (kpi.trend > 0 ? '+' : '') + kpi.trend + '%' : 'N/A'}`, icon: ArrowRight, tone: kpi.trend > 0 ? 'green' : kpi.trend < 0 ? 'red' : 'blue' },
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
    </div>
  )
}