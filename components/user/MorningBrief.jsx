'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sunrise, X } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { KPI_DEFS } from '@/lib/mock'
import { fmtNum } from '@/lib/utils'
import { useRouter } from 'next/navigation'

/* Feature 21 — My Morning Brief. First login of the day: only-what-changed summary. */
export default function MorningBrief() {
  const shown = useDashboardStore((s) => s.morningShown)
  const mark = useDashboardStore((s) => s.markMorningShown)
  const on = useFlagsStore((s) => !!s.flags['morning-brief']?.on)
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()
  const today = new Date().toDateString()

  const bullets = useMemo(() => {
    const churn = KPI_DEFS.find((k) => k.id === 'churn')
    const revenue = KPI_DEFS.find((k) => k.id === 'revenue')
    const users = KPI_DEFS.find((k) => k.id === 'users')
    return [
      { tone: 'critical', icon: '▲', text: `Churn ${churn?.change}pt above norm — ${churn?.anomaly?.msg || 'check retention cohort'}.` },
      { tone: 'success', icon: '▲', text: `${revenue?.label} ${revenue?.change}% vs forecast; on pace for target in ~6 days.` },
      { tone: 'info', icon: '▸', text: `${fmtNum(users?.value || 0)} active users (+${users?.change}%). 2 deployments shipped overnight.` },
    ]
  }, [])

  const render = shown !== today && !dismissed && on

  return (
    <AnimatePresence>
      {render && (
        <motion.div className="fixed inset-0 z-[96]" role="dialog" aria-modal="true" aria-label="Morning brief">
          <div className="scrim absolute inset-0" onClick={() => { mark(); setDismissed(true) }} />
          <motion.div
            initial={{ y: -26, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -26, opacity: 0 }}
            className="glass-strong absolute left-1/2 top-[14vh] w-[min(94vw,540px)] -translate-x-1/2 rounded-3xl p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="tone-warn tone-soft grid h-11 w-11 place-items-center rounded-2xl"><Sunrise size={20} /></span>
                <div>
                  <h2 className="font-display text-lg font-bold text-pri">Good morning, Ava</h2>
                  <p className="text-[11px] text-tri">Here&apos;s what changed since yesterday. No noise.</p>
                </div>
              </div>
              <button className="icon-btn" onClick={() => { mark(); setDismissed(true) }} aria-label="Dismiss"><X size={15} /></button>
            </div>
            <ul className="space-y-2.5">
              {bullets.map((b, i) => (
                <li key={i} className="glass-soft flex items-start gap-3 rounded-xl px-3.5 py-3">
                  <span className={`mt-0.5 font-mono text-xs ${b.tone === 'critical' ? 'text-[var(--red)]' : b.tone === 'success' ? 'text-[var(--green)]' : 'text-[var(--blue)]'}`}>{b.icon}</span>
                  <span className="text-xs leading-relaxed text-sec">{b.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => { mark(); router.push('/command-center#tasks') }}>Open tasks</button>
              <button className="btn btn-primary" onClick={() => { mark(); setDismissed(true) }}>Got it</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}