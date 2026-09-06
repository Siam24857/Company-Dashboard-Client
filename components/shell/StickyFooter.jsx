'use client'

import { Radio } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useLiveStore from '@/store/live.store'
import { TICKER_SEED } from '@/lib/mock'
import { cn, timeAgo } from '@/lib/utils'

/** Sticky footer: real-time data ticker + recent activity trail. */
export default function StickyFooter() {
  const recent = useDashboardStore((s) => s.recent)
  const latency = useLiveStore((s) => s.latencyMs)
  const connected = useLiveStore((s) => s.connected)

  const ticker = [...TICKER_SEED].concat([`p99 ${latency}ms`, `ws ${connected ? 'live' : 'down'}`]).concat(TICKER_SEED)

  return (
    <footer className={cn('glass sticky bottom-0 z-20 flex items-center gap-4 overflow-hidden px-4 py-2 text-[10px] text-tri')} aria-label="Live updates">
      <span className="flex shrink-0 items-center gap-1.5 font-mono uppercase tracking-widest tone-success tone-text">
        <Radio size={11} /> live
      </span>
      <div className="relative min-w-0 flex-1 overflow-hidden" aria-hidden="true">
        <div className="marquee-track">
          {ticker.map((t, i) => (
            <span key={i} className="mx-5 inline-flex items-center gap-1.5 tabular">
              {t}
              <span className="text-[8px]">•</span>
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg-0)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg-0)] to-transparent" />
      </div>
      <div className="hidden shrink-0 items-center gap-2 md:flex" aria-label="Recent activity">
        {recent.slice(0, 3).map((r) => (
          <span key={r.id} className="caption flex items-center gap-1.5 truncate rounded-lg px-2 py-1 max-w-[180px]" style={{ background: 'var(--glass)' }}>
            <span className={cn('h-1 w-1 shrink-0 rounded-full')} style={{ background: r.toneColor || 'var(--cyan)' }} aria-hidden="true" />
            <span className="truncate">{r.label}</span>
            <span className="shrink-0 text-[9px] opacity-60">{timeAgo(r.at)}</span>
          </span>
        ))}
        {recent.length === 0 && <span style={{ background: 'var(--glass)' }} className="rounded-lg px-2 py-1">idle — actions will trail here</span>}
      </div>
    </footer>
  )
}