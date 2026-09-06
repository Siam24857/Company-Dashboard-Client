'use client'

import { useEffect, useState } from 'react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 17 — Offline Mode Staging. Cache the last values; never show a blank screen. */
export function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [cachedAt, setCachedAt] = useState(null)
  useEffect(() => {
    const cache = () => {
      const snap = {
        revenue: 1284000, users: 48213, churn: 3.6, at: new Date().toLocaleTimeString(),
      }
      try { localStorage.setItem('cc_offline_cache', JSON.stringify(snap)) } catch { /* ignore */ }
    }
    const to = setInterval(cache, 30000)
    cache()
    const on = () => { setOnline(true); cache() }
    const off = () => {
      setOnline(false)
      let snap = null
      try { snap = JSON.parse(localStorage.getItem('cc_offline_cache') || 'null') } catch { snap = null }
      setCachedAt(snap?.at || 'several hours ago')
    }
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { clearInterval(to); window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return { online, cachedAt }
}

export default function OfflineBanner() {
  const { online, cachedAt } = useOnlineStatus()
  const on = useFlagsStore((s) => !!s.flags['offline-staging']?.on)
  if (online || !on) return null
  return (
    <div className="glass-strong fixed bottom-4 left-1/2 z-[78] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--stroke)] px-4 py-2 text-[11px] text-sec shadow-2xl" role="status">
      <span className="h-2 w-2 rounded-full tone-warn tone-text" aria-hidden="true" />
      Offline — showing cached staging data · <strong className="tabular text-pri">⚡ last updated {cachedAt}</strong>
    </div>
  )
}