'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, User, Wallet, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { hubLabel } from '@/lib/routes'

export default function Header({ isAdmin = false }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const menuRef = useRef(null)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count')
      setUnreadCount(res.data.count || 0)
    } catch (error) {
      console.error('Failed to fetch notification count:', error)
    }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const getPageTitle = () => {
    const title = (() => {
      if (isAdmin) {
        const p = pathname.replace('/admin', '') || '/'
        return p === '/' ? 'Dashboard' : p.slice(1).split('/').filter(Boolean).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' › ')
      }
      const p = pathname.replace('/business', '').replace('/sales', '').replace('/operations', '') || '/'
      if (p === '/') return hubLabel(user?.role)
      return p.slice(1).split('/').filter(Boolean).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' › ')
    })()
    return title || 'Dashboard'
  }

  const getNotificationPath = () => {
    if (isAdmin) return '/admin/notifications'
    if (user?.role === 'BUSINESS_MANAGEMENT') return '/business/notifications'
    if (user?.role === 'SALES_MANAGEMENT') return '/sales/notifications'
    if (user?.role === 'OPERATIONS_DEVELOPER') return '/operations/notifications'
    return '/dashboard/notifications'
  }

  const getProfilePath = () => {
    if (isAdmin) return '/admin'
    if (user?.role === 'BUSINESS_MANAGEMENT') return '/business/profile'
    if (user?.role === 'SALES_MANAGEMENT') return '/sales/profile'
    if (user?.role === 'OPERATIONS_DEVELOPER') return '/operations/profile'
    return '/dashboard/profile'
  }

  const getBalancePath = () => {
    if (isAdmin) return '/admin'
    if (user?.role === 'BUSINESS_MANAGEMENT') return '/business/balance'
    if (user?.role === 'SALES_MANAGEMENT') return '/sales/balance'
    if (user?.role === 'OPERATIONS_DEVELOPER') return '/operations/balance'
    return '/dashboard'
  }

  const getHomePath = () => {
    if (isAdmin) return '/admin'
    if (user?.role === 'BUSINESS_MANAGEMENT') return '/business'
    if (user?.role === 'SALES_MANAGEMENT') return '/sales'
    if (user?.role === 'OPERATIONS_DEVELOPER') return '/operations'
    return '/dashboard'
  }

  const menuItem = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-1)] transition-colors hover:bg-[var(--glass-soft)] hover:text-[var(--text-0)]'

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[var(--stroke)] bg-[var(--bg-1)]/80 px-6 backdrop-blur-xl">
      <div className="min-w-0">
        <p className="truncate font-display text-base font-semibold text-[var(--text-0)]">{getPageTitle()}</p>
        <p className="mono hidden text-[10px] uppercase tracking-[0.22em] text-[var(--text-2)] sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link href={getNotificationPath()} className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--stroke)] text-[var(--text-1)] transition-colors hover:border-[var(--cyan)] hover:text-[var(--cyan)]" aria-label="Notifications">
          <Bell size={17} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-[#04120f]" style={{ background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] p-1.5 pr-2.5 transition-colors hover:border-[var(--cyan)]/50"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }} suppressHydrationWarning>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
            <ChevronDown size={14} className={cn('text-[var(--text-2)] transition-transform', dropdownOpen && 'rotate-180')} />
          </button>

          {dropdownOpen && (
            <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--stroke)] bg-[var(--bg-2)] p-1.5 shadow-2xl">
              <div className="border-b border-[var(--stroke)] px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-[var(--text-0)]" suppressHydrationWarning>{user?.fullName}</p>
                <p className="truncate text-xs text-[var(--text-2)]" suppressHydrationWarning>{user?.email}</p>
              </div>
              <div className="mt-1.5 space-y-0.5">
                <Link href={getHomePath()} role="menuitem" onClick={() => setDropdownOpen(false)} className={menuItem}>
                  <LayoutDashboard size={15} strokeWidth={1.75} /> Dashboard
                </Link>
                <Link href={getBalancePath()} role="menuitem" onClick={() => setDropdownOpen(false)} className={menuItem}>
                  <Wallet size={15} strokeWidth={1.75} /> Wallet &amp; balance
                </Link>
                <Link href={getProfilePath()} role="menuitem" onClick={() => setDropdownOpen(false)} className={menuItem}>
                  <User size={15} strokeWidth={1.75} /> My profile
                </Link>
                <button role="menuitem" onClick={logout} className={cn(menuItem, '!text-[var(--red)] hover:!text-[var(--red)]')}>
                  <LogOut size={15} strokeWidth={1.75} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}