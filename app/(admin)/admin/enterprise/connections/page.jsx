'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import {
  RefreshCw, Plus, Search, Filter,
  Loader2, ChevronDown, Link,
  CheckCircle2, XCircle, AlertTriangle,
  Clock, ExternalLink, User,
  Server, Database, Shield,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminConnectionsPage() {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchConnections = useCallback(async () => {
    try {
      const res = await api.get('/enterprise/connections')
      setConnections(res.data.connections || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchConnections() }, [fetchConnections])

  const typeIcons = {
    API: Server,
    DATABASE: Database,
    OAUTH: Shield,
    WEBHOOK: ExternalLink,
    INTEGRATION: Link,
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
        <ErrorState title="Failed to load connections" message="Could not reach the connections server." onRetry={fetchConnections} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Connections</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Connections</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Manage third-party integrations and connections.</p>
        </div>
        <button onClick={() => toast('Create connection coming soon')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
          <Plus size={14} /> New Connection
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Connections', value: connections.length, icon: Link, tone: 'cyan' },
          { label: 'Active', value: connections.filter(c => c.status === 'ACTIVE').length, icon: CheckCircle2, tone: 'green' },
          { label: 'Errors', value: connections.filter(c => c.status === 'ERROR').length, icon: AlertTriangle, tone: 'red' },
          { label: 'Verified', value: connections.filter(c => c.verified).length, icon: Shield, tone: 'blue' },
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
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>All Connections</h2>
        <div className="space-y-2">
          {connections.length === 0 ? (
            <EmptyState title="No connections" description="Connect third-party services to integrate them." icon={Link} />
          ) : (
            connections.map((conn) => {
              const TypeIcon = typeIcons[conn.type] || Link
              return (
                <div key={conn.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30" style={{ borderColor: 'var(--stroke)' }}>
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', conn.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400')}>
                    <TypeIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{conn.name}</h3>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold" style={{ background: conn.type === 'API' ? 'var(--cyan-soft)' : conn.type === 'DATABASE' ? 'var(--blue-soft)' : 'var(--purple-soft)', color: conn.type === 'API' ? 'var(--cyan)' : conn.type === 'DATABASE' ? 'var(--blue)' : 'var(--purple)' }}>
                        {conn.type}
                      </span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>{conn.provider || conn.type} · {conn.config?.endpoint || 'No endpoint'}</p>
                  </div>
                  <div className="text-right text-[11px]" style={{ color: 'var(--text-2)' }}>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', conn.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : conn.status === 'ERROR' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400')}>
                      {conn.status}
                    </span>
                    <p>{conn.lastSync ? timeAgo(conn.lastSync) : 'Never'}</p>
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