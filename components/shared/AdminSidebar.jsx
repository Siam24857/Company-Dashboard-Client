'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, LayoutDashboard, Users, CalendarCheck, FolderOpen, MessageSquare, Mail,
  CalendarDays, Bell, LogOut, Settings, BarChart3, TrendingUp, DollarSign, Target,
  Activity, Shield, FileText, Search, ChevronDown, Briefcase, PieChart, Zap, Heart,
  Clock, AlertTriangle, BookOpen, ClipboardList, HardDrive, UserCheck, Send,
  Globe, Headphones, LifeBuoy, HelpCircle, Wallet, ChevronRight, CreditCard,
  LineChart, Users2, Layers, Gauge, Bug, Lock, History, Hash, FileBarChart,
  Printer, Megaphone, Navigation, LayoutGrid, BookOpenCheck, UserCircle,
  Webhook, ShieldCheck, CheckCircle2, ExternalLink, AlertCircle, Database
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'

const sections = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/admin', label: 'Command Center', icon: LayoutDashboard },
      { href: '/admin/operations', label: 'Operations', icon: Activity },
      { href: '/admin/system-health', label: 'System Health', icon: HardDrive },
    ],
  },
  {
    label: 'TEAM & PEOPLE',
    items: [
      { href: '/admin/teams', label: 'Teams', icon: Users },
      { href: '/admin/employees', label: 'Employees', icon: UserCheck },
      { href: '/admin/analytics/workload', label: 'Workload', icon: Activity },
    ],
  },
  {
    label: 'PROJECTS & RISK',
    items: [
      { href: '/admin/projects', label: 'Projects & Tasks', icon: FolderOpen },
      { href: '/admin/projects/risks', label: 'Risk Management', icon: AlertTriangle },
      { href: '/admin/projects/milestones', label: 'Milestones', icon: CalendarCheck },
    ],
  },
  {
    label: 'ENTERPRISE',
    items: [
      { href: '/admin/enterprise/webhooks', label: 'Webhooks', icon: Webhook },
      { href: '/admin/enterprise/feature-flags', label: 'Feature Flags', icon: ShieldCheck },
      { href: '/admin/enterprise/approvals', label: 'Approvals', icon: CheckCircle2 },
      { href: '/admin/enterprise/automation', label: 'Automation', icon: Zap },
      { href: '/admin/enterprise/kpis', label: 'KPI Builder', icon: Target },
      { href: '/admin/enterprise/dashboards', label: 'Dashboard Builder', icon: LayoutGrid },
      { href: '/admin/enterprise/incidents', label: 'Incidents', icon: AlertCircle },
      { href: '/admin/enterprise/jobs', label: 'Background Jobs', icon: Clock },
      { href: '/admin/enterprise/connections', label: 'Connections', icon: ExternalLink },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { href: '/admin/analytics', label: 'Executive Analytics', icon: BarChart3 },
      { href: '/admin/analytics/revenue', label: 'Revenue Analytics', icon: DollarSign },
      { href: '/admin/analytics/users', label: 'User Analytics', icon: Users },
      { href: '/admin/analytics/employees', label: 'Employee Analytics', icon: UserCheck },
      { href: '/admin/analytics/teams', label: 'Team Performance', icon: Users2 },
      { href: '/admin/analytics/projects', label: 'Project Analytics', icon: PieChart },
      { href: '/admin/analytics/tasks', label: 'Task Analytics', icon: ClipboardList },
      { href: '/admin/analytics/workload', label: 'Workload Management', icon: Activity },
      { href: '/admin/analytics/productivity', label: 'Productivity Overview', icon: Gauge },
    ],
  },
  {
    label: 'COMMUNICATION',
    items: [
      { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
      { href: '/admin/announcements', label: 'Announcements', icon: Send },
      { href: '/admin/notifications', label: 'Notifications', icon: Bell },
      { href: '/admin/email', label: 'Email Center', icon: Mail },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { href: '/admin/analytics/revenue', label: 'Revenue', icon: TrendingUp },
      { href: '/admin/transactions', label: 'Transactions', icon: CreditCard },
    ],
  },
  {
    label: 'SECURITY & COMPLIANCE',
    items: [
      { href: '/admin/security', label: 'Security Center', icon: Shield },
      { href: '/admin/audit-logs', label: 'Audit Logs', icon: History },
      { href: '/admin/system-health', label: 'System Health', icon: HardDrive },
      { href: '/admin/enterprise/data-quality', label: 'Data Quality', icon: Database },
    ],
  },
  {
    label: 'SUPPORT',
    items: [
      { href: '/admin/support', label: 'Support Center', icon: Headphones },
    ],
  },
  {
    label: 'DOCUMENTS',
    items: [
      { href: '/admin/documents', label: 'Document Center', icon: FileText },
      { href: '/admin/reports', label: 'Report Generator', icon: FileBarChart },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
      { href: '/admin/activity', label: 'Activity Center', icon: Globe },
      { href: '/admin/help', label: 'Help Center', icon: HelpCircle },
      { href: '/admin/profile', label: 'Admin Profile', icon: UserCircle },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [openSections, setOpenSections] = useState(sections.map((_, i) => i))
  const { user, logout } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api.get('/notifications/unread-count').then(r => setUnreadCount(r.data.count || 0)).catch(() => {})
  }, [])

  useEffect(() => { setIsOpen(false) }, [pathname])

  const toggleSection = (i) => {
    setOpenSections(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed top-4 left-4 z-50 md:hidden rounded-lg p-2 border border-[var(--stroke)] bg-[var(--card-hi)]" style={{ color: 'var(--cyan)' }}>
        <Menu size={20} />
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--stroke)] bg-[var(--card-lo)] transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto ${collapsed ? 'w-[68px]' : 'w-64'}`}>
        <div className="flex items-center justify-between border-b border-[var(--stroke)] px-4 py-4">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs" style={{ background: 'var(--cyan)', color: 'var(--bg)' }}>I</div>
              <div>
                <h1 className="font-display text-sm font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>IDEONS</h1>
                <p className="mono text-[9px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-2)' }}>Command Center</p>
              </div>
            </Link>
          )}
          <button onClick={() => collapsed ? setCollapsed(false) : setIsOpen(false)} className="hidden md:flex h-7 w-7 items-center justify-center rounded-md transition-colors" style={{ color: 'var(--text-2)' }}>
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="md:hidden" style={{ color: 'var(--text-2)' }}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {sections.map((section, si) => (
            <div key={si}>
              {!collapsed && (
                <button onClick={() => toggleSection(si)} className="flex w-full items-center justify-between px-2 py-1">
                  <span className="mono text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-2)' }}>{section.label}</span>
                  <ChevronDown size={12} className={`transition-transform ${openSections.includes(si) ? 'rotate-0' : '-rotate-90'}`} style={{ color: 'var(--text-2)' }} />
                </button>
              )}
              {(collapsed || openSections.includes(si)) && (
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${isActive ? 'bg-[var(--cyan-soft)]' : 'hover:bg-[var(--glass-soft)]'}`}
                        style={{ color: isActive ? 'var(--cyan)' : 'var(--text-1)' }}
                      >
                        <item.icon size={17} className="shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                        {item.href === '/admin/notifications' && unreadCount > 0 && (
                          <span className="ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: 'var(--red)', color: '#fff' }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--stroke)] p-3">
          <Link href="/admin/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--glass-soft)]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }} suppressHydrationWarning>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium" style={{ color: 'var(--text-0)' }} suppressHydrationWarning>{user?.fullName || 'Admin'}</p>
                <p className="truncate text-[10px]" style={{ color: 'var(--text-2)' }} suppressHydrationWarning>{user?.email || 'admin@ideon.com'}</p>
              </div>
            )}
          </Link>
          <button onClick={logout} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--red-faint)]" style={{ color: 'var(--red)' }}>
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
