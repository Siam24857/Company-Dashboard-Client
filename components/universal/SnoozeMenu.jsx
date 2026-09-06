'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BellOff } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

const OPTS = [
  { h: 1, label: 'Snooze for 1h' },
  { h: 4, label: 'Snooze for 4h' },
  { h: 24, label: 'Snooze for 24h' },
  { h: 0, label: 'Unmute' },
]

/* Feature 18 — Snooze Notifications (deep-work mode). Critical alerts always pass. */
export default function SnoozeMenu() {
  const setSnooze = useDashboardStore((s) => s.setSnooze)
  const until = useDashboardStore((s) => s.snoozeUntil)
  const silent = useDashboardStore((s) => s.silent)
  const setSilent = useDashboardStore((s) => s.setSilent)
  const on = useFlagsStore((s) => !!s.flags['snooze']?.on)
  const [open, setOpen] = useState(false)
  if (!on) return null

  const snoozed = Date.now() < until
  const minsLeft = Math.max(1, Math.round((until - Date.now()) / 60000))

  return (
    <div className="relative">
      <button
        className={snoozed ? 'btn btn-tonal tone-warn' : 'btn'}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <BellOff size={13} />
        <span className="hidden sm:inline">{snoozed ? `Snoozed ${minsLeft}m` : 'Snooze…'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} role="menu" className="glass-strong absolute right-0 top-10 z-50 w-48 rounded-2xl border border-[var(--stroke)] p-1.5 shadow-2xl">
            {OPTS.map((o) => (
              <button key={o.h} role="menuitem" className="w-full rounded-lg px-3 py-2 text-left text-[11px] text-sec hover:bg-[var(--glass)] hover:text-pri" onClick={() => { setSnooze(o.h); setOpen(false) }}>
                {o.label}
              </button>
            ))}
            <button
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-[11px] text-sec hover:bg-[var(--glass)] hover:text-pri"
              onClick={() => { setSilent(!silent); setOpen(false) }}
            >
              {silent ? 'Silent mode: ON (disable)' : 'Enable Silent Mode (critical only)'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}