'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, X, Quote, BrainCircuit, TrendingUp, MessagesSquare } from 'lucide-react'
import { dailyDigest, rootCauses, recommendations, feedbackSentiments, sentimentScore } from '@/lib/mock'
import useDashboardStore from '@/store/dashboard.store'
import { cn } from '@/lib/utils'
import LazyMount from '@/hooks/useInView'
import Skeleton from '@/components/ui/Skeleton'
import ToneChip from '@/components/ui/ToneChip'
import Tip from '@/components/ui/Tip'

/** Module 5 — AI-Powered Insights Feed */
export default function InsightsFeed() {
  return (
    <LazyMount fallback={<InsightsSkeleton />}>
      <section className="card-3d flex h-full flex-col overflow-hidden" aria-label="AI insights feed">
        <header className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="tone-ai tone-soft grid h-7 w-7 place-items-center rounded-lg">
              <BrainCircuit size={14} />
            </span>
            <h2 className="font-display text-sm font-semibold text-pri">AI Insights</h2>
            <ToneChip tone="ai" dot className="ml-0.5">live</ToneChip>
          </div>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-5 [scrollbar-gutter:stable]">
          <DailyDigest />
          <RootCauses />
          <Recommendations />
          <Sentiment />
        </div>
      </section>
    </LazyMount>
  )
}

function DailyDigest() {
  const [revealed, setRevealed] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setRevealed(dailyDigest.length), 2600)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="tone-ai tone-faint rounded-xl p-3.5">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold tone-ai tone-text">
        <Sparkles size={12} /> Daily Digest
        <span className="rounded-md px-1.5 py-0.5 text-[9px] uppercase tracking-widest" style={{ background: 'var(--tone-soft)' }}>
          since last login
        </span>
      </div>
      <p className="text-xs leading-relaxed text-sec">
        {dailyDigest.slice(0, revealed)}
        {revealed < dailyDigest.length && (
          <span className="ml-0.5 inline-block h-3 w-0.5 animate-[pulse-soft] align-middle" style={{ background: 'var(--violet)' }} />
        )}
      </p>
    </div>
  )
}

function RootCauses() {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-pri">
        <TrendingUp size={12} /> Root Cause Analysis
      </h3>
      <div className="space-y-2">
        {rootCauses.map((rc) => (
          <div key={rc.id} className={cn('glass-soft rounded-xl p-3', `tone-${rc.tone}`)}>
            <div className="flex items-center justify-between gap-2">
              <span className="chip tone-soft tone-text text-[10px]">{rc.metric}</span>
              <span className="tabular text-[10px] text-tri">{Math.round(rc.confidence * 100)}% conf</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-sec">{rc.cause}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Recommendations() {
  const [state, setState] = useState(() =>
    recommendations.map((r) => ({ ...r, resolved: false, applied: false }))
  )
  const logAction = useDashboardStore((s) => s.logAction)

  const resolve = (id, applied) => {
    setState((s) => s.map((r) => (r.id === id ? { ...r, resolved: true, applied } : r)))
    logAction(applied ? `Applied AI recommendation: ${state.find((r) => r.id === id).title}` : `Dismissed recommendation: ${state.find((r) => r.id === id).title}`)
  }

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-pri">
        <BrainCircuit size={12} /> Recommendation Engine
      </h3>
      <div className="space-y-2">
        <AnimatePresence>
          {state.filter((r) => !r.resolved).map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: r.applied ? 40 : -40, height: 0 }}
              className={cn('card-3d-pressed rounded-xl p-3', `tone-${r.tone}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold leading-snug text-pri">{r.title}</p>
                <span className={cn('chip text-[9px] py-0 px-1.5', r.impact === 'Critical' ? 'tone-critical tone-soft' : r.impact === 'High' ? 'tone-warn tone-soft' : 'tone-info tone-soft')}>
                  {r.impact}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-sec">{r.body}</p>
              <div className="mt-2 flex items-center gap-2">
                <button className="btn btn-tonal !py-1.5 text-[11px]" onClick={() => resolve(r.id, true)}>
                  <Check size={12} /> Apply
                </button>
                <button className="btn !py-1.5 text-[11px]" onClick={() => resolve(r.id, false)}>
                  <X size={12} /> Dismiss
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {state.every((r) => r.resolved) && (
          <p className="py-2 text-center text-[11px] text-tri">All recommendations cleared.</p>
        )}
      </div>
    </div>
  )
}

function Sentiment() {
  const score = sentimentScore
  return (
    <div className="border-t border-[var(--stroke)] pt-4">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-pri">
        <MessagesSquare size={12} /> Sentiment Pulse
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative grid h-16 w-16 place-items-center" aria-label={`Customer sentiment ${score.label}, ${score.value}%`} role="img">
          <svg viewBox="0 0 64 64" className="h-16 w-16">
            <path d="M8 32 A24 24 0 1 1 56 32" fill="none" stroke="color-mix(in srgb, var(--text-2) 20%, transparent)" strokeWidth="6" strokeLinecap="round" />
            <path
              d="M8 32 A24 24 0 1 1 56 32"
              fill="none"
              stroke="var(--green)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(score.value / 100) * 150} 999`}
            />
          </svg>
          <span className="absolute font-display text-sm font-bold tabular text-pri">{score.value}%</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-pri">{score.label}</span>
            <span className={score.delta >= 0 ? 'tone-success tone-text' : 'tone-critical tone-text'}>
              {score.delta > 0 ? '+' : ''}{score.delta}pt
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            {feedbackSentiments.slice(0, 2).map((f) => {
              const tone = f.tone === 'positive' ? 'success' : f.tone === 'negative' ? 'critical' : 'warn'
              return (
                <div key={f.id} className="flex items-start gap-1.5 text-[11px] text-sec">
                  <Quote size={10} className="mt-0.5 shrink-0" style={{ color: `var(--${tone === 'success' ? 'green' : tone === 'critical' ? 'red' : 'yellow'})` }} />
                  <span className="line-clamp-2 leading-snug">“{f.text}”</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function InsightsSkeleton() {
  return (
    <section className="card-3d flex h-full flex-col p-5" aria-hidden="true">
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7" circle />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </section>
  )
}