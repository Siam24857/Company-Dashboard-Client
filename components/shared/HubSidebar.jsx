'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, CalendarCheck, User, FolderOpen, MessageSquare, CalendarDays, Bell, LogOut, Wallet, Megaphone } from 'lucide-react'
import { useAuthStore } from '@/store'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/attendance', label: 'My Attendance', icon: CalendarCheck },
  { href: '/tasks', label: 'My Tasks', icon: FolderOpen },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/balance', label: 'Wallet & Balance', icon: Wallet },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/leave', label: 'Leave Requests', icon: CalendarDays },
  { href: '/notifications', label: 'Notifications', icon: Bell },
]

export default function HubSidebar({ base, label }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()

  return (
    <>
      <button onClick={() => setIsOpen(true)} aria-label="Open navigation" className="fixed left-4 top-4 z-50 rounded-lg border border-[var(--stroke)] bg-[var(--bg-2)] p-2 text-[var(--text-0)] lg:hidden">
        <Menu size={20} />
      </button>

      <aside
        className={cn('fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-[var(--stroke)] bg-[var(--bg-1)]/70 backdrop-blur-xl transition-all duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0', {
          'translate-x-0': isOpen,
          '-translate-x-full': !isOpen,
          'w-60': !collapsed,
          'w-16': collapsed,
        })}
      >
        <div className={cn('flex h-16 items-center border-b border-[var(--stroke)]', collapsed ? 'justify-center px-2' : 'justify-between px-5')}>
          {!collapsed && (
            <Link href={base} className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--card-hi)]">
                <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[var(--cyan)]" />
              </span>
              <span className="font-display text-sm font-semibold tracking-[0.18em] text-[var(--text-0)]">
                IDEON<span className="text-[var(--cyan)]">.</span>
              </span>
            </Link>
          )}
          {!collapsed && <button onClick={() => setIsOpen(false)} className="text-[var(--text-2)] hover:text-[var(--text-0)] lg:hidden"><X size={20} /></button>}
          {collapsed && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--stroke)]">
              <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[var(--cyan)]" />
            </span>
          )}
        </div>

        <div className={cn('border-b border-[var(--stroke)] px-5 py-3', collapsed && 'px-2 text-center')}>
          {!collapsed ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-2)]">{label}</p>
              <p className="mt-0.5 truncate text-xs text-[var(--text-1)]" suppressHydrationWarning>{user?.fullName}</p>
            </>
          ) : (
            <p className="text-[10px] text-[var(--text-2)]">{label.split(' ')[0]}</p>
          )}
        </div>

        <nav className={cn('flex-1 space-y-1 overflow-y-auto p-3', collapsed && 'px-2')} aria-label={`${label} navigation`}>
          {navItems.map((item) => {
            const href = base + (item.href === '/' ? '' : item.href)
            const isActive = item.exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setIsOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${collapsed ? 'justify-center' : ''} ${
                  isActive ? 'bg-[var(--cyan-soft)] text-[var(--cyan)]' : 'text-[var(--text-1)] hover:bg-[var(--glass)] hover:text-[var(--text-0)]'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[var(--cyan)]" />}
                <item.icon size={18} strokeWidth={1.75} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className={cn('border-t border-[var(--stroke)] p-4', collapsed && 'px-2')}>
          {!collapsed && (
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }} suppressHydrationWarning>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-0)]" suppressHydrationWarning>{user?.fullName}</p>
                <p className="truncate text-xs text-[var(--text-2)]" suppressHydrationWarning>{user?.email}</p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setCollapsed(!collapsed)} className="icon-btn hidden lg:flex" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand' : 'Collapse'}>
              {collapsed ? <Menu size={15} /> : <X size={15} />}
            </button>
            <button onClick={logout} className="btn flex-1 justify-center" style={{ color: 'var(--red)' }}>
              <LogOut size={15} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function cn(...args) {
  return args.filter(Boolean).join(' ')
}