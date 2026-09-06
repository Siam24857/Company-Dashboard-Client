'use client'

import { useEffect } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 73 · Theme mixing — continuous dark↔light, not a binary toggle. */
export default function ThemeMixSlider() {
  const mix = useDashboardStore((s) => s.themeMix)
  const setMix = useDashboardStore((s) => s.setThemeMix)
  const enabled = useFlagsStore((s) => !!s.flags['theme-mix']?.on)

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.style.setProperty('--theme-mix', `${Math.round(mix)}%`)
  }, [mix, enabled])

  if (!enabled) return null

  return (
    <label className="flex items-center gap-2" title="Continuous dark ↔ light mix">
      <SlidersHorizontal size={13} className="text-tri" aria-hidden="true" />
      <input
        type="range"
        min={0}
        max={100}
        value={mix}
        onChange={(e) => setMix(Number(e.target.value))}
        aria-label="Theme mix (dark ↔ light)"
        className="w-24"
      />
      <span className="w-8 text-right tabular text-[9px] text-tri">{mix}</span>
    </label>
  )
}