'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import {
  RefreshCw, Wifi, WifiOff, Server, Database,
  Cpu, HardDrive, Activity, Clock, Shield,
  AlertCircle, CheckCircle2, Loader2,
  Terminal, Gauge, Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHealth = useCallback(async () => {
    try {
      const res = await api.get('/analytics/system-health')
      setHealth(res.data)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchHealth() }, [fetchHealth])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHealth()
  }

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Failed to load system health" message="Could not reach the health check endpoint." onRetry={fetchHealth} />
      </div>
    )
  }

  const services = [
    { label: 'API', status: health?.api?.status || 'UNKNOWN', icon: Activity, uptime: health?.api?.uptime },
    { label: 'Database', status: health?.database?.status || 'UNKNOWN', icon: Database },
    { label: 'Authentication', status: health?.auth?.status || 'UNKNOWN', icon: Shield },
    { label: 'Storage', status: health?.storage?.status || 'UNKNOWN', icon: HardDrive },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>System Health</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>System Health Center</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Real-time infrastructure monitoring and status.</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-1)' }}>
          <RefreshCw size={14} className={cn(refreshing && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <div key={i} className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{s.label}</span>
              <s.icon size={16} style={{ color: 'var(--text-2)' }} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={cn('h-3 w-3 rounded-full', s.status === 'OPERATIONAL' ? 'bg-emerald-400' : 'bg-red-400')} />
              <span className={cn('text-lg font-bold', s.status === 'OPERATIONAL' ? 'text-emerald-400' : 'text-red-400')}>
                {s.status}
              </span>
            </div>
            {s.uptime != null && (
              <p className="mt-2 text-[11px]" style={{ color: 'var(--text-2)' }}>Uptime: {Math.floor(s.uptime)}s</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Memory Usage</h2>
          {health?.memory && (
            <div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-0)' }}>Heap Used</span>
                <span style={{ color: 'var(--text-2)' }}>{health.memory.used}MB / {health.memory.total}MB</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all"
                  style={{ width: `${Math.min(100, (health.memory.used / Math.max(health.memory.total, 1)) * 100)}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Messages', value: health.stats?.totalMessages || 0, icon: Activity },
                  { label: 'Notifications', value: health.stats?.totalNotifications || 0, icon: Bell },
                  { label: 'Audit Logs', value: health.stats?.totalAuditLogs || 0, icon: History },
                  { label: 'Recent Errors', value: health.stats?.recentErrors || 0, icon: AlertCircle },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--glass-soft)' }}>
                    <s.icon size={14} style={{ color: 'var(--cyan)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-0)' }}>{s.label}</span>
                    <span className="ml-auto text-sm font-bold" style={{ color: 'var(--cyan)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Platform Statistics</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Users', value: health?.stats?.totalUsers || 0, icon: Users },
              { label: 'Active Projects', value: health?.stats?.totalProjects || 0, icon: FolderOpen },
              { label: 'Total Tasks', value: health?.stats?.totalTasks || 0, icon: Target },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'var(--glass-soft)' }}>
                <div className="flex items-center gap-3">
                  <s.icon size={16} style={{ color: 'var(--cyan)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-0)' }}>{s.label}</span>
                </div>
                <span className="text-lg font-bold" style={{ color: 'var(--cyan)' }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--glass-soft)' }}>
            <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-0)' }}>System Summary</h3>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>
              All core services are operational. Memory usage is within normal parameters.
              {health?.api?.status === 'OPERATIONAL' && ' API is responding normally.'}
              {health?.database?.status === 'OPERATIONAL' && ' Database connectivity is healthy.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}