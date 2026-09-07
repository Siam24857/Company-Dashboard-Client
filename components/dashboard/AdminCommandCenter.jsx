'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Users, UserCheck, UserX, Clock, FolderOpen, CheckCircle2, AlertTriangle,
  TrendingUp, TrendingDown, DollarSign, Wallet, MessageSquare, Bell,
  Send, Calendar, Activity, ArrowUpRight, Zap, Shield, Eye, BarChart3,
  Target, Briefcase, Loader2, RefreshCw, ChevronRight, Lightbulb, HardDrive,
  Database, PlayCircle, PauseCircle, FileText, Headphones, Globe
} from 'lucide-react'
import { api } from '@/lib/api'
import { cn, timeAgo, fmtNum } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import ErrorState from '@/components/ui/ErrorState'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const PIE_COLORS = {
  IN_PROGRESS: '#06b6d4', PLANNING: '#f59e0b', ON_HOLD: '#8b5cf6',
  COMPLETED: '#10b981', CANCELLED: '#ef4444', PRESENT: '#10b981',
  ABSENT: '#ef4444', LATE: '#f59e0b', HALF_DAY: '#8b5cf6', LEAVE: '#6b7280',
}

function TrendBadge({ value }) {
  if (value == null || value === 0) return null
  const positive = value > 0
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold', positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
      {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {positive ? '+' : ''}{value}%
    </span>
  )
}

function SectionHeader({ title, action, actionHref }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-sm font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>{title}</h2>
      {action && (
        <Link href={actionHref} className="flex items-center gap-1 text-[11px] font-medium transition-colors" style={{ color: 'var(--cyan)' }}>
          {action} <ChevronRight size={12} />
        </Link>
      )}
    </div>
  )
}

function InsightCard({ insight }) {
  const styleMap = {
    critical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#ef4444', icon: AlertTriangle },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b', icon: AlertTriangle },
    info: { bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)', color: '#06b6d4', icon: Lightbulb },
    success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#10b981', icon: CheckCircle2 },
  }
  const s = styleMap[insight.type] || styleMap.info
  return (
    <div className="flex items-start gap-3 rounded-xl border px-4 py-3" style={{ background: s.bg, borderColor: s.border }}>
      <s.icon size={16} className="mt-0.5 shrink-0" style={{ color: s.color }} />
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-1)' }}>{insight.text}</p>
    </div>
  )
}

