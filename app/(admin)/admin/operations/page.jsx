'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, Activity, Shield, Clock, AlertTriangle,
  TrendingUp, Users, FolderOpen, CheckCircle2, XCircle,
  Database, BarChart3, Settings, Zap, Eye, Search,
  ArrowUpRight, ArrowDownRight, Wifi, WifiOff,
  HardDrive, Cpu, Server, Terminal, Filter,
  LayoutGrid, Table, ChevronDown, Menu, X,
  Loader2, Target, Wrench, GitBranch, Key,
  Webhook, ShieldCheck, AlertCircle, Check,
  FileText, Calendar, MessageSquare, Bell,
  Headphones, Lock, History, Gauge, Layers,
  ChevronRight, Sparkles, Brain,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import useDashboardStore from '@/store/dashboard.store'
import StatCard from '@/components/ui/StatCard'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminOperationsPage() {
  const [data, setData] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)
  const setCommandOpen = useDashboardStore((s) => s.setCommandOpen)

  const fetchAll = useCallback(async () => {
    try {
      const [ops, health] = await Promise.all([
        api.get('/admin/operations').catch(() => ({ data: { activities: [] } })),
        api.get('/analytics/system-health').catch(() => ({ data: {} })),
      ])
      setData(ops.data)
      setHealth(health.data)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAll()
  }

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-64 rounded-lg" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Failed to load operations" message="Could not reach the operations server." onRetry={fetchAll} />
      </div>
    )
  }

  const activities = data?.activities || []
  const healthData = data?.health || {}

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Operations Center</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Real-Time Operations</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Live activity feed and system metrics.</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-1)' }}>
          <RefreshCw size={14} className={cn(refreshing && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* System Health Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'API Status', status: healthData?.api?.status || 'OPERATIONAL', icon: Activity, color: healthData?.api?.status === 'OPERATIONAL' ? 'green' : 'red' },
          { label: 'Database', status: healthData?.database?.status || 'OPERATIONAL', icon: Database, color: healthData?.database?.status === 'OPERATIONAL' ? 'green' : 'red' },
          { label: 'Memory', status: `${healthData?.memory?.used || 0}MB`, icon: Cpu, color: 'cyan' },
          { label: 'Uptime', status: `${Math.floor(healthData?.api?.uptime || 0)}s`, icon: Clock, color: 'green' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{s.label}</span>
              <s.icon size={14} style={{ color: 'var(--text-2)' }} />
            </div>
            <div className="mt-2">
              <span className={cn('text-lg font-bold', s.color === 'green' ? 'text-emerald-400' : s.color === 'red' ? 'text-red-400' : 'text-cyan-400')}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Live Activity Feed */}
        <div className="lg:col-span-2 rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-bold" style={{ color: 'var(--text-0)' }}>Live Activity Feed</h2>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {activities.length === 0 ? (
              <EmptyState title="No recent activity" description="Activity will appear here in real-time." icon={Activity} />
            ) : (
              activities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--glass-soft)]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                    <Activity size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium" style={{ color: 'var(--text-0)' }}>{a.actor} {a.action}</p>
                    <p className="truncate text-[10px]" style={{ color: 'var(--text-2)' }}>{a.timestamp ? timeAgo(a.timestamp) : 'Just now'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Create Project', href: '/admin/projects/new', icon: FolderOpen, color: 'var(--purple)' },
              { label: 'New Announcement', href: '/admin/announcements', icon: MessageSquare, color: 'var(--yellow)' },
              { label: 'Open Support', href: '/admin/support', icon: Headset, color: 'var(--cyan)' },
              { label: 'View Audit Logs', href: '/admin/audit-logs', icon: History, color: 'var(--blue)' },
              { label: 'System Settings', href: '/admin/settings', icon: Settings, color: 'var(--text-2)' },
              { label: 'Automation Rules', href: '/admin/enterprise/automation', icon: Zap, color: 'var(--violet)' },
              { label: 'Webhook Manager', href: '/admin/enterprise/webhooks', icon: Webhook, color: 'var(--green)' },
              { label: 'Feature Flags', href: '/admin/enterprise/feature-flags', icon: ShieldCheck, color: 'var(--amber)' },
            ].map((a, i) => (
              <a key={i} href={a.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-[var(--glass-soft)] group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${a.color}15`, color: a.color }}>
                  <a.icon size={14} />
                </div>
                <span className="text-xs font-medium group-hover:underline" style={{ color: 'var(--text-0)' }}>{a.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}