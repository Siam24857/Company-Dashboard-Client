'use client'

import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 1 — Mood-Aware UI. A soft tint derived from overall system health. */
export default function MoodAura() {
  const mood = useDashboardStore((s) => s.mood)
  const on = useFlagsStore((s) => !!s.flags['mood-aura']?.on)
  if (!on) return null
  return <div className={`mood-aura tone-${mood}`} aria-hidden="true" />
}