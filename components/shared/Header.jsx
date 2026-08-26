'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, User } from 'lucide-react'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'

export default function Header({ isAdmin = false }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

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

  const getPageTitle = () => {
    if (isAdmin) {
      const adminPath = pathname.replace('/admin', '') || '/'
      return adminPath.charAt(1).toUpperCase() + adminPath.slice(2).replace('/[', ' › ').replace(']', '') || 'Dashboard'
    }
    const dashboardPath = pathname.replace('/dashboard', '') || '/'
    return dashboardPath.charAt(1).toUpperCase() + dashboardPath.slice(2).replace('/[', ' › ').replace(']', '') || 'Overview'
  }

  const getNotificationPath = () => {
    if (isAdmin) return '/admin/notifications'
    if (user?.role === 'BUSINESS_MANAGEMENT') return '/business/notifications'
    if (user?.role === 'SALES_MANAGEMENT') return '/sales/notifications'
    if (user?.role === 'OPERATIONS_DEVELOPER') return '/operations/notifications'
    return '/dashboard/notifications'
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-primary/95 backdrop-blur">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-offwhite">{getPageTitle()}</h2>
        </div>
        <div className="flex items-center gap-4">
          <Link href={getNotificationPath()} className="relative p-2 text-muted hover:text-offwhite transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-orange text-primary text-[10px] font-bold rounded-full px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-offwhite/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-teal font-semibold text-sm" suppressHydrationWarning>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <ChevronDown size={16} className="text-muted" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0c0c18] border border-border rounded-lg shadow-lg py-2 z-50">
                <Link href={isAdmin ? '/admin' : user?.role === 'BUSINESS_MANAGEMENT' ? '/business' : user?.role === 'SALES_MANAGEMENT' ? '/sales' : user?.role === 'OPERATIONS_DEVELOPER' ? '/operations' : '/dashboard'} className="flex items-center gap-2 px-4 py-2 text-sm text-offwhite hover:bg-offwhite/5">
                  <User size={16} />
                  Profile
                </Link>
                <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange hover:bg-offwhite/5 text-left">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
