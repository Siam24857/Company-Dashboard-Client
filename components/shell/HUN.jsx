'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import { cn, timeAgo } from '@/lib/utils'

/** Heads-Up Notifications — non-blocking stacked floats, top-right, auto-dismiss. */
export default function HUN() {
  const huns = useDashboardStore((s) => s.huns)
  const dismiss = useDashboardStore((s) => s.dismissHun)

  return (
    <div className="pointer-events-none fixed right-4 top-16 z-[80] flex w-[min(92vw,340px)] flex-col gap-2" aria-live="polite" role="status">
      <AnimatePresence>
        {huns.map((h) => (
          <motion.div
            key={h.id}
            layout
            initial={{ opacity: 0, x: 44, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 44, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={cn(
              'glass-strong pointer-events-auto flex items-start gap-3 rounded-2xl border-l-2 p-3.5 shadow-xl',
              `tone-${h.tone || 'info'}`
            )}
            style={{ borderLeftColor: 'var(--tone)' }}
            role={h.tone === 'critical' ? 'alert' : 'status'}
          >
            <span className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', 'tone-text', h.tone !== 'info' && 'live-dot')} style={{ background: 'var(--tone)' }} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-pri">{h.title}</p>
              <p className="text-[11px] leading-relaxed text-sec">{h.body}</p>
              <p className="mt-1 text-[9px] uppercase tracking-widest text-tri">{timeAgo(h.at)}</p>
            </div>
            <button
              className="icon-btn h-5 w-5"
              onClick={() => dismiss(h.id)}
              aria-label={`Dismiss ${h.title}`}
            >
              <X size={11} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}