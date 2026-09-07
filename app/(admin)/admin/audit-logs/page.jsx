'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, History, Search, Filter,
  Loader2, Clock, Shield, User, FileText,
  AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, Calendar, Database, Server,
  Activity, Cpu, HardDrive, Terminal,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import useDashboardStore from '@/store/dashboard.store'
import ErrorState from '@/components/ui/ErrorState'

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get('/admin/audit-logs', { params: { page, limit: 50 } })
      setLogs(res.data.logs || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchLogs() }, [fetchLogs])

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
        <ErrorState title="Failed to load audit logs" message="Could not reach the audit server." onRetry={fetchLogs} />
      </div>
    )
  }

  const resultColors = {
    SUCCESS: 'bg-emerald-500/10 text-emerald-400',
    FAILURE: 'bg-red-500/10 text-red-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Audit Trail</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Audit Logs</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Track all administrative actions across the platform.</p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
          <Database size={14} />
          {logs.length} entries · Page {page}/{totalPages}
        </div>
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs" style={{ color: 'var(--text-2)' }}>No audit logs found.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)' }}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                  <Activity size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-0)' }}>{log.action}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', resultColors[log.result] || 'bg-gray-500/10 text-gray-400')}>{log.result}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    {log.description || `${log.actorEmail || 'System'} → ${log.target || 'N/A'}`}
                  </p>
                </div>
                <div className="text-right text-[11px]" style={{ color: 'var(--text-2)' }}>
                  <p>{log.actorEmail || 'System'}</p>
                  <p>{timeAgo(log.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}