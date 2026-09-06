'use client'

import useDashboardStore from '@/store/dashboard.store'
import { windowLabel } from '@/lib/utils'

const STOPS = [2, 24, 168, 336, 720, 2160, 8760]

/* Feature 4 — Relative Time Slider. Drag to rewind the whole dashboard live. */
export default function TimeSlider({ compact = false }) {
  const hours = useDashboardStore((s) => s.timeWindow)
  const set = useDashboardStore((s) => s.setTimeWindow)

  const idx = Math.max(0, STOPS.findIndex((s) => s >= hours))

  return (
    <div className="flex min-w-[220px] items-center gap-3">
      {!compact && <span className="text-[10px] uppercase tracking-widest text-tri">window</span>}
      <div className="relative h-1.5 flex-1 rounded-full bg-[var(--bg-2)]">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--cyan)]" style={{ width: `${((idx + 1) / STOPS.length) * 100}%` }} />
        {STOPS.map((s, i) => (
          <button
            key={s}
            aria-label={`${windowLabel(s)} preset`}
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all"
            style={{
              left: `${((i + 1) / STOPS.length) * 100}%`,
              background: i <= idx ? 'var(--cyan)' : 'var(--bg-2)',
              borderColor: i <= idx ? 'var(--cyan)' : 'var(--stroke)',
            }}
            onClick={() => set(s)}
          />
        ))}
      </div>
      <span className="tabular text-[11px] font-semibold text-pri">{windowLabel(hours)}</span>
      <input
        type="range"
        min={0}
        max={STOPS.length - 1}
        step={1}
        value={idx}
        onChange={(e) => set(STOPS[Number(e.target.value)])}
        aria-label="Relative time window"
        className="h-0 w-0 opacity-0"
      />
    </div>
  )
}