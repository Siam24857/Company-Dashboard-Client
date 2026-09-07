'use client'
import Header from '@/components/shell/Header'
import AdminGlobalSearch from '@/components/shared/AdminGlobalSearch'

export default function AdminHeader() {
  return (
    <div className="relative">
      <Header isAdmin={true} />
      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <AdminGlobalSearch />
      </div>
    </div>
  )
}
