'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardSidebar from '@/components/shared/DashboardSidebar'
import Header from '@/components/shared/Header'

export default function DashboardLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
    } else {
      const parsed = JSON.parse(user)
      if (parsed.role === 'ADMIN') {
        router.push('/admin')
      } else if (parsed.role === 'BUSINESS_MANAGEMENT') {
        router.push('/business')
      } else if (parsed.role === 'SALES_MANAGEMENT') {
        router.push('/sales')
      } else if (parsed.role === 'OPERATIONS_DEVELOPER') {
        router.push('/operations')
      } else {
        router.push('/login')
      }
    }
  }, [router])

  return (
    <div className="flex h-screen bg-primary">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header isAdmin={false} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
