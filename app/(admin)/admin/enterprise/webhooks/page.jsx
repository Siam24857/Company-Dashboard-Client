'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, Webhook, Search, Filter,
  Loader2, AlertCircle, CheckCircle2, XCircle,
  Clock, ChevronDown, Zap,
  ExternalLink, Trash2, TestTube,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [q, setQ] = useState('')

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await api.get('/enterprise/webhooks')
      setWebhooks(res.data.webhooks || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWebhooks() }, [fetchWebhooks])

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
        <ErrorState title="Failed to load webhooks" message="Could not reach the webhooks server." onRetry={fetchWebhooks} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Webhook Manager</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Webhooks</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Manage outbound webhooks and event deliveries.</p>
        </div>
        <button onClick={() => toast.info('Create webhook feature coming soon')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
          <Plus size={14} /> New Webhook
        </button>
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm font-bold" style={{ color: 'var(--text-0)' }}>All Webhooks</h2>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
            <span>{webhooks.length} total</span>
            <span>·</span>
            <span>{webhooks.filter(w => w.status === 'ACTIVE').length} active</span>
          </div>
        </div>
        <div className="space-y-2">
          {webhooks.length === 0 ? (
            <EmptyState title="No webhooks configured" description="Add webhooks to send events to external systems." icon={Webhook} />
          ) : (
            webhooks.map((wh) => (
              <div key={wh.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: wh.status === 'ACTIVE' ? 'var(--green-soft)' : 'var(--red-soft)', color: wh.status === 'ACTIVE' ? 'var(--green)' : 'var(--red)' }}>
                  <Webhook size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{wh.name}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', wh.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
                      {wh.status}
                    </span>
                  </div>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-2)' }}>{wh.url}</p>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
                  <span className="flex items-center gap-1"><CheckCircle2 size={12} />{wh.deliveryCount || 0}</span>
                  <span className="flex items-center gap-1"><ExternalLink size={12} />{wh.errorCount || 0}</span>
                </div>
                <a href={`/admin/enterprise/webhooks/${wh.id}`} className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--cyan)' }}>
                  Configure
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}