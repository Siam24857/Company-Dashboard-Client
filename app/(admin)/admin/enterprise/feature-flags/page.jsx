'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, ShieldCheck, Search, Filter,
  Loader2, ToggleLeft, ToggleRight, CheckCircle2,
  XCircle, Clock, AlertTriangle, ChevronDown,
  Eye, EyeOff, Key, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [q, setQ] = useState('')

  const fetchFlags = useCallback(async () => {
    try {
      const res = await api.get('/enterprise/feature-flags')
      setFlags(res.data.flags || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFlags() }, [fetchFlags])

  const toggleFlag = async (flag) => {
    try {
      await api.patch(`/enterprise/feature-flags/${flag.id}`, { enabled: !flag.enabled })
      toast.success(`Flag "${flag.name}" ${!flag.enabled ? 'enabled' : 'disabled'}`)
      fetchFlags()
    } catch (err) {
      toast.error('Failed to toggle flag')
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
        <ErrorState title="Failed to load feature flags" message="Could not reach the feature flags server." onRetry={fetchFlags} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Feature Flags</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Feature Flags</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Toggle features on/off across the platform.</p>
        </div>
        <button onClick={() => toast('Create flag feature coming soon')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
          <Plus size={14} /> New Flag
        </button>
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm font-bold" style={{ color: 'var(--text-0)' }}>All Flags</h2>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
            <span>{flags.filter(f => f.enabled).length} enabled</span>
            <span>·</span>
            <span>{flags.filter(f => !f.enabled).length} disabled</span>
          </div>
        </div>
        <div className="space-y-2">
          {flags.length === 0 ? (
            <EmptyState title="No feature flags" description="Create flags to control feature rollouts." icon={ShieldCheck} />
          ) : (
            flags.map((flag) => (
              <div key={flag.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: flag.enabled ? 'var(--green-soft)' : 'var(--red-soft)', color: flag.enabled ? 'var(--green)' : 'var(--red)' }}>
                  {flag.enabled ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{flag.name}</h3>
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold" style={{ background: flag.enabled ? 'var(--green-soft)' : 'var(--red-soft)', color: flag.enabled ? 'var(--green)' : 'var(--red)' }}>
                      {flag.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    {flag.description || 'No description'} · Key: {flag.key || 'N/A'}
                  </p>
                </div>
                <button onClick={() => toggleFlag(flag)} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ color: flag.enabled ? 'var(--green)' : 'var(--text-2)' }}>
                  {flag.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}