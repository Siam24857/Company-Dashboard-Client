'use client'
import { useEffect, useState, useCallback } from 'react'
import { Shield, Activity, Clock, AlertTriangle, LogOut, Filter, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import StatCard from '@/components/ui/StatCard'

const SEVERITY_COLORS = {
  INFO: { hex: '#06b6d4', bg: 'rgba(6,182,212,0.1)', text: '#06b6d4', label: 'INFO' },
  WARNING: { hex: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', label: 'WARNING' },
  CRITICAL: { hex: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#ef4444', label: 'CRITICAL' },
}

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const EVENT_TYPES = ['LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_CHANGED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'MFA_ENABLED', 'MFA_DISABLED', 'USER_APPROVED', 'USER_SUSPENDED', 'USER_REACTIVATED']

export default function SecurityCenterPage() {
  const [summary, setSummary] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [severityFilter, setSeverityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const [sumRes, evtRes] = await Promise.all([
        api.get('/security/summary'),
        api.get('/security/events', { params: { limit: 100 } }),
      ])
      setSummary(sumRes.data)
      setEvents(evtRes.data?.events || [])
    } catch { setError(true) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filteredEvents = events.filter(e => {
    if (severityFilter && e.severity !== severityFilter) return false
    if (typeFilter && e.eventType !== typeFilter) return false
    return true
  })

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-56 rounded-lg" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}</div>
      <div className="skeleton h-72 rounded-2xl" />
    </div>
  )

  if (error) return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load security data" onRetry={load} /></div>

  const s = summary || {}

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Admin</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Security Center</h1>
        </div>
        <button onClick={load} className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Events" value={s.totalEvents} icon={Shield} tone="cyan" />
        <StatCard label="Events (24h)" value={s.recent24h} icon={Activity} tone="purple" />
        <StatCard label="Events (7d)" value={s.recent7d} icon={Clock} tone="blue" />
        <StatCard label="Failed Logins" value={s.failedLogins} icon={LogOut} tone="red" hint="Last 24h" />
      </div>

      {/* By Severity & Type */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>By Severity</h3>
          <div className="mt-4 space-y-3">
            {(s.bySeverity || []).length === 0 ? (
              <p className="py-8 text-center text-xs" style={{ color: 'var(--text-2)' }}>No security events</p>
            ) : s.bySeverity.map((sev, i) => {
              const sc = SEVERITY_COLORS[sev.severity] || SEVERITY_COLORS.INFO
              const total = (s.bySeverity || []).reduce((sum, x) => sum + x.count, 0)
              const pct = total > 0 ? Math.round((sev.count / total) * 100) : 0
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                    <span className="font-semibold tabular" style={{ color: 'var(--text-0)' }}>{sev.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: sc.hex }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>By Event Type</h3>
          <div className="mt-4 space-y-2">
            {(s.byType || []).length === 0 ? (
              <p className="py-8 text-center text-xs" style={{ color: 'var(--text-2)' }}>No events recorded</p>
            ) : s.byType.map((t, i) => {
              const total = (s.byType || []).reduce((sum, x) => sum + x.count, 0)
              const pct = total > 0 ? Math.round((t.count / total) * 100) : 0
              return (
                <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: 'var(--glass-soft)' }}>
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="flex-1 text-xs" style={{ color: 'var(--text-1)' }}>{t.type.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] tabular" style={{ color: 'var(--text-2)' }}>{t.count} ({pct}%)</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Security Events</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-2)' }}>
              <Filter size={12} />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-lg border px-2 py-1 text-[11px] focus:outline-none"
              style={{ borderColor: 'var(--stroke)', background: 'var(--card-hi)', color: 'var(--text-1)' }}
            >
              <option value="">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border px-2 py-1 text-[11px] focus:outline-none"
              style={{ borderColor: 'var(--stroke)', background: 'var(--card-hi)', color: 'var(--text-1)' }}
            >
              <option value="">All Types</option>
              {EVENT_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--text-2)', borderColor: 'var(--stroke)' }} className="border-b">
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Description</th>
                <th className="px-3 py-2 text-center font-medium">Severity</th>
                <th className="px-3 py-2 text-left font-medium">IP</th>
                <th className="px-3 py-2 text-left font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-8 text-center" style={{ color: 'var(--text-2)' }}>No security events match the filters</td></tr>
              ) : filteredEvents.map((ev, i) => {
                const sc = SEVERITY_COLORS[ev.severity] || SEVERITY_COLORS.INFO
                return (
                  <tr key={ev.id || i} className="border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--text-0)' }}>{ev.eventType?.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--text-2)' }}>{ev.description || '—'}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                    </td>
                    <td className="px-3 py-2.5 tabular" style={{ color: 'var(--text-2)' }}>{ev.ipAddress || '—'}</td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--text-2)' }}>{timeAgo(ev.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
