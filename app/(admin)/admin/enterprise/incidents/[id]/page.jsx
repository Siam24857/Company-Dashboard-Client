'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, Search, Filter,
  Loader2, ChevronDown, Clock,
  CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, Target, Briefcase,
  Calendar, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminIncidentDetailPage() {
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const incId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : ''

  const fetchIncident = useCallback(async () => {
    try {
      const res = await api.get(`/enterprise/incidents/${incId}`)
      setIncident(res.data.incident)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [incId])

  useEffect(() => { fetchIncident() }, [fetchIncident])

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Incident not found" message="Could not load incident details." onRetry={fetchIncident} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <a href="/admin/enterprise/incidents" className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--cyan)' }}>
            Incidents <ArrowRight size={14} />
          </a>
          <span className="text-xs" style={{ color: 'var(--text-2)' }}>/</span>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>{incident.title}</h1>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Severity', value: incident.severity, icon: AlertTriangle, tone: incident.severity === 'CRITICAL' ? 'red' : incident.severity === 'HIGH' ? 'orange' : 'blue' },
          { label: 'Status', value: incident.status, icon: CheckCircle2, tone: incident.status === 'RESOLVED' ? 'green' : 'red' },
          { label: 'Impact', value: incident.impact || 'Unknown', icon: Target, tone: 'cyan' },
          { label: 'Assigned To', value: incident.assignedTo?.fullName || 'Unassigned', icon: Users, tone: 'purple' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{s.label}</span>
              <s.icon size={14} style={{ color: 'var(--text-2)' }} />
            </div>
            <div className="mt-2 text-sm font-bold" style={{ color: 'var(--text-0)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Incident Details</h2>
        <p className="text-sm" style={{ color: 'var(--text-1)' }}>{incident.description || 'No description provided.'}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stroke)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>Created</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-0)' }}>{incident.createdAt ? new Date(incident.createdAt).toLocaleString() : 'N/A'}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stroke)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>Resolved</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-0)' }}>{incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'Not yet'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}