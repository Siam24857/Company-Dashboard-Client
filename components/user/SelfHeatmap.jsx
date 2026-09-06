'use client'

import useDashboardStore from '@/store/dashboard.store'
import { SELF_HEATMAP_SEED } from '@/lib/mock'
import useFlagsStore from '@/store/flags.store'
import { cn } from '@/lib/utils'

/* Feature 24 — Usage Heatmap (self). Mini grid: which days/times are you most productive? */
export default function SelfHeatmap() {
  const usage = useDashboardStore((s) => s.usage)
  const on = useFlagsStore((s) => !!s.flags['self-heatmap']?.on)
  if (!on) return null

  const merge = (daySeed, i) => daySeed.hours.map((v, h) => v + (usage.heat[daySeed.day]?.[`${h}h`] || 0))

  return (
    <div className="card-3d p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-tri">My activity · last 3 weeks</p>
        <span className="flex items-center gap-1 text-[9px] text-tri">less <span className="h-2.5 w-2.5 rounded-[3px] tone-ai tone-text" /> more</span>
      </div>
      <div className="flex items-end gap-[3px] overflow-x-auto pb-1">
        {SELF_HEATMAP_SEED.slice(-21).map((row, i) => {
          const hours = merge(row, i)
          return (
            <div key={row.day} className="flex flex-col gap-[3px]" role="img" aria-label={row.day}>
              {hours.map((v, h) => (
                <span
                  key={h}
                  title={`${row.day} ${String(h).padStart(2, '0')}:00 · ${v} interactions`}
                  className={cn('h-3 w-3 rounded-[3px] transition-colors', v === 0 ? 'bg-[var(--bg-2)]' : 'tone-ai tone-text')}
                  style={v ? { opacity: Math.min(1, 0.35 + v * 0.13), background: 'var(--tone)' } : undefined}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}