'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Workflow, X, Play, Circle, Save } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { cn } from '@/lib/utils'

/* Feature 31 — Keyboard Macro Recorder. Record a click sequence, save, replay with one click. */
export default function MacroRecorder() {
  const macros = useDashboardStore((s) => s.macros)
  const saveMacro = useDashboardStore((s) => s.saveMacro)
  const removeMacro = useDashboardStore((s) => s.removeMacro)
  const on = useFlagsStore((s) => !!s.flags['macro-recorder']?.on)
  const [open, setOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [steps, setSteps] = useState([])
  const [name, setName] = useState('')

  useEffect(() => {
    if (!recording) return undefined
    const h = (e) => {
      const el = e.target?.closest?.('[data-macro]')
      const label = el?.getAttribute('aria-label') || el?.dataset?.macro || el?.textContent?.trim().slice(0, 40)
      if (!label) return
      setSteps((s) => [...s.slice(-19), label])
    }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [recording])

  if (!on) return null

  return (
    <div className="relative">
      <button className={cn('btn', recording && 'macro-recording')} onClick={() => setOpen((o) => !o)} aria-label="Macro recorder">
        <Workflow size={13} /> <span className="hidden sm:inline">Macros</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="glass-strong absolute right-0 top-10 z-50 w-72 rounded-2xl border border-[var(--stroke)] p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-tri">Macros</p>
              <button className="icon-btn h-5 w-5" onClick={() => setOpen(false)} aria-label="Close"><X size={11} /></button>
            </div>
            <button
              className={recording ? 'btn w-full btn-danger !py-2 text-[11px]' : 'btn w-full !py-2 text-[11px]'}
              onClick={() => {
                setRecording(!recording)
                if (!recording) setSteps([])
              }}
            >
              {recording ? <Circle size={11} className="animate-pulse" /> : <Play size={11} />}
              {recording ? 'Recording… click anywhere to capture' : 'Record a sequence'}
            </button>
            {steps.length > 0 && (
              <div className="my-2 space-y-1">
                {steps.map((s, i) => <p key={i} className="rounded-lg bg-[var(--bg-2)] px-2 py-1 text-[10px] text-sec">{i + 1} · {s}</p>)}
                <div className="flex gap-1.5">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="macro name" aria-label="Macro name" className="min-w-0 flex-1 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
                  <button className="btn btn-primary !py-1 text-[10px]" onClick={() => { if (steps.length) { saveMacro(name.trim() || 'Untitled macro', steps); setSteps([]); setRecording(false); setName('') } }}><Save size={11} /> Save</button>
                </div>
              </div>
            )}
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {macros.map((m) => (
                <div key={m.id} className="glass-soft flex items-center gap-2 rounded-lg px-2 py-1.5">
                  <button className="btn btn-ghost !py-0.5 !px-1.5" onClick={() => useDashboardStore.getState().logAction(`Replayed macro: ${m.name} (${m.steps.length} steps)`)} aria-label={`Replay ${m.name}`}><Play size={10} /></button>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-pri">{m.name}</span>
                  <span className="tabular text-[9px] text-tri">{m.steps.length} steps</span>
                  <button className="text-tri hover:text-pri" onClick={() => removeMacro(m.id)} aria-label="Delete macro">×</button>
                </div>
              ))}
              {!macros.length && <p className="py-2 text-center text-[10px] italic text-tri">record filters, exports and navigation — replay with one click</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}