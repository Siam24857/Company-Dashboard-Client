'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useDashboardStore from '@/store/dashboard.store'
import { Undo2, X } from 'lucide-react'
import useFlagsStore from '@/store/flags.store'

/* Feature 2 — Contextual Undo Snackbar. Shows after any undoable (destructive) action.
   Survives for 60s and offers a big UNDO control. */
export default function UndoSnackbar() {
  const log = useDashboardStore((s) => s.undoLog)
  const revert = useDashboardStore((s) => s.revertUndo)
  const on = useFlagsStore((s) => !!s.flags['undo-snackbar']?.on)
  const [shownId, setShownId] = useState(null)
  const [expire, setExpire] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    if (!on || !log.length) return
    const top = log[0]
    if (top.id === shownId) return
    setShownId(top.id)
    setExpire(60)
  }, [log, shownId, on])

  useEffect(() => {
    if (!expire) return undefined
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => setExpire((e) => e - 1), 1000)
    return () => clearInterval(timer.current)
  }, [expire])

  const top = on && log[0] ? log[0] : null
  if (!top) return null
  if (top.id !== shownId) return null
  if (expire <= 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 70, opacity: 0 }}
        className="glass-strong fixed bottom-20 right-4 z-[80] flex items-center gap-3 rounded-2xl border border-[var(--stroke)] px-4 py-3 shadow-2xl"
        role="status"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold text-pri">Last action</p>
          <p className="truncate text-[11px] text-sec">{top.label}</p>
        </div>
        <div className="h-1 w-16 overflow-hidden rounded-full bg-[var(--bg-2)]">
          <div className="h-full bg-[var(--cyan)] transition-[width] duration-1000" style={{ width: `${(expire / 60) * 100}%` }} />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            revert(top.id)
            setExpire(0)
          }}
        >
          <Undo2 size={13} /> UNDO
        </button>
        <button className="icon-btn" aria-label="Dismiss" onClick={() => setExpire(0)}>
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}