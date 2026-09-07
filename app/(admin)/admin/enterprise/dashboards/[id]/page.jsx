'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'

export default function AdminDashboardDetailPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const dbId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : ''

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get(`/enterprise/dashboards/${dbId}`)
      setDashboard(res.data.dashboard)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [dbId])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Dashboard not found" message="Could not load dashboard details." onRetry={fetchDashboard} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <a href="/admin/enterprise/dashboards" className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--cyan)' }}>
            Dashboards <ArrowRight size={14} />
          </a>
          <span className="text-xs" style={{ color: 'var(--text-2)' }}>/</span>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>{dashboard.name}</h1>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Widgets', value: dashboard.widgets?.length || 0, icon: Grid3X3, tone: 'cyan' },
          { label: 'Viewers', value: dashboard.viewers || 0, icon: Users, tone: 'green' },
          { label: 'Created', value: dashboard.createdAt ? new Date(dashboard.createdAt).toLocaleDateString() : 'N/A', icon: Clock, tone: 'blue' },
          { label: 'Updated', value: dashboard.updatedAt ? new Date(dashboard.updatedAt).toLocaleDateString() : 'N/A', icon: RefreshCw, tone: 'purple' },
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
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Dashboard Layout</h2>
        <div className="py-12 text-center text-xs" style={{ color: 'var(--text-2)' }}>
          Dashboard content will be rendered here.
        </div>
      </div>
    </div>
  )
}