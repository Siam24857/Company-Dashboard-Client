'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, CheckCircle2, XCircle, Clock,
  Search, Filter, Loader2, ChevronDown, User,
  FileText, AlertTriangle, ArrowRight,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminApprovalsPage() {
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await api.get('/enterprise/approvals')
      setApprovals(res.data.approvals || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApprovals() }, [fetchApprovals])

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/enterprise/approvals/${id}`, { status: action })
      toast.success(`Approval ${action === 'APPROVED' ? 'approved' : 'rejected'}`)
      fetchApprovals()
    } catch (err) {
      toast.error('Failed to process approval')
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
        <ErrorState title="Failed to load approvals" message="Could not reach the approvals server." onRetry={fetchApprovals} />
      </div>
    )
  }

  const statusColors = {
    PENDING: 'bg-amber-500/10 text-amber-400',
    APPROVED: 'bg-emerald-500/10 text-emerald-400',
    REJECTED: 'bg-red-500/10 text-red-400',
    EXPIRED: 'bg-gray-500/10 text-gray-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Approvals</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Approval Center</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Review and manage pending approvals across the organization.</p>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-2)' }}>
          <span>{approvals.filter(a => a.status === 'PENDING').length} pending</span>
          <span>{approvals.filter(a => a.status === 'APPROVED').length} approved</span>
        </div>
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="space-y-2">
          {approvals.length === 0 ? (
            <EmptyState title="No approvals" description="Approvals will appear here when submitted." icon={CheckCircle2} />
          ) : (
            approvals.map((approval) => (
              <div key={approval.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--amber)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{approval.title}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', statusColors[approval.status] || '')}>{approval.status}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    Requested by {approval.requestedBy?.fullName || approval.requestor} · {approval.type}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
                  <span>{timeAgo(approval.createdAt)}</span>
                </div>
                {approval.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAction(approval.id, 'APPROVED')} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button onClick={() => handleAction(approval.id, 'REJECTED')} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}