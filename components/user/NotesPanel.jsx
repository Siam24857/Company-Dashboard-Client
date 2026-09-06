'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X, BellPlus } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 25 (Private Notes) + 33 (Smart Reminders) — personal, invisible layers. */
export function PrivateNotes() {
  const setNote = useDashboardStore((s) => s.setNote)
  const on = useFlagsStore((s) => !!s.flags['private-notes']?.on)
  const [target, setTarget] = useState('KPI · Revenue')
  const [text, setText] = useState('')
  if (!on) return null
  return (
    <div className="glass-soft rounded-xl p-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-tri"><Lock size={10} /> Private notes — only you can see them</p>
      <div className="flex gap-1.5">
        <input value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Note target" className="w-28 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="mental reminder…" aria-label="Private note" className="min-w-0 flex-1 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[11px] text-pri outline-none focus:border-[var(--cyan)]" />
        <button className="btn btn-ghost !py-1.5 text-[11px]" onClick={() => setNote(target, text.trim())}>Save</button>
      </div>
    </div>
  )
}

export function RemindersPanel() {
  const reminders = useDashboardStore((s) => s.reminders)
  const add = useDashboardStore((s) => s.addReminder)
  const dismiss = useDashboardStore((s) => s.dismissReminder)
  const on = useFlagsStore((s) => !!s.flags['reminders']?.on)
  const [text, setText] = useState('')
  const [days, setDays] = useState(2)
  if (!on) return null
  const addNow = () => {
    if (!text.trim()) return
    add(text.trim(), Date.now() + days * 86400000)
    setText('')
  }
  return (
    <div className="glass-soft rounded-xl p-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-tri"><BellPlus size={10} /> Smart reminders</p>
      <div className="flex gap-1.5">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNow()} placeholder="remind me to check…" aria-label="Reminder text" className="min-w-0 flex-1 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Remind in days" className="rounded-lg border border-[var(--stroke)] bg-transparent px-1 py-1 text-[10px] text-sec outline-none">
          {[1, 2, 3, 7].map((d) => <option key={d} value={d}>{d}d</option>)}
        </select>
        <button className="btn btn-primary !py-1 text-[10px]" onClick={addNow}>Set</button>
      </div>
      {reminders.length > 0 && (
        <div className="mt-2 space-y-1">
          {reminders.slice(0, 4).map((r) => (
            <div key={r.id} className="flex items-center gap-2 rounded-lg bg-[var(--bg-2)] px-2 py-1">
              <span className={r.due ? 'min-w-0 flex-1 truncate text-[10px] text-[var(--red)] line-through' : 'min-w-0 flex-1 truncate text-[10px] text-sec'}>{r.text}</span>
              {r.due && <span className="chip tone-warn tone-soft !px-1.5 !py-0 text-[8px]">due now</span>}
              <button className="text-tri hover:text-pri" onClick={() => dismiss(r.id)} aria-label="Dismiss reminder">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}