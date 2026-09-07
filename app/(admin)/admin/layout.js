'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/shared/AdminSidebar'
import Header from '@/components/shared/Header'
import AdminGlobalSearch from '@/components/shared/AdminGlobalSearch'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/admin/login') return
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/admin/login')
    } else {
      const parsed = JSON.parse(user)
      if (parsed.role !== 'ADMIN') {
        router.push('/login')
      }
    }
  }, [pathname, router])

  if (pathname === '/admin/login') {
    return children
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 pr-4">
          <Header isAdmin={true} />
          <div className="hidden lg:block">
            <AdminGlobalSearch />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
          <div className="mx-auto max-w-7xl p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
