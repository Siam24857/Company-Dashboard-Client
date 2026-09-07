'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'

export default function AdminApprovalsDetailPage() {
  const [approval, setApproval] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const appId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : ''

  const fetchApproval = useCallback(async () => {
    try {
      const res = await api.get(`/enterprise/approvals/${appId}`)
      setApproval(res.data.approval)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [appId])

  useEffect(() => { fetchApproval() }, [fetchApproval])

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error || !approval) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Approval not found" message="Could not load approval details." onRetry={fetchApproval} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <a href="/admin/enterprise/approvals" className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--cyan)' }}>
            Approvals <ArrowRight size={14} />
          </a>
          <span className="text-xs" style={{ color: 'var(--text-2)' }}>/</span>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>{approval.title}</h1>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Status', value: approval.status, icon: CheckCircle2, tone: approval.status === 'APPROVED' ? 'green' : approval.status === 'REJECTED' ? 'red' : 'amber' },
          { label: 'Type', value: approval.type, icon: Briefcase, tone: 'cyan' },
          { label: 'Requester', value: approval.requestedBy?.fullName || approval.requestor || 'Unknown', icon: Users, tone: 'purple' },
          { label: 'Created', value: approval.createdAt ? new Date(approval.createdAt).toLocaleDateString() : 'N/A', icon: Clock, tone: 'blue' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{s.label}</span>
              <s.icon size={14} style={{ color: 'var(--text-2)' }} />
            </div>
            <div className="mt-2 text-sm font-bold" style={{ color: 'var(--text-0)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Approval Details</h2>
        <p className="text-sm" style={{ color: 'var(--text-1)' }}>{approval.description || 'No description provided.'}</p>
      </div>
    </div>
  )
}