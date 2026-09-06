'use client'

import useDashboardStore from '@/store/dashboard.store'
import { Ghost } from 'lucide-react'

const PERIODS = [
  { d: 30, label: 'prev 30 days' },
  { d: 60, label: 'prev 60 days' },
  { d: 90, label: 'prev quarter' },
  { d: 365, label: 'prev year' },
]

/* Feature 5 — Comparison Ghost Mode. Superimposes a previous period over the current chart. */
export default function GhostToggle() {
  const ghost = useDashboardStore((s) => s.ghost)
  const days = useDashboardStore((s) => s.ghostDays)
  const setGhost = useDashboardStore((s) => s.setGhost)
  const setGhostDays = useDashboardStore((s) => s.setGhostDays)
  const award = useDashboardStore((s) => s.award)

  return (
    <div className="flex items-center gap-2">
      <button
        className={ghost ? 'btn btn-tonal tone-cyan' : 'btn'}
        aria-pressed={ghost}
        onClick={() => {
          setGhost(!ghost)
          if (!ghost) award('ghostbuster')
        }}
      >
        <Ghost size={13} /> <span className="hidden sm:inline">Ghost compare</span>
      </button>
      {ghost && (
        <select
          value={days}
          onChange={(e) => setGhostDays(Number(e.target.value))}
          aria-label="Ghost period"
          className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[11px] text-sec outline-none focus:border-[var(--cyan)]"
        >
          {PERIODS.map((p) => (
            <option key={p.d} value={p.d}>{p.label}</option>
          ))}
        </select>
      )}
    </div>
  )
}