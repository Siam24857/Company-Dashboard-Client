'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, X, Plus, Trash2 } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 11 — Inline Annotations. Sticky notes on data points, visible to the team. */
export default function AnnotationsHub() {
  const annotations = useDashboardStore((s) => s.annotations)
  const add = useDashboardStore((s) => s.addAnnotation)
  const remove = useDashboardStore((s) => s.removeAnnotation)
  const on = useFlagsStore((s) => !!s.flags['annotations']?.on)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [target, setTarget] = useState('Revenue · EU')
  if (!on) return null

  const save = () => {
    if (text.trim()) {
      add({ target, text: text.trim() })
      setText('')
    }
  }

  return (
    <div className="relative">
      <button className={annotations.length ? 'btn btn-tonal tone-violet' : 'btn'} aria-label="Annotations" onClick={() => setOpen((o) => !o)}>
        <StickyNote size={13} /> <span className="hidden sm:inline">Notes</span>
        {annotations.length > 0 && <span className="chip tone-ai tone-soft !px-1.5 !py-0 text-[9px]">{annotations.length}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="glass-strong absolute right-0 top-10 z-50 w-72 rounded-2xl border border-[var(--stroke)] p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-tri">Team notes</p>
              <button className="icon-btn h-5 w-5" onClick={() => setOpen(false)} aria-label="Close"><X size={11} /></button>
            </div>
            <div className="mb-2 flex gap-1.5">
              <input value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Note target" className="w-24 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-pri outline-none" />
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} placeholder="e.g. spike = Super Bowl ad…" aria-label="Note text" className="min-w-0 flex-1 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[11px] text-pri outline-none focus:border-[var(--cyan)]" />
              <button className="icon-btn h-7 w-7" onClick={save} aria-label="Add note"><Plus size={13} /></button>
            </div>
            <div className="max-h-44 space-y-1.5 overflow-y-auto">
              {annotations.map((a) => (
                <div key={a.id} className="glass-soft rounded-xl p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] font-semibold text-pri">{a.target}</span>
                    <button className="text-tri hover:text-[var(--red)]" onClick={() => remove(a.id)} aria-label="Delete note"><Trash2 size={11} /></button>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-sec">{a.text}</p>
                  <p className="mt-1 text-[9px] text-tri">{a.author} · {new Date(a.at).toLocaleTimeString()}</p>
                </div>
              ))}
              {!annotations.length && <p className="py-2 text-center text-[10px] italic text-tri">right-click any chart bar or widget to annotate</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}