export default function AdminCommandCenter() {
  const [data, setData] = useState(null)
  const [insights, setInsights] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [revenueData, setRevenueData] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [cmd, ins, hlth, rev] = await Promise.all([
        api.get('/analytics/command-center'),
        api.get('/analytics/insights'),
        api.get('/analytics/system-health').catch(() => ({ data: {} })),
        api.get('/analytics/revenue?period=6m').catch(() => ({ data: {} })),
      ])
      setData(cmd.data)
      setInsights(ins.data.insights || [])
      setHealth(hlth.data)
      setRevenueData(rev.data)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-7 w-48 rounded-lg" />
            <div className="skeleton h-4 w-72 rounded-lg" />
          </div>
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 25 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Failed to load command center" message="Could not reach the analytics server." onRetry={fetchAll} />
      </div>
    )
  }

  const k = data?.kpis || {}
  const recentUsers = data?.recentUsers || []
  const recentProjects = data?.recentProjects || []
  const monthly = revenueData?.monthly || []
  const projectStatusData = k.projects ? [
    { name: 'Active', value: k.projects.active, color: '#06b6d4' },
    { name: 'Planning', value: k.projects.planning, color: '#f59e0b' },
    { name: 'On Hold', value: k.projects.onHold, color: '#8b5cf6' },
    { name: 'Completed', value: k.projects.completed, color: '#10b981' },
    { name: 'Cancelled', value: k.projects.cancelled, color: '#ef4444' },
  ].filter(d => d.value > 0) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Command Center</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>
            IDEONS Mission Control
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Enterprise operational overview and analytics.</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-1)' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* INSIGHTS */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <SectionHeader title="Smart Insights" />
          <div className="grid gap-2 sm:grid-cols-2">
            {insights.slice(0, 4).map((ins, i) => <InsightCard key={i} insight={ins} />)}
          </div>
        </div>
      )}

      {/* PEOPLE KPIs - 4 cards */}
      <div className="space-y-3">
        <SectionHeader title="People" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={k.users?.total} icon={Users} tone="cyan" hint={`${k.users?.active || 0} active`} />
          <StatCard label="Active Users" value={k.users?.active} icon={UserCheck} tone="green" hint={`${k.users?.pending || 0} pending approval`} />
          <StatCard label="New Users" value={k.users?.pending} icon={Clock} tone="amber" hint="Awaiting approval" />
          <StatCard label="Suspended Users" value={k.users?.suspended} icon={UserX} tone="red" />
        </div>
      </div>

      {/* EMPLOYEE/TEAM KPIs - 3 cards */}
      <div className="space-y-3">
        <SectionHeader title="Workforce" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Employees" value={(k.users?.total || 0) - 1} icon={Briefcase} tone="purple" hint="Non-admin users" />
          <StatCard label="Active Employees" value={(k.users?.active || 0) - 1} icon={UserCheck} tone="green" />
          <StatCard label="Total Teams" value={3} icon={Users} tone="cyan" hint="3 departments" />
        </div>
      </div>

      {/* OPERATIONS KPIs - 5 cards */}
      <div className="space-y-3">
        <SectionHeader title="Operations" action="View All" actionHref="/admin/projects" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total Projects" value={k.projects?.total} icon={FolderOpen} tone="cyan" hint={`${k.projects?.completionRate || 0}% completion`} />
          <StatCard label="Active Projects" value={k.projects?.active} icon={Zap} tone="blue" />
          <StatCard label="Completed Projects" value={k.projects?.completed} icon={CheckCircle2} tone="green" />
          <StatCard label="Pending Projects" value={k.projects?.planning} icon={Clock} tone="amber" />
          <StatCard label="On Hold Projects" value={k.projects?.onHold} icon={PauseCircle} tone="purple" />
        </div>
      </div>

      {/* TASK KPIs - 4 cards */}
      <div className="space-y-3">
        <SectionHeader title="Tasks" action="View All" actionHref="/admin/projects" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Tasks" value={k.tasks?.total} icon={Target} tone="purple" hint={`${k.tasks?.completionRate || 0}% done`} />
          <StatCard label="Completed Tasks" value={k.tasks?.completed} icon={CheckCircle2} tone="green" />
          <StatCard label="Pending Tasks" value={k.tasks?.pending} icon={AlertTriangle} tone="amber" hint={`${k.tasks?.inReview || 0} in review`} />
          <StatCard label="Overdue Tasks" value={k.tasks?.total - k.tasks?.completed - k.tasks?.pending - (k.tasks?.inProgress || 0) - (k.tasks?.inReview || 0)} icon={AlertTriangle} tone="red" />
        </div>
      </div>

      {/* FINANCE KPIs - 4 cards */}
      <div className="space-y-3">
        <SectionHeader title="Finance" action="Revenue Details" actionHref="/admin/analytics/revenue" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Revenue" value={fmtNum(k.finance?.totalRevenue)} icon={DollarSign} tone="green" prefix="$" hint={`${k.finance?.revenueChange > 0 ? '+' : ''}${k.finance?.revenueChange || 0}% vs prev`} />
          <StatCard label="Total Expenses" value={fmtNum(k.finance?.totalExpenses)} icon={Wallet} tone="red" prefix="$" hint={`${k.finance?.expenseChange > 0 ? '+' : ''}${k.finance?.expenseChange || 0}% vs prev`} />
          <StatCard label="Net Revenue" value={fmtNum(k.finance?.netRevenue)} icon={TrendingUp} tone="cyan" prefix="$" />
          <StatCard label="Pending Transactions" value={k.finance?.pendingTransactions} icon={Clock} tone="amber" />
        </div>
      </div>

      {/* COMMUNICATION KPIs - 3 cards */}
      <div className="space-y-3">
        <SectionHeader title="Communication" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Unread Messages" value={k.communication?.unreadMessages} icon={MessageSquare} tone="blue" />
          <StatCard label="Unread Notifications" value={k.communication?.unreadNotifications} icon={Bell} tone="amber" />
          <StatCard label="Announcements" value={k.communication?.publishedAnnouncements} icon={Send} tone="cyan" />
        </div>
      </div>

      {/* SYSTEM KPIs - 3 cards */}
      <div className="space-y-3">
        <SectionHeader title="System & Operations" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Attendance Rate" value={k.operations?.attendanceRate} icon={Calendar} tone="green" suffix="%" />
          <StatCard label="BD Leads" value={k.operations?.totalBdLeads} icon={Briefcase} tone="cyan" />
          <StatCard label="Pending Leaves" value={k.operations?.pendingLeaves} icon={Clock} tone="amber" />
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <SectionHeader title="Revenue vs Expenses" action="Details" actionHref="/admin/analytics/revenue" />
          <div className="mt-4 h-52">
            {monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No revenue data yet</div>
            )}
          </div>
        </div>

        {/* Project Status Pie */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <SectionHeader title="Project Status" />
          <div className="mt-4 h-52">
            {projectStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0}>
                    {projectStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card-hi)', border: '1px solid var(--stroke)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-2)' }}>No projects yet</div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {projectStatusData.map((d, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-2)' }}>
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <SectionHeader title="System Health" action="Details" actionHref="/admin/system-health" />
          <div className="mt-4 space-y-3">
            {[
              { label: 'API', status: health?.api?.status || 'UNKNOWN', icon: Activity },
              { label: 'Database', status: health?.database?.status || 'UNKNOWN', icon: Database },
              { label: 'Authentication', status: health?.auth?.status || 'UNKNOWN', icon: Shield },
              { label: 'Storage', status: health?.storage?.status || 'UNKNOWN', icon: HardDrive },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'var(--glass-soft)' }}>
                <div className="flex items-center gap-3">
                  <s.icon size={16} style={{ color: 'var(--text-2)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-0)' }}>{s.label}</span>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', s.status === 'OPERATIONAL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
                  {s.status}
                </span>
              </div>
            ))}
            {health?.memory && (
              <div className="rounded-xl px-4 py-3" style={{ background: 'var(--glass-soft)' }}>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--text-0)' }}>Memory Usage</span>
                  <span style={{ color: 'var(--text-2)' }}>{health.memory.used}MB / {health.memory.total}MB</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                  <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${Math.min(100, (health.memory.used / health.memory.total) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY ROW */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <SectionHeader title="Recent Users" action="Manage" actionHref="/admin/users" />
          <div className="mt-3 space-y-2">
            {recentUsers.length === 0 ? (
              <p className="py-8 text-center text-xs" style={{ color: 'var(--text-2)' }}>No users yet</p>
            ) : recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--glass-soft)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                  {u.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" style={{ color: 'var(--text-0)' }}>{u.fullName}</p>
                  <p className="truncate text-[10px]" style={{ color: 'var(--text-2)' }}>{u.email}</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : u.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400')}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <SectionHeader title="Recent Projects" action="View All" actionHref="/admin/projects" />
          <div className="mt-3 space-y-2">
            {recentProjects.length === 0 ? (
              <p className="py-8 text-center text-xs" style={{ color: 'var(--text-2)' }}>No projects yet</p>
            ) : recentProjects.map(p => (
              <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--glass-soft)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--purple-soft)', color: 'var(--purple)' }}>
                  <FolderOpen size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" style={{ color: 'var(--text-0)' }}>{p.title}</p>
                  <p className="truncate text-[10px]" style={{ color: 'var(--text-2)' }}>{p.department} {p.dueDate ? `· Due ${new Date(p.dueDate).toLocaleDateString()}` : ''}</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', p.status === 'IN_PROGRESS' ? 'bg-cyan-500/10 text-cyan-400' : p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : p.status === 'PLANNING' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400')}>
                  {p.status?.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <SectionHeader title="Quick Actions" />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'Add User', href: '/admin/users', icon: Users, color: 'var(--cyan)' },
            { label: 'Create Project', href: '/admin/projects/new', icon: FolderOpen, color: 'var(--purple)' },
            { label: 'Send Message', href: '/admin/messages', icon: MessageSquare, color: 'var(--blue)' },
            { label: 'Announcement', href: '/admin/announcements', icon: Send, color: 'var(--yellow)' },
            { label: 'Generate Report', href: '/admin/reports', icon: FileText, color: 'var(--green)' },
            { label: 'Security Center', href: '/admin/security', icon: Shield, color: 'var(--red)' },
            { label: 'Support Tickets', href: '/admin/support', icon: Headphones, color: 'var(--cyan)' },
            { label: 'Calendar', href: '/admin/calendar', icon: Calendar, color: 'var(--violet)' },
            { label: 'Documents', href: '/admin/documents', icon: FileText, color: 'var(--blue)' },
            { label: 'System Health', href: '/admin/system-health', icon: Activity, color: 'var(--red)' },
          ].map((a, i) => (
            <Link key={i} href={a.href} className="flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: 'var(--stroke)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${a.color}15`, color: a.color }}>
                <a.icon size={18} />
              </div>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-1)' }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
