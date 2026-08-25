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
    <div className="flex h-screen bg-primary">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header isAdmin={true} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
