'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Play, Pause, Presentation } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import MainChart from '@/components/charts/MainChart'
import SystemHealth from '@/components/health/SystemHealth'
import TaskBoard from '@/components/tasks/TaskBoard'
import InsightsFeed from '@/components/insights/InsightsFeed'
import useFlagsStore from '@/store/flags.store'
import { cn } from '@/lib/utils'

function StoryCard({ children }) {
  return <div className="card-3d h-full overflow-auto p-8">{children}</div>
}

/* Feature 7 — Story Mode (presentation-ready slideshow). Full screen, chrome hidden. */
export default function StoryMode() {
  const open = useDashboardStore((s) => s.story)
  const setOpen = useDashboardStore((s) => s.setStory)
  const on = useFlagsStore((s) => !!s.flags['story-mode']?.on)
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(true)

  const slides = useMemo(
    () => [
      { name: 'Executive brief', node: <StoryCard><div className="grid h-full place-items-center"><div className="text-center"><div className="font-display text-3xl font-bold text-pri">The state of the business</div><p className="mx-auto mt-3 max-w-lg text-sm text-sec">Revenue, users, churn and retention — live, annotated, uncluttered.</p></div></div></StoryCard> },
      { name: 'Analytics', node: <StoryCard><MainChart /></StoryCard> },
      { name: 'System health', node: <StoryCard><SystemHealth /></StoryCard> },
      { name: 'Task workflow', node: <StoryCard><TaskBoard /></StoryCard> },
      { name: 'Intelligence', node: <StoryCard><InsightsFeed /></StoryCard> },
    ],
    []
  )

  useEffect(() => {
    if (!open) return undefined
    const t = setInterval(() => setPlaying((p) => { if (p) setIdx((i) => (i + 1) % slides.length); return p }), 7000)
    return () => clearInterval(t)
  }, [open, playing, slides.length])

  useEffect(() => {
    const h = (e) => {
      if (!open) return
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % slides.length)
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + slides.length) % slides.length)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, slides.length, setOpen])

  if (!open || !on) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[95] bg-[var(--bg-0)]">
      <div className="pointer-events-none absolute inset-0 data-field opacity-30" aria-hidden="true" />
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-5">
        <span className="flex items-center gap-2 font-display text-sm font-semibold text-pri">
          <Presentation size={15} className="text-tri" /> Story · {slides[idx].name}
        </span>
        <button className="icon-btn" aria-label="Close story mode" onClick={() => setOpen(false)}><X size={17} /></button>
      </header>

      <div className="absolute inset-0 flex items-center justify-center p-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985, y: -10 }}
            transition={{ duration: 0.45 }}
            className="story-stage h-[74vh] w-[min(94vw,1100px)]"
          >
            {slides[idx].node}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-5 sm:flex">
        <button className="icon-btn" aria-label="Previous slide" onClick={() => setIdx((idx - 1 + slides.length) % slides.length)}><ChevronLeft size={16} /></button>
        <button className="btn btn-primary" aria-pressed={playing} onClick={() => setPlaying(!playing)}>
          {playing ? <Pause size={13} /> : <Play size={13} />} {playing ? 'Pause' : 'Play'}
        </button>
        <button className="icon-btn" aria-label="Next slide" onClick={() => setIdx((idx + 1) % slides.length)}><ChevronRight size={16} /></button>
        <div className="ml-2 flex items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.name}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={cn('h-1.5 rounded-full transition-all', i === idx && 'w-6')}
              style={{ width: i === idx ? 22 : 8, background: i === idx ? 'var(--cyan)' : 'var(--stroke)' }}
            />
          ))}
        </div>
      </footer>
    </motion.div>
  )
}