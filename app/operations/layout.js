'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import HubSidebar from '@/components/shared/HubSidebar'
import Header from '@/components/shared/Header'

export default function OperationsLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
    } else {
      const parsed = JSON.parse(user)
      if (parsed.role !== 'OPERATIONS_DEVELOPER') {
        router.push('/login')
      } else {
        setAuthed(true)
      }
    }
  }, [pathname, router])

  if (!authed) {
    return <div className="flex h-screen items-center justify-center bg-[var(--bg-0)]"><span className="h-6 w-6 animate-spin-slow rounded-full border-2 border-[var(--cyan)] border-t-transparent" /></div>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-0)] text-[var(--text-0)]">
      <HubSidebar base="/operations" label="Operations" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header isAdmin={false} />
        <main className="flex-1 overflow-y-auto bg-[var(--bg-0)]">
          <div className="mx-auto max-w-6xl p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}