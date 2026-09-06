'use client'

import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { ACH_BADGES } from '@/lib/mock'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Bookmark, Workflow, Ghost } from 'lucide-react'

const ICONS = { Sparkles, Zap, Bookmark, Workflow, Ghost }

/* Feature 36 — My Achievements. Subtle gamified badges, never annoying. */
export default function Achievements({ compact = false }) {
  const ach = useDashboardStore((s) => s.achievements)
  const on = useFlagsStore((s) => !!s.flags['achievements']?.on)
  if (!on) return null
  const earned = Object.keys(ach).length
  if (compact && earned === 0) return null

  return (
    <motion.div layout className="card-3d flex items-center gap-3 p-4">
      {compact ? (
        <div className="flex items-center gap-2 text-[10px] text-tri">
          <Sparkles size={12} className="text-[var(--violet)]" />
          {earned} badges earned
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-tri">Achievements</p>
          {ACH_BADGES.map((b) => {
            const Icon = ICONS[b.icon] || Sparkles
            const got = !!ach[b.id]
            return (
              <span key={b.id} title={got ? b.hint : `Locked — ${b.hint}`} className={got ? 'tone-cyan tone-soft grid h-8 w-8 place-items-center rounded-xl tone-text' : 'grid h-8 w-8 place-items-center rounded-xl bg-[var(--bg-2)] text-tri'}>
                <Icon size={13} />
              </span>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}