'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LayoutDashboard, CalendarCheck, User, FolderOpen, MessageSquare, CalendarDays, Bell, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store'

const dashboardNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/attendance', label: 'My Attendance', icon: CalendarCheck },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/projects', label: 'My Projects', icon: FolderOpen },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/leave', label: 'Leave Requests', icon: CalendarDays },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
]

const departmentNavItems = {
  BUSINESS_MANAGEMENT: { href: '/business', label: 'Business Hub', icon: ChevronRight },
  SALES_MANAGEMENT: { href: '/sales', label: 'Sales Hub', icon: ChevronRight },
  OPERATIONS_DEVELOPER: { href: '/operations', label: 'Ops Hub', icon: ChevronRight },
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuthStore()

  const deptNav = user?.department ? departmentNavItems[user.department] : null

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed top-4 left-4 z-50 md:hidden bg-teal text-primary p-2 rounded-lg">
        <Menu size={24} />
      </button>
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary border-r border-border transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-offwhite">IDEON</h1>
              <p className="text-xs text-muted mt-1">Dashboard</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-muted hover:text-offwhite">
              <X size={24} />
            </button>
          </div>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {dashboardNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-teal/10 text-teal border-l-4 border-teal' : 'text-offwhite/70 hover:bg-offwhite/5 hover:text-offwhite'}`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
          {deptNav && (
            <>
              <div className="pt-4 pb-2 px-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">{user.department.replace(/_/g, ' ')}</p>
              </div>
              <Link
                href={deptNav.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.startsWith(deptNav.href) ? 'bg-teal/10 text-teal border-l-4 border-teal' : 'text-offwhite/70 hover:bg-offwhite/5 hover:text-offwhite'}`}
              >
                <deptNav.icon size={20} />
                <span className="font-medium">{deptNav.label}</span>
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center text-teal font-semibold" suppressHydrationWarning>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-offwhite truncate" suppressHydrationWarning>{user?.fullName}</p>
              <p className="text-xs text-muted truncate" suppressHydrationWarning>{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-danger w-full flex items-center justify-center gap-2">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
