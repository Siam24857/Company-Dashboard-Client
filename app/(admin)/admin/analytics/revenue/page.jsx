'use client'
import { useEffect, useState, useCallback } from 'react'
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { cn, fmtNum } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import StatCard from '@/components/ui/StatCard'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts'

const PERIODS = [
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' },
]

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function RevenueAnalyticsPage() {
  const [period, setPeriod] = useState('6m')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const res = await api.get(`/analytics/revenue?period=${period}`)
      setData(res.data)
    } catch { setError(true) } finally { setLoading(false) }
  }, [period])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
  if (error) return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Failed to load revenue data" onRetry={load} /></div>

  const s = data?.summary || {}
  const monthly = data?.monthly || []
  const byCategory = data?.byCategory || []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Finance</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Revenue Analytics</h1>
        </div>
        <div className="flex rounded-lg border" style={{ borderColor: 'var(--stroke)' }}>
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)} className={cn('px-3 py-1.5 text-[11px] font-medium transition-colors', period === p.value ? 'text-white' : '')} style={period === p.value ? { background: 'var(--cyan)', color: 'var(--bg)' } : { color: 'var(--text-2)' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={fmtNum(s.totalRevenue)} icon={DollarSign} tone="green" prefix="$" />
        <StatCard label="Avg Monthly" value={fmtNum(s.avgMonthly)} icon={TrendingUp} tone="cyan" prefix="$" />
        <StatCard label="Highest Month" value={fmtNum(s.highestMonth)} icon={TrendingUp} tone="green" prefix="$" />
        <StatCard label="Growth Rate" value={s.growthRate} icon={TrendingUp} tone="amber" suffix="%" />
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Revenue vs Expenses Over Time</h3>
        <div className="mt-4 h-72">
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="rvg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  <linearGradient id="exg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#rvg)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#exg)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No data available</div>
          )}
        </div>
      </div>

      {byCategory.length > 0 && (
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Revenue by Category</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory}>
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} animationDuration={700}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {monthly.length > 0 && (
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Monthly Breakdown</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr style={{ color: 'var(--text-2)', borderColor: 'var(--stroke)' }} className="border-b">
                <th className="px-3 py-2 text-left font-medium">Month</th>
                <th className="px-3 py-2 text-right font-medium">Revenue</th>
                <th className="px-3 py-2 text-right font-medium">Expenses</th>
                <th className="px-3 py-2 text-right font-medium">Net</th>
              </tr></thead>
              <tbody>
                {monthly.map(m => (
                  <tr key={m.month} className="border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--text-0)' }}>{m.month}</td>
                    <td className="px-3 py-2.5 text-right text-emerald-400">${fmtNum(m.revenue)}</td>
                    <td className="px-3 py-2.5 text-right text-red-400">${fmtNum(m.expenses)}</td>
                    <td className={cn('px-3 py-2.5 text-right font-medium', m.revenue - m.expenses >= 0 ? 'text-emerald-400' : 'text-red-400')}>${fmtNum(m.revenue - m.expenses)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
