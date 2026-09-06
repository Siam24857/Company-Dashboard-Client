'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { cn, fmtCurrency, timeAgo } from '@/lib/utils'
import { Wallet, TrendingUp, TrendingDown, Hourglass, CheckCircle2, Search, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import StatCard from '@/components/ui/StatCard'
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/Skeletons'
import Pill from '@/components/ui/Pill'
import toast from 'react-hot-toast'

const TYPE_TONE = { INCOME: 'success', EXPENSE: 'critical' }
const STATUS_TONE = { PENDING: 'warn', COMPLETED: 'success', CANCELLED: 'critical' }

export default function WalletPage() {
  const [overview, setOverview] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)
  const [error, setError] = useState(false)
  const [txError, setTxError] = useState(false)

  const [filters, setFilters] = useState({ type: '', status: '', search: '', startDate: '', endDate: '', page: 1 })

  const loadOverview = useCallback(async () => {
    try {
      const res = await api.get('/wallet/overview')
      setOverview(res.data)
      setError(false)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTransactions = useCallback(async () => {
    setTxLoading(true)
    try {
      const params = new URLSearchParams({ page: filters.page, limit: '8' })
      if (filters.type) params.append('type', filters.type)
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      const res = await api.get(`/wallet/transactions?${params}`)
      setTransactions(res.data.transactions)
      setPagination(res.data.pagination)
      setTxError(false)
    } catch (err) {
      setTxError(true)
    } finally {
      setTxLoading(false)
    }
  }, [filters])

  useEffect(() => { loadOverview() }, [loadOverview])
  useEffect(() => { loadTransactions() }, [loadTransactions])

  useEffect(() => {
    const t = setTimeout(() => {
      if (filters.search) loadTransactions()
    }, 350)
    return () => clearTimeout(t)
  }, [filters.search, loadTransactions])

  const applyFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page || 1 }))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="rounded-2xl border border-[var(--stroke)] p-5">
          <div className="skeleton h-5 w-40 rounded" />
          <TableSkeleton className="mt-5" rows={5} cols={5} />
        </div>
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <ErrorState
          title="Could not load your wallet"
          message="The wallet endpoint requires the latest migration. Ensure the backend is running with the updated schema."
          onRetry={() => { setLoading(true); loadOverview() }}
        />
      </div>
    )
  }

  const stats = [
    { label: 'Current balance', value: overview.balance, prefix: '', icon: Wallet, tone: 'cyan', decimals: 2 },
    { label: 'Total earnings', value: overview.income, icon: TrendingUp, tone: 'success', hint: `${overview.completedCount} completed transactions`, decimals: 2 },
    { label: 'Total expenses', value: overview.expenses, icon: TrendingDown, tone: 'critical', decimals: 2 },
    { label: 'Pending amount', value: overview.pending, icon: Hourglass, tone: 'warn', decimals: 2 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono text-xs uppercase tracking-[0.22em] text-[var(--text-2)]">Wallet</p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[var(--text-0)] md:text-3xl">Balance &amp; transactions</h1>
          <p className="mt-1 text-sm text-[var(--text-1)]">Live income, spending and balance from real transactions.</p>
        </div>
        <button type="button" onClick={() => { setLoading(true); loadOverview(); loadTransactions() }} className="icon-btn" aria-label="Refresh wallet">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            tone={s.tone}
            hint={s.hint}
            decimals={s.decimals}
            prefix="$"
          />
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5">
        <div className="flex flex-col gap-3 border-b border-[var(--stroke)] pb-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-0)]">Transaction history</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-2)]" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Search transactions..."
                className="h-9 w-full rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] pl-8 pr-3 text-xs text-[var(--text-0)] outline-none transition-colors focus:border-[var(--cyan)] md:w-52"
              />
            </div>
            <select value={filters.type} onChange={(e) => applyFilter({ type: e.target.value })} className="h-9 rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] px-2.5 text-xs text-[var(--text-0)] outline-none focus:border-[var(--cyan)]">
              <option value="">All types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            <select value={filters.status} onChange={(e) => applyFilter({ status: e.target.value })} className="h-9 rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] px-2.5 text-xs text-[var(--text-0)] outline-none focus:border-[var(--cyan)]">
              <option value="">All status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input type="date" value={filters.startDate} onChange={(e) => applyFilter({ startDate: e.target.value })} className="h-9 rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] px-2 text-xs text-[var(--text-0)] outline-none focus:border-[var(--cyan)]" />
            <input type="date" value={filters.endDate} onChange={(e) => applyFilter({ endDate: e.target.value })} className="h-9 rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] px-2 text-xs text-[var(--text-0)] outline-none focus:border-[var(--cyan)]" />
          </div>
        </div>

        {txLoading ? (
          <TableSkeleton className="mt-5" rows={5} cols={5} />
        ) : txError ? (
          <div className="py-6">
            <ErrorState onRetry={loadTransactions} message="Could not load transactions." />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            className="mt-4 border-0"
            icon={Wallet}
            title="No transactions found"
            description="Adjust your filters, or wait for new income and expenses to be recorded."
          />
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--stroke)] text-left text-[11px] uppercase tracking-wider text-[var(--text-2)]">
                  <th className="py-3 pr-4 font-semibold">Reference</th>
                  <th className="py-3 pr-4 font-semibold">Type</th>
                  <th className="py-3 pr-4 font-semibold">Category</th>
                  <th className="py-3 pr-4 font-semibold">Amount</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--stroke)] text-sm transition-colors hover:bg-[var(--glass-soft)]">
                    <td className="py-3 pr-4">
                      <span className="mono text-xs text-[var(--text-1)]">{t.reference || '—'}</span>
                      {t.description && <p className="mt-0.5 max-w-[220px] truncate text-[11px] text-[var(--text-2)]">{t.description}</p>}
                    </td>
                    <td className="py-3 pr-4"><Pill tone={TYPE_TONE[t.type]}>{t.type.toLowerCase()}</Pill></td>
                    <td className="py-3 pr-4 text-[var(--text-1)]">{t.category}</td>
                    <td className={cn('py-3 pr-4 tabular font-semibold', t.type === 'INCOME' ? 'text-[var(--green)]' : 'text-[var(--red)]')}>
                      {t.type === 'INCOME' ? '+' : '−'}{fmtCurrency(t.amount, false)}
                    </td>
                    <td className="py-3 pr-4"><Pill tone={STATUS_TONE[t.status]} dot>{t.status.toLowerCase()}</Pill></td>
                    <td className="py-3 pr-4 text-xs text-[var(--text-2)]">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!txLoading && !txError && pagination.pages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-[var(--stroke)] pt-4">
            <p className="text-xs text-[var(--text-2)]">
              Page {pagination.page} of {pagination.pages} · {pagination.total} transactions
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={pagination.page <= 1} onClick={() => applyFilter({ page: pagination.page - 1 })} className="icon-btn disabled:opacity-40" aria-label="Previous page">
                <ArrowLeft size={15} />
              </button>
              <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => applyFilter({ page: pagination.page + 1 })} className="icon-btn disabled:opacity-40" aria-label="Next page">
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}