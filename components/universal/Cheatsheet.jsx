'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

const KEYS = [
  ['⌘K', 'Command palette'],
  ['⌘A', 'Open AI copilot'],
  ['⌘B', 'Toggle sidebar'],
  ['⌘L', 'Toggle theme'],
  ['⌘F', 'Enter focus mode'],
  ['⌘P', 'Save slice'],
  ['?', 'This cheatsheet'],
  ['Esc', 'Close / dismiss'],
]

/* Feature 15 — Shortcut Cheatsheet. Press ? anywhere → current-screen keyboard map. */
export default function Cheatsheet() {
  const open = useDashboardStore((s) => s.cheatsheetOpen)
  const set = useDashboardStore((s) => s.setCheatsheetOpen)
  const on = useFlagsStore((s) => !!s.flags['cheatsheet']?.on)

  useEffect(() => {
    if (!on) return undefined
    const h = (e) => {
      const t = e.target
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if (e.key === '?' && !typing && !e.shiftKey === false) {
        if (e.shiftKey) set(!useDashboardStore.getState().cheatsheetOpen)
      }
      if (e.key === 'Escape') set(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [on, set])

  if (!on) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[97]" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div className="scrim absolute inset-0" onClick={() => set(false)} />
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="glass-strong absolute left-1/2 top-1/2 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-pri"><Keyboard size={14} className="tone-cyan tone-text" /> Shortcuts</h3>
              <button className="icon-btn" onClick={() => set(false)} aria-label="Close"><X size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {KEYS.map(([k, label]) => (
                <div key={k} className="glass-soft flex items-center justify-between rounded-xl px-3 py-2 text-[11px]">
                  <span className="text-sec">{label}</span>
                  <kbd className="kbd ml-2 shrink-0">{k}</kbd>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] text-tri">Shift-click any filter applies it for this session only.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}