'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, X, Plus } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { cn } from '@/lib/utils'

const COLORS = ['var(--cyan)', 'var(--violet)', 'var(--yellow)', 'var(--green)', 'var(--orange)']

/* Feature 19 — Global Tagging. Tag any object and filter across all modules. */
export default function TagPanel() {
  const tags = useDashboardStore((s) => s.tags)
  const addTag = useDashboardStore((s) => s.addTag)
  const removeTag = useDashboardStore((s) => s.removeTag)
  const on = useFlagsStore((s) => !!s.flags['global-tags']?.on)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [active, setActive] = useState('')
  if (!on) return null

  return (
    <div className="relative">
      <button className={active ? 'btn btn-tonal tone-cyan' : 'btn'} aria-label="Global tags" onClick={() => setOpen((o) => !o)}>
        <Tag size={13} /> <span className="hidden sm:inline">Tags</span>
        {active && <span className="chip tone-cyan tone-soft !px-1.5 !py-0 text-[9px]">{active}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="glass-strong absolute right-0 top-10 z-50 w-64 rounded-2xl border border-[var(--stroke)] p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-tri">Global tags</p>
              <button className="icon-btn h-5 w-5" onClick={() => setOpen(false)} aria-label="Close"><X size={11} /></button>
            </div>
            <div className="mb-2 flex gap-1.5">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="new tag…" aria-label="Tag name" className="min-w-0 flex-1 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[11px] text-pri outline-none focus:border-[var(--cyan)]" />
              <button className="icon-btn h-7 w-7" aria-label="Add tag" onClick={() => { if (name.trim()) { addTag({ name: name.trim(), color }); setName('') } }}><Plus size={13} /></button>
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              {COLORS.map((c) => <button key={c} aria-label={`Color ${c}`} className={cn('h-3.5 w-3.5 rounded-full', color === c && 'ring-2 ring-offset-1')} style={{ background: c, '--tw-ring-color': c }} onClick={() => setColor(c)} />)}
            </div>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {tags.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-[var(--glass)]">
                  <button className="flex min-w-0 flex-1 items-center gap-1.5" onClick={() => setActive(active === t.name ? '' : t.name)}>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: t.color }} />
                    <span className={cn('truncate text-[11px]', active === t.name ? 'font-semibold text-pri' : 'text-sec')}>{t.name}</span>
                  </button>
                  <span className="text-[9px] text-tri">0</span>
                  <button className="text-tri hover:text-pri" onClick={() => removeTag(t.id)} aria-label={`Remove ${t.name}`}>×</button>
                </div>
              ))}
              {!tags.length && <p className="py-2 text-center text-[10px] italic text-tri">tag clients, projects or servers, then filter everywhere</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}