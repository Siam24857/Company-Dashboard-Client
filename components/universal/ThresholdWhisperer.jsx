'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, X, BellRing, Plus } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { parseThreshold } from '@/lib/ai'

/* Feature 14 — Threshold Whisperer. "Tell me when revenue drops below 1M" →
   armed voice-like alert + browser toast when the mock crosses it. */
export default function ThresholdWhisperer() {
  const open = useDashboardStore((s) => s.thresholdOpen)
  const setOpen = useDashboardStore((s) => s.setThresholdOpen)
  const defs = useDashboardStore((s) => s.alertDefs)
  const setAlert = useDashboardStore((s) => s.setAlertDef)
  const disarm = useDashboardStore((s) => s.disarmAlert)
  const on = useFlagsStore((s) => !!s.flags['whisperer']?.on)
  const [text, setText] = useState('Tell me when revenue drops below 1,000,000')
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!defs.length) return undefined
    const t = setInterval(() => {
      const s = useDashboardStore.getState()
      let fired = false
      defs.filter((a) => a.armed).forEach((a) => {
        const val = a.metric === 'revenue' ? 1284000 : a.metric === 'users' ? 48213 : a.metric === 'churn' ? 3.6 : 214
        const hit = a.op === 'below' ? val < a.value : a.op === 'above' ? val > a.value : Math.abs(val - a.value) < 2
        if (hit) {
          s.pushHun({ title: `Whisper · ${a.metric} ${a.op} ${a.value}`, body: `${a.metric} is now ${val.toLocaleString()}.`, tone: 'critical' })
          s.disarmAlert(a.id)
          fired = true
        }
      })
      if (fired) {
        s.logAction('Threshold whisperer fired')
        setFlash(true)
        setTimeout(() => setFlash(false), 2200)
      }
    }, 8000)
    return () => clearInterval(t)
  }, [defs])

  if (!on) return null

  const arm = () => {
    const p = parseThreshold(text)
    if (!p) return
    setAlert(p)
  }

  return (
    <>
      <button className={flash ? 'btn btn-danger' : 'btn'} onClick={() => setOpen(true)} aria-label="Threshold whisperer">
        <Volume2 size={13} /> {flash ? 'Alert fired!' : 'Whisperer'}
        {defs.length > 0 && <span className="chip tone-warn tone-soft ml-1 !px-1.5 !py-0 text-[9px]">{defs.filter((d) => d.armed).length}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[88]" role="dialog" aria-modal="true" aria-label="Threshold whisperer">
            <div className="scrim absolute inset-0" onClick={() => setOpen(false)} />
            <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }} className="glass-strong absolute left-1/2 top-[16vh] w-[min(94vw,520px)] -translate-x-1/2 rounded-2xl p-5 shadow-2xl">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-pri"><BellRing size={14} className="tone-warn tone-text" /> Threshold Whisperer</h3>
                <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={14} /></button>
              </div>
              <p className="mb-2 text-[11px] text-sec">Speak or type a voice-like alert.</p>
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && arm()}
                  aria-label="Threshold phrase"
                  className="flex-1 rounded-xl border border-[var(--stroke)] bg-transparent px-3 py-2 text-xs text-pri outline-none focus:border-[var(--cyan)]"
                />
                <button className="btn btn-primary" onClick={arm}><Plus size={13} /> Arm</button>
              </div>
              <div className="mt-3 space-y-1.5">
                {defs.map((d) => (
                  <div key={d.id} className="glass-soft flex items-center justify-between rounded-xl px-3 py-2 text-[11px]">
                    <span className="text-sec"><span className="font-semibold capitalize text-pri">{d.metric}</span> {d.op} {d.value.toLocaleString()} · {d.armed ? 'armed' : 'fired'}</span>
                    <button className="text-tri hover:text-pri" onClick={() => disarm(d.id)}>×</button>
                  </div>
                ))}
                {!defs.length && <p className="text-center text-[10px] italic text-tri">nothing armed — say “tell me when churn goes above 3”</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}