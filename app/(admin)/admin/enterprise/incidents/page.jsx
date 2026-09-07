'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, AlertCircle, Search, Filter,
  Loader2, ChevronDown, Clock, AlertTriangle,
  CheckCircle2, XCircle, Zap, Database,
  ExternalLink, Eye,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await api.get('/enterprise/incidents')
      setIncidents(res.data.incidents || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchIncidents() }, [fetchIncidents])

  const severityColors = {
    LOW: 'bg-blue-500/10 text-blue-400',
    MEDIUM: 'bg-amber-500/10 text-amber-400',
    HIGH: 'bg-orange-500/10 text-orange-400',
    CRITICAL: 'bg-red-500/10 text-red-400',
  }

  const statusColors = {
    OPEN: 'bg-red-500/10 text-red-400',
    INVESTIGATING: 'bg-amber-500/10 text-amber-400',
    RESOLVED: 'bg-emerald-500/10 text-emerald-400',
    CLOSED: 'bg-gray-500/10 text-gray-400',
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
        <ErrorState title="Failed to load incidents" message="Could not reach the incidents server." onRetry={fetchIncidents} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Incident Management</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Incidents</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Track and resolve production incidents.</p>
        </div>
        <button onClick={() => toast.info('Create incident feature coming soon')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
          <Plus size={14} /> Report Incident
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Open', value: incidents.filter(i => i.status === 'OPEN').length, icon: AlertCircle, tone: 'red' },
          { label: 'Investigating', value: incidents.filter(i => i.status === 'INVESTIGATING').length, icon: Zap, tone: 'amber' },
          { label: 'Resolved', value: incidents.filter(i => i.status === 'RESOLVED').length, icon: CheckCircle2, tone: 'green' },
          { label: 'Critical', value: incidents.filter(i => i.severity === 'CRITICAL').length, icon: AlertTriangle, tone: 'red' },
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
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>All Incidents</h2>
        <div className="space-y-2">
          {incidents.length === 0 ? (
            <EmptyState title="No incidents" description="Incidents will appear here when reported." icon={AlertCircle} />
          ) : (
            incidents.map((incident) => (
              <div key={incident.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--red)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', severityColors[incident.severity] || 'bg-gray-500/10 text-gray-400')}>
                  <AlertCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{incident.title}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', severityColors[incident.severity] || '')}>{incident.severity}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', statusColors[incident.status] || '')}>{incident.status}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    {incident.description?.slice(0, 80)}{incident.description?.length > 80 ? '...' : ''} · {incident.impact || 'Unknown impact'}
                  </p>
                </div>
                <div className="text-right text-[11px]" style={{ color: 'var(--text-2)' }}>
                  <p>{timeAgo(incident.createdAt)}</p>
                  <p>{incident.assignedTo?.fullName || 'Unassigned'}</p>
                </div>
                <a href={`/admin/enterprise/incidents/${incident.id}`} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--cyan)' }}>
                  View <Eye size={12} />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}