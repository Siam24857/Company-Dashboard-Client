'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slice, X, Plus } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 23 — Saved Slices. Reusable named combinations of filters + window. */
export default function SlicesPanel() {
  const slices = useDashboardStore((s) => s.slices)
  const open = useDashboardStore((s) => s.slicesOpen)
  const setOpen = useDashboardStore((s) => s.setSlicesOpen)
  const save = useDashboardStore((s) => s.saveSlice)
  const load = useDashboardStore((s) => s.loadSlice)
  const remove = useDashboardStore((s) => s.removeSlice)
  const on = useFlagsStore((s) => !!s.flags['saved-slices']?.on)
  const [name, setName] = useState('')
  if (!on) return null

  const quick = [
    'EU Sales Q4',
    'Top client focus',
    'Infra stress view',
    'Board pack — exec',
  ]

  return (
    <div className="relative">
      <button className="btn" aria-label="Saved slices" onClick={() => setOpen(!open)}>
        <Slice size={13} /> <span className="hidden sm:inline">Slices</span>
        {slices.length > 0 && <span className="chip tone-cyan tone-soft !px-1.5 !py-0 text-[9px]">{slices.length}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="glass-strong absolute right-0 top-10 z-50 w-72 rounded-2xl border border-[var(--stroke)] p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-tri">Saved slices</p>
              <button className="icon-btn h-5 w-5" onClick={() => setOpen(false)} aria-label="Close"><X size={11} /></button>
            </div>
            <div className="mb-2 flex gap-1.5">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="slice name…" aria-label="Slice name" className="min-w-0 flex-1 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[11px] text-pri outline-none focus:border-[var(--cyan)]" />
              <button className="btn btn-primary !py-1 text-[11px]" onClick={() => { save(name.trim() || quick[Math.floor(Math.random() * quick.length)]); setName('') }}>
                <Plus size={12} /> Save
              </button>
            </div>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {slices.map((sl) => (
                <div key={sl.id} className="glass-soft flex items-center gap-2 rounded-xl px-2.5 py-2">
                  <button className="min-w-0 flex-1 text-left" onClick={() => { load(sl.id); setOpen(false) }}>
                    <p className="truncate text-[11px] font-semibold text-pri">{sl.name}</p>
                    <p className="text-[9px] text-tri">{new Date(sl.at).toLocaleDateString()} · saved</p>
                  </button>
                  <button className="text-tri hover:text-pri" onClick={() => remove(sl.id)} aria-label="Delete slice">×</button>
                </div>
              ))}
              {!slices.length && <p className="py-2 text-center text-[10px] italic text-tri">no slices yet — name one to snapshot the current filters + chart</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}