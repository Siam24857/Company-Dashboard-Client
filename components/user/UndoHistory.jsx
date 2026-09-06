'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Undo2, X } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { useState } from 'react'

/* Feature 30 — Undo History. Your last 50 actions; revert any of them, not just the last. */
export default function UndoHistory() {
  const log = useDashboardStore((s) => s.undoLog)
  const revert = useDashboardStore((s) => s.revertUndo)
  const on = useFlagsStore((s) => !!s.flags['undo-history']?.on)
  const [open, setOpen] = useState(false)
  if (!on) return null
  return (
    <div className="relative">
      <button className="btn" aria-label="Undo history" onClick={() => setOpen((o) => !o)}>
        <Undo2 size={13} /> <span className="hidden sm:inline">Undo</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="glass-strong absolute right-0 top-10 z-50 w-72 rounded-2xl border border-[var(--stroke)] p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-tri">Undo history · last 50</p>
              <button className="icon-btn h-5 w-5" onClick={() => setOpen(false)} aria-label="Close"><X size={11} /></button>
            </div>
            <div className="max-h-52 space-y-1 overflow-y-auto">
              {log.slice(0, 20).map((e, i) => (
                <div key={e.id} className="glass-soft flex items-center gap-2 rounded-lg px-2 py-1.5">
                  <span className="w-6 text-right tabular text-[9px] text-tri">{i + 1}.</span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-sec">{e.label}</span>
                  <span className="tabular text-[9px] text-tri">{e.at}</span>
                  <button className="text-[var(--cyan)] hover:brightness-125" onClick={() => { revert(e.id); setOpen(false) }} aria-label={`Revert ${e.label}`}>
                    <Undo2 size={11} />
                  </button>
                </div>
              ))}
              {!log.length && <p className="py-2 text-center text-[10px] italic text-tri">actions you can undo will appear here</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}