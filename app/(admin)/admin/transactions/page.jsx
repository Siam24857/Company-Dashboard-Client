'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { cn, timeAgo, fmtNum } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import StatCard from '@/components/ui/StatCard'
import { DollarSign, TrendingUp, Wallet, Clock, Search, RefreshCw, ChevronLeft, ChevronRight, ArrowDownRight, ArrowUpRight } from 'lucide-react'

const STATUS_COLORS = {
  COMPLETED: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  PENDING: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  CANCELLED: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
}

const TYPE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Income', value: 'INCOME' },
  { label: 'Expense', value: 'EXPENSE' },
]

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function TransactionsPage() {
  const [data, setData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (typeFilter) params.append('type', typeFilter)
      if (statusFilter) params.append('status', statusFilter)
      const [overviewRes, txnRes] = await Promise.all([
        api.get('/wallet/overview'),
        api.get(`/wallet/transactions?${params.toString()}`),
      ])
      setData(overviewRes.data)
      setTransactions(txnRes.data.transactions)
      setTotalPages(txnRes.data.pagination.pages)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = search
    ? transactions.filter(t => (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.reference || '').toLowerCase().includes(search.toLowerCase()))
    : transactions

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-7 w-48 rounded-lg" />
            <div className="skeleton h-4 w-60 rounded-lg" />
          </div>
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
        <div className="grid gap-3 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load transactions" onRetry={fetchData} /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Finance</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Transactions</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>Financial transaction ledger and balance overview.</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-1)' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Balance" value={fmtNum(data?.balance || 0)} icon={Wallet} tone="cyan" prefix="$" />
        <StatCard label="Total Income" value={fmtNum(data?.income || 0)} icon={TrendingUp} tone="green" prefix="$" />
        <StatCard label="Total Expenses" value={fmtNum(data?.expenses || 0)} icon={DollarSign} tone="red" prefix="$" />
        <StatCard label="Pending" value={fmtNum(data?.pending || 0)} icon={Clock} tone="amber" prefix="$" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--stroke)' }}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setTypeFilter(f.value); setPage(1) }}
              className={cn('px-3 py-1.5 text-[11px] font-medium transition-colors')}
              style={typeFilter === f.value ? { background: 'var(--cyan)', color: 'var(--bg)' } : { color: 'var(--text-2)' }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--stroke)' }}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1) }}
              className={cn('px-3 py-1.5 text-[11px] font-medium transition-colors')}
              style={statusFilter === f.value ? { background: 'var(--cyan)', color: 'var(--bg)' } : { color: 'var(--text-2)' }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-2)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none"
            style={{ borderColor: 'var(--stroke)', color: 'var(--text-0)', background: 'transparent' }}
          />
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--text-2)' }} className="border-b">
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Reference</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center" style={{ color: 'var(--text-2)' }}>No transactions found</td></tr>
              ) : filtered.map(t => {
                const sc = STATUS_COLORS[t.status] || STATUS_COLORS.PENDING
                const isIncome = t.type === 'INCOME'
                return (
                  <tr key={t.id} className="border-b transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)' }}>
                    <td className="px-4 py-2.5">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
                        {isIncome ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--text-0)' }}>{t.category}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-2)' }}>{t.description || '-'}</td>
                    <td className={cn('px-4 py-2.5 text-right font-semibold tabular', isIncome ? 'text-emerald-400' : 'text-red-400')}>
                      {isIncome ? '+' : '-'}${fmtNum(t.amount)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: sc.bg, color: sc.color }}>{t.status}</span>
                    </td>
                    <td className="px-4 py-2.5 mono" style={{ color: 'var(--text-2)' }}>{t.reference || '-'}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-2)' }}>{timeAgo(t.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors hover:bg-[var(--glass-soft)] disabled:opacity-50"
                style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors hover:bg-[var(--glass-soft)] disabled:opacity-50"
                style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
