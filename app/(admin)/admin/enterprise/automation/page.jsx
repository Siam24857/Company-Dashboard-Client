'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, Zap, Search, Filter,
  Loader2, ChevronDown, Play, Pause,
  Wrench, AlertCircle, CheckCircle2,
  Clock, Database, Cpu, Layers,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminAutomationPage() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchRules = useCallback(async () => {
    try {
      const res = await api.get('/enterprise/automation')
      setRules(res.data.rules || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRules() }, [fetchRules])

  const toggleRule = async (rule) => {
    try {
      await api.patch(`/enterprise/automation/${rule.id}`, { enabled: !rule.enabled })
      toast.success(`Rule "${rule.name}" ${!rule.enabled ? 'enabled' : 'disabled'}`)
      fetchRules()
    } catch (err) {
      toast.error('Failed to toggle rule')
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
        <ErrorState title="Failed to load automation rules" message="Could not reach the automation server." onRetry={fetchRules} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Automation</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Automation Rules</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Create and manage automated workflows and triggers.</p>
        </div>
        <button onClick={() => toast.info('Create rule feature coming soon')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--violet)', color: 'var(--violet)' }}>
          <Plus size={14} /> New Rule
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Rules', value: rules.length, icon: Zap, tone: 'violet' },
          { label: 'Active', value: rules.filter(r => r.enabled).length, icon: CheckCircle2, tone: 'green' },
          { label: 'Executions Today', value: rules.reduce((s, r) => s + (r.executionsToday || 0), 0), icon: Database, tone: 'cyan' },
          { label: 'Avg Runtime', value: `${Math.round(rules.reduce((s, r) => s + (r.avgRuntime || 0), 0) / Math.max(rules.length, 1))}ms`, icon: Clock, tone: 'blue' },
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
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>All Rules</h2>
        <div className="space-y-2">
          {rules.length === 0 ? (
            <EmptyState title="No automation rules" description="Create rules to automate repetitive tasks." icon={Zap} />
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--violet)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>
                  <Zap size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{rule.name}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', rule.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400')}>
                      {rule.enabled ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    {rule.trigger} → {rule.action} · {rule.executionsToday || 0} executions today
                  </p>
                </div>
                <button onClick={() => toggleRule(rule)} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ color: rule.enabled ? 'var(--violet)' : 'var(--text-2)' }}>
                  {rule.enabled ? <Play size={16} /> : <Pause size={16} />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}