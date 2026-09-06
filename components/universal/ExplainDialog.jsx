'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, X, Sparkles } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { KPI_DEFS } from '@/lib/mock'
import { explainKpi } from '@/lib/ai'

/* Feature 20 — Help Me Understand. Highlight a metric → explain in plain English. */
export default function ExplainDialog() {
  const target = useDashboardStore((s) => s.explainTarget)
  const setTarget = useDashboardStore((s) => s.setExplainOpen)
  const pushAi = useDashboardStore((s) => s.pushAiMessage)
  const award = useDashboardStore((s) => s.award)
  const on = useFlagsStore((s) => !!s.flags['explain']?.on)
  const [text, setText] = useState('')

  const kpi = target ? KPI_DEFS.find((k) => k.id === target) : null

  useEffect(() => {
    if (target) {
      const t = kpi ? explainKpi(kpi) : ''
      setText(t)
      if (t) {
        pushAi({ role: 'ai', text: `💡 ${t}` })
        award('explainer')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  if (!target || !on) return null

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[89]" role="dialog" aria-modal="true" aria-label="Help me understand">
        <div className="scrim absolute inset-0" onClick={() => setTarget(null)} />
        <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }} className="glass-strong absolute left-1/2 top-[18vh] w-[min(94vw,560px)] -translate-x-1/2 rounded-2xl p-5 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-pri">
              <Lightbulb size={15} className="tone-ai tone-text" /> Help me understand · <span className="capitalize">{kpi?.label}</span>
            </h3>
            <button className="icon-btn" onClick={() => setTarget(null)} aria-label="Close"><X size={15} /></button>
          </div>
          <div className="tone-ai tone-faint rounded-2xl p-4 text-sm leading-relaxed text-sec">
            <span className="mb-1 flex items-center gap-1.5 font-semibold text-pri"><Sparkles size={13} /> AI explains</span>
            {text}
          </div>
          <p className="mt-3 text-[10px] text-tri">
            value {kpi?.value.toLocaleString()} · goal {kpi?.goal.toLocaleString()} · change {kpi?.change}% · trend {kpi?.trend}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}