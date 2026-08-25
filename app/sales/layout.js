'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import SalesSidebar from '@/components/shared/SalesSidebar'
import Header from '@/components/shared/Header'

export default function SalesLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
    } else {
      const parsed = JSON.parse(user)
      if (parsed.role !== 'SALES_MANAGEMENT') {
        router.push('/login')
      }
    }
  }, [pathname, router])

  return (
    <div className="flex h-screen bg-primary">
      <SalesSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header isAdmin={false} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
