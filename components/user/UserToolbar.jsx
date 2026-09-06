'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, X, Play, Pause, Palette, EyeOff, Target, Check } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { PALETTES } from '@/lib/mock'
import { cn } from '@/lib/utils'

/* Feature 26 — Focus Timer. Pomodoro that dims everything except the active panel. */
export function FocusTimer() {
  const timer = useDashboardStore((s) => s.focusTimer)
  const start = useDashboardStore((s) => s.startFocus)
  const stop = useDashboardStore((s) => s.stopFocus)
  const on = useFlagsStore((s) => !!s.flags['focus-timer']?.on)
  const [task, setTask] = useState('')
  const [now, setNow] = useState(Date.now())
  const [open, setOpen] = useState(false)
  if (!on) return null

  useEffect(() => {
    if (!timer) return undefined
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [timer])

  const left = timer ? Math.max(0, Math.ceil((timer.endTs - now) / 1000)) : 0
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const pct = timer ? (left / (25 * 60)) * 100 : 0

  return (
    <div className="relative">
      <button className={timer ? 'btn btn-tonal tone-orange' : 'btn'} onClick={() => setOpen((o) => !o)} aria-label="Focus timer">
        <Timer size={13} /> {timer ? <span className="tabular">{mm}:{ss}</span> : <span className="hidden sm:inline">Focus</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="glass-strong absolute right-0 top-10 z-50 w-64 rounded-2xl border border-[var(--stroke)] p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-tri">Pomodoro · 25m</p>
              <button className="icon-btn h-5 w-5" onClick={() => setOpen(false)} aria-label="Close"><X size={11} /></button>
            </div>
            {!timer ? (
              <>
                <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="what are you focusing on?" aria-label="Focus task" className="mb-2 w-full rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[11px] text-pri outline-none focus:border-[var(--cyan)]" />
                <button className="btn btn-primary w-full !py-2 text-[11px]" onClick={() => { start(task.trim() || 'Deep work'); setOpen(false) }}>
                  <Play size={12} /> Start — dims non-essential UI
                </button>
              </>
            ) : (
              <>
                <p className="mb-2 truncate text-[11px] font-semibold text-pri">{timer.task}</p>
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-2)]">
                  <div className="h-full rounded-full bg-[var(--orange)] transition-[width] duration-1000" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-1.5">
                  <button className="btn btn-ghost flex-1 !py-1 text-[11px]" onClick={() => { stop(); setOpen(false) }}><X size={11} /> Cancel</button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* Feature 32 — Colour-blind palettes. 6 schemes, persisted per user. */
export function PalettePicker() {
  const palette = useDashboardStore((s) => s.palette)
  const setPalette = useDashboardStore((s) => s.setPalette)
  const on = useFlagsStore((s) => !!s.flags['palettes']?.on)
  if (!on) return null
  return (
    <button className="btn" title="Colour-blind palettes" onClick={() => {
      const next = PALETTES[(PALETTES.findIndex((p) => p.id === palette) + 1) % PALETTES.length].id
      setPalette(next)
      document.documentElement.dataset.palette = next
    }}>
      <Palette size={13} />
      <span className="hidden sm:inline">{PALETTES.find((p) => p.id === palette)?.label || 'Palette'}</span>
    </button>
  )
}

/* Feature 35 — Temporary Anonymisation. Scrubs customer PII for screen sharing. */
export function ScrubToggle() {
  const scrub = useDashboardStore((s) => s.scrub)
  const setScrub = useDashboardStore((s) => s.setScrub)
  const on = useFlagsStore((s) => !!s.flags['scrub']?.on)
  if (!on) return null
  return (
    <button className={scrub ? 'btn btn-danger' : 'btn'} aria-pressed={scrub} onClick={() => { setScrub(!scrub); document.documentElement.dataset.scrub = scrub ? '0' : '1' }} title="Blur customer PII">
      <EyeOff size={13} /> {scrub ? <span className="hidden sm:inline">Scrub on</span> : null}
    </button>
  )
}

/* Feature 27 — Default View Override. Always land on your favourite module. */
export function DefaultLanding() {
  const landing = useDashboardStore((s) => s.defaultLanding)
  const set = useDashboardStore((s) => s.setDefaultLanding)
  const on = useFlagsStore((s) => !!s.flags['dashboard-dna']?.on)
  void on
  const options = [
    { v: '/command-center', label: 'Overview' },
    { v: '/command-center/data', label: 'Data table' },
    { v: '/command-center#tasks', label: 'Kanban board' },
  ]
  return (
    <div className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
      <Target size={12} className="text-tri" />
      <select value={landing} onChange={(e) => set(e.target.value)} aria-label="Default landing view" className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1 text-[11px] text-sec outline-none focus:border-[var(--cyan)]">
        {options.map((o) => <option key={o.v} value={o.v}>Land on: {o.label}</option>)}
      </select>
      {landing !== '/command-center' && <Check size={12} className="text-[var(--green)]" />}
    </div>
  )
}