'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import Pill from '@/components/ui/Pill'
import ErrorState from '@/components/ui/ErrorState'
import { LifeBuoy, MessageSquare, Search, ChevronDown } from 'lucide-react'

const STATUS_TONE = {
  OPEN: { tone: 'info', label: 'OPEN' },
  IN_PROGRESS: { tone: 'warn', label: 'IN PROGRESS' },
  WAITING: { tone: 'ai', label: 'WAITING' },
  RESOLVED: { tone: 'success', label: 'RESOLVED' },
  CLOSED: { tone: null, label: 'CLOSED' },
}

const PRIORITY_TONE = { LOW: 'info', MEDIUM: 'warn', HIGH: 'critical' }

const STATUS_TABS = ['ALL', 'OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get('/support?limit=50'),
        api.get('/support/stats'),
      ])
      setTickets(listRes.data.tickets)
      setStats(statsRes.data.stats)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </div>
    )
  }

  if (error) {
    return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Could not load support tickets" onRetry={fetchAll} /></div>
  }

  const filtered = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    const q = search.toLowerCase()
    const matchesSearch = !q || (t.subject || '').toLowerCase().includes(q) || (t.requester?.fullName || '').toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  const s = stats || {}

  return (
    <div className="space-y-6">
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Assistance</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Support Center</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Track and manage support tickets.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Tickets" value={s.total ?? 0} icon={LifeBuoy} tone="cyan" />
        <StatCard label="Open" value={s.open ?? 0} icon={MessageSquare} tone="blue" />
        <StatCard label="In Progress" value={s.inProgress ?? 0} icon={MessageSquare} tone="amber" />
        <StatCard label="Waiting" value={s.waiting ?? 0} icon={MessageSquare} tone="purple" />
        <StatCard label="Resolved" value={s.resolved ?? 0} icon={MessageSquare} tone="green" />
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--stroke)] p-5 text-left" style={{ background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>Closed</p>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--glass-soft)', color: 'var(--text-2)' }}>
              <MessageSquare size={18} strokeWidth={1.75} />
            </span>
          </div>
          <div className="mt-4">
            <p className="tabular text-3xl font-semibold tracking-tight" style={{ color: 'var(--text-0)' }}>{s.closed ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors',
                statusFilter === tab ? 'text-white' : ''
              )}
              style={statusFilter === tab ? { background: 'var(--cyan)', color: 'var(--bg)' } : { background: 'var(--glass-soft)', color: 'var(--text-2)', border: '1px solid var(--stroke)' }}
            >
              {tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-2)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="h-9 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-colors md:w-64"
            style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: 'var(--stroke)' }}>
          <MessageSquare size={32} className="mx-auto" style={{ color: 'var(--text-2)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--text-2)' }}>No tickets found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => {
            const isOpen = expanded === ticket.id
            const messages = ticket.messages || []
            return (
              <div
                key={ticket.id}
                className="overflow-hidden rounded-2xl border transition-colors"
                style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : ticket.id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}
                    >
                      <LifeBuoy size={16} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{ticket.subject}</p>
                      <p className="truncate text-[11px]" style={{ color: 'var(--text-2)' }}>
                        {ticket.requester?.fullName || 'Unknown'} · {timeAgo(ticket.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {(() => {
                      const meta = STATUS_TONE[ticket.status] || STATUS_TONE.OPEN
                      return meta.tone ? (
                        <Pill tone={meta.tone} dot>{meta.label}</Pill>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide" style={{ background: 'var(--glass-soft)', color: 'var(--text-2)', border: '1px solid var(--stroke)' }}>
                          {meta.label}
                        </span>
                      )
                    })()}
                    <Pill tone={PRIORITY_TONE[ticket.priority] || 'info'}>{ticket.priority || 'LOW'}</Pill>
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-2)' }}>
                      <MessageSquare size={12} /> {messages.length}
                    </span>
                    <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} style={{ color: 'var(--text-2)' }} />
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t px-4 py-4" style={{ borderColor: 'var(--stroke)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{ticket.description || 'No description provided.'}</p>
                    <div className="mt-4 space-y-3">
                      {messages.length === 0 ? (
                        <p className="text-xs" style={{ color: 'var(--text-2)' }}>No messages yet.</p>
                      ) : (
                        messages.map((m, i) => (
                          <div key={i} className="rounded-xl border p-3" style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)' }}>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold" style={{ color: 'var(--text-0)' }}>
                                {m.sender?.fullName || m.sender?.email || 'Support'}
                                <span className="ml-2 font-normal" style={{ color: 'var(--text-2)' }}>{timeAgo(m.createdAt)}</span>
                              </p>
                              {m.isStaff && <Pill tone="ai">Staff</Pill>}
                            </div>
                            <p className="mt-1.5 text-sm" style={{ color: 'var(--text-1)' }}>{m.body || m.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
