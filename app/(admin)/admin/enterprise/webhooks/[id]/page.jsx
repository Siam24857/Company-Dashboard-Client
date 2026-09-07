'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, Search, Filter,
  Loader2, ChevronDown, Clock,
  CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, ExternalLink, Trash2,
  TestTube, Zap,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminWebhookDetailPage() {
  const [webhook, setWebhook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const whId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : ''

  const fetchWebhook = useCallback(async () => {
    try {
      const res = await api.get(`/enterprise/webhooks/${whId}`)
      setWebhook(res.data.webhook)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [whId])

  useEffect(() => { fetchWebhook() }, [fetchWebhook])

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error || !webhook) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Webhook not found" message="Could not load webhook details." onRetry={fetchWebhook} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <a href="/admin/enterprise/webhooks" className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--cyan)' }}>
            Webhooks <ArrowRight size={14} />
          </a>
          <span className="text-xs" style={{ color: 'var(--text-2)' }}>/</span>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>{webhook.name}</h1>
        </div>
        <button onClick={() => toast.info('Edit webhook coming soon')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-1)' }}>
          <Plus size={14} /> Edit
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Status', value: webhook.status, icon: CheckCircle2, tone: webhook.status === 'ACTIVE' ? 'green' : 'red' },
          { label: 'Deliveries', value: webhook.deliveryCount || 0, icon: ExternalLink, tone: 'cyan' },
          { label: 'Errors', value: webhook.errorCount || 0, icon: AlertTriangle, tone: webhook.errorCount > 0 ? 'red' : 'green' },
          { label: 'URL', value: webhook.url?.slice(0, 30) + '...', icon: ExternalLink, tone: 'blue' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{s.label}</span>
              <s.icon size={14} style={{ color: 'var(--text-2)' }} />
            </div>
            <div className="mt-2 text-sm font-bold truncate" style={{ color: 'var(--text-0)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Delivery Log</h2>
        <div className="py-12 text-center text-xs" style={{ color: 'var(--text-2)' }}>
          Delivery logs will be populated from the webhook API.
        </div>
      </div>
    </div>
  )
}