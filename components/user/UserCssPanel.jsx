'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, X } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 37 — Custom CSS snippets (per user). Injected live, persisted. */
export default function UserCssPanel() {
  const css = useDashboardStore((s) => s.customCss)
  const setCss = useDashboardStore((s) => s.setCustomCss)
  const on = useFlagsStore((s) => !!s.flags['custom-css']?.on)
  const [open, setOpen] = useState(false)
  const styleRef = useRef(null)
  if (!on) return null

  useEffect(() => {
    if (!css.trim()) return
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      styleRef.current.id = 'cc-user-css'
      document.head.appendChild(styleRef.current)
    }
    styleRef.current.textContent = css
  }, [css])

  return (
    <div className="relative">
      <button className="btn" aria-label="Custom CSS" onClick={() => setOpen((o) => !o)}>
        <Code size={13} /> <span className="hidden sm:inline">My CSS</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="glass-strong absolute right-0 top-10 z-50 w-80 rounded-2xl border border-[var(--stroke)] p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-tri">My CSS snippets</p>
              <button className="icon-btn h-5 w-5" onClick={() => setOpen(false)} aria-label="Close"><X size={11} /></button>
            </div>
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              spellCheck={false}
              rows={6}
              placeholder={'.card-3d { border-radius: 4px; }'}
              aria-label="Custom CSS"
              className="code-block w-full resize-none rounded-xl p-3 font-mono text-[11px] leading-relaxed outline-none focus:border-[var(--cyan)]"
            />
            <p className="mt-1 text-[9px] text-tri">applies instantly to everything · saved for you on this device</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}