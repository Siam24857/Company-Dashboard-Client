'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/shared/AdminSidebar'
import Header from '@/components/shared/Header'

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
    <div className="flex h-screen overflow-hidden bg-[var(--bg-0)] text-[var(--text-0)]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header isAdmin={true} />
        <main className="flex-1 overflow-y-auto bg-[var(--bg-0)]">
          <div className="mx-auto max-w-6xl p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
