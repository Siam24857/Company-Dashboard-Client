'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Eye } from 'lucide-react'
import useFlagsStore from '@/store/flags.store'
import useDashboardStore from '@/store/dashboard.store'

/* Feature 72 · Holo-tooltips — datapoints project live 3-D "hologram" details on hover. */
export default function HoloTooltip() {
  const enabled = useFlagsStore((s) => !!s.flags['holo-tooltip']?.on)
  const [hover, setHover] = useState(null)

  useEffect(() => {
    if (!enabled) return
    const onHolo = (e) => {
      const detail = e.detail
      if (!detail) return
      setHover((h) => (h && h.x === detail.x && h.label === detail.label ? h : detail))
      const t = setTimeout(() => setHover(null), 1800)
      clearTimeout(window.__holoReset)
      window.__holoReset = t
    }
    window.addEventListener('cc-holo', onHolo)
    return () => window.removeEventListener('cc-holo', onHolo)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const onMove = (e) => {
      if (!window.__holoActive) return
      setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <style>{`.holo-hover{outline:1px solid transparent;outline-offset:4px;transition:outline-color .15s}`}</style>
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, transformOrigin: '6px 6px' }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-none fixed z-[120]"
            style={{ left: hover.x + 14, top: hover.y + 10 }}
            role="tooltip"
          >
            <div className="holo-tip relative w-52 rounded-2xl p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="relative grid h-2 w-2 place-items-center">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-[var(--cyan)] opacity-60" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />
                </span>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">holo · 90-day projection</p>
              </div>
              <p className="font-mono text-[11px] font-semibold text-pri">{hover.label || 'Revenue'}</p>
              <p className="mb-1 text-[10px] text-tri">now · {hover.value ?? '—'}</p>
              <div className="flex items-end gap-1" aria-hidden="true">
                {[0.35, 0.55, 0.45, 0.7, 0.6, 0.82, 0.75, 0.95, 1.12, 1.3].map((h, i) => (
                  <span key={i} className="w-2 rounded-t-sm bg-[var(--cyan)]/80" style={{ height: `${h * 18}px`, opacity: 0.35 + i * 0.07 }} />
                ))}
              </div>
              <p className="mt-1 text-[9px] text-[var(--cyan)]/80">projected trough → peak in Q4 · conf 0.84</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function HoloAura() {
  /* invisible: gives every card a faint holo sheen when enabled */
  const enabled = useFlagsStore((s) => !!s.flags['holo-tooltip']?.on)
  return enabled ? (
    <span className="pointer-events-none fixed inset-0 z-[1] opacity-[0.03]" style={{ background: 'radial-gradient(60% 60% at 30% 0%, var(--cyan), transparent), radial-gradient(50% 50% at 80% 100%, var(--violet), transparent)' }} aria-hidden="true" />
  ) : null
}