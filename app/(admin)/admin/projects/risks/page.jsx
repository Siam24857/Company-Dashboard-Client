'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, AlertTriangle, Shield, Search,
  Filter, Loader2, ArrowRight, Calendar, Target,
  ChevronDown, Wrench, XCircle, CheckCircle2,
  GitBranch, Lock, Clock,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import useDashboardStore from '@/store/dashboard.store'
import StatCard from '@/components/ui/StatCard'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminRisksPage() {
  const [risks, setRisks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [q, setQ] = useState('')

  const fetchAll = useCallback(async () => {
    try {
      const [risksRes, projectsRes] = await Promise.all([
        api.get('/projects/risks').catch(() => ({ data: { risks: [] } })),
        api.get('/projects').catch(() => ({ data: { projects: [] } })),
      ])
      setRisks(risksRes.data.risks || [])
      setProjects(projectsRes.data.projects || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const severityColors = {
    LOW: 'bg-emerald-500/10 text-emerald-400',
    MEDIUM: 'bg-amber-500/10 text-amber-400',
    HIGH: 'bg-orange-500/10 text-orange-400',
    CRITICAL: 'bg-red-500/10 text-red-400',
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
        <ErrorState title="Failed to load risks" message="Could not reach the risk server." onRetry={fetchAll} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Risk Management</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Project Risks</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Identify, track, and mitigate project risks across the organization.</p>
        </div>
        <button onClick={() => toast.info('Create risk feature coming soon')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
          <Plus size={14} /> Add Risk
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Risks', value: risks.length, icon: AlertTriangle, tone: 'cyan' },
          { label: 'Critical', value: risks.filter(r => r.severity === 'CRITICAL').length, icon: Shield, tone: 'red' },
          { label: 'High', value: risks.filter(r => r.severity === 'HIGH').length, icon: AlertTriangle, tone: 'orange' },
          { label: 'Open', value: risks.filter(r => r.status === 'OPEN').length, icon: Clock, tone: 'amber' },
        ].map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>All Risks</h2>
        <div className="space-y-3">
          {risks.length === 0 ? (
            <EmptyState title="No risks identified" description="Start creating risk entries to track potential issues." icon={AlertTriangle} />
          ) : (
            risks.map((risk) => (
              <div key={risk.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--red)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', severityColors[risk.severity] || 'bg-gray-500/10 text-gray-400')}>
                  <AlertTriangle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{risk.title}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', severityColors[risk.severity] || '')}>{risk.severity}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', risk.status === 'OPEN' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400')}>{risk.status}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    {risk.description?.slice(0, 80)}{risk.description?.length > 80 ? '...' : ''} · {risk.probability} probability · Owner: {risk.owner || 'Unassigned'}
                  </p>
                </div>
                <a href={`/admin/projects/${risk.projectId}`} className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--cyan)' }}>
                  View Project <ArrowRight size={12} />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}