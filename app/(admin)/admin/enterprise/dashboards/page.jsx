'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import {
  RefreshCw, Plus, LayoutGrid, Search, Filter,
  Loader2, ChevronDown, Grid3X3, Activity,
  BarChart3, Eye, Edit2, Copy, Trash2,
  Layers, Database, Cpu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminDashboardsPage() {
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchDashboards = useCallback(async () => {
    try {
      const res = await api.get('/enterprise/dashboards')
      setDashboards(res.data.dashboards || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboards() }, [fetchDashboards])

  const handleCreate = async () => {
    const name = prompt('Enter dashboard name:')
    if (!name) return
    try {
      await api.post('/enterprise/dashboards', { name, layout: {} })
      toast.success(`Dashboard "${name}" created`)
      fetchDashboards()
    } catch (err) {
      toast.error('Failed to create dashboard')
    }
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
        <ErrorState title="Failed to load dashboards" message="Could not reach the dashboard server." onRetry={fetchDashboards} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Dashboard Builder</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Dashboard Builder</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Create and customize executive dashboards.</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
          <Plus size={14} /> New Dashboard
        </button>
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>All Dashboards</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboards.length === 0 ? (
            <EmptyState title="No dashboards" description="Create your first dashboard to visualize key metrics." icon={LayoutGrid} action={<button onClick={handleCreate} className="btn btn-primary text-xs">Create Dashboard</button>} />
          ) : (
            dashboards.map((db) => (
              <div key={db.id} className="rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30 cursor-pointer" style={{ borderColor: 'var(--stroke)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                    <LayoutGrid size={18} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="rounded-md p-1.5 transition-colors hover:bg-[var(--glass-soft)]" style={{ color: 'var(--text-2)' }}><Edit2 size={14} /></button>
                    <button className="rounded-md p-1.5 transition-colors hover:bg-[var(--glass-soft)]" style={{ color: 'var(--text-2)' }}><Copy size={14} /></button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-0)' }}>{db.name}</h3>
                <p className="text-[11px] mb-3" style={{ color: 'var(--text-2)' }}>{db.description || 'No description'}</p>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-2)' }}>
                  <span className="flex items-center gap-1"><Activity size={12} />{db.widgets?.length || 0} widgets</span>
                  <span className="flex items-center gap-1"><Users size={12} />{db.viewers || 0} viewers</span>
                  <span>Updated {db.updatedAt ? new Date(db.updatedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}