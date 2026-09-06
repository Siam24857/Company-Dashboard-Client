'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, GripVertical, ArrowUpRight, ArrowDownRight, LayoutGrid, Maximize2, RotateCcw } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import { cn, fmtCurrency, fmtNum, pct, reduceMotionPref } from '@/lib/utils'
import Sparkline from './Sparkline'
import GoalDial from './GoalDial'
import Tip from '@/components/ui/Tip'
import { useDashboardIcon } from '@/lib/icons'

const FACE_LABELS = ['Value', 'Goal', 'Signal']

const iconFor = (id) => useDashboardIcon(id)

export default function KpiCard({ kpi, series, index }) {
  const store = useDashboardStore((s) => ({
    size: s.kpiSizes[kpi.id] || '1x1',
    setSize: (sz) => s.setKpiSize(kpi.id, sz),
    density: s.density,
    setFocusMode: s.setFocusMode,
    logAction: s.logAction,
    setWorkspace: s.setWorkspace,
  }))

  const [face, setFace] = useState(0)
  const reduced = reduceMotionPref()

  const unit = kpi.unit === 'currency' ? fmtCurrency(kpi.value) : kpi.unit === 'percent' ? `${kpi.value.toFixed(1)}%` : fmtNum(kpi.value)

  const IconComp = iconFor(kpi.id) || DollarSign

  const sizes = [
    { id: '1x1', label: '1×1' },
    { id: '1x2', label: '1×2' },
    { id: '2x2', label: '2×2' },
  ]

  return (
    <motion.article
      layout
      role="group"
      aria-label={`${kpi.label} metric card`}
      className={cn(
        'card-3d group relative flex flex-col overflow-hidden p-5',
        store.density === 'compact' && 'p-4',
        store.size === '1x2' && 'sm:col-span-2',
        store.size === '2x2' && 'sm:col-span-2 md:row-span-2'
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 320, damping: 28 }}
      whileHover={{ y: -3 }}
    >
      <div className="ambient-orb" style={{ background: 'color-mix(in srgb, var(--tone) 22%, transparent)', width: 140, height: 140, right: -30, top: -40, opacity: 0.6 }} />

      {/* Anomaly banner (semantic red) */}
      <AnimatePresence>
        {kpi.anomaly && face === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="chip tone-critical tone-soft w-fit">
              <span className="live-dot" aria-hidden="true" />
              Anomaly · {kpi.anomaly.msg}
              {kpi.anomaly.since && <span className="opacity-70">· since {kpi.anomaly.since}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="tone-soft grid h-8 w-8 place-items-center rounded-xl text-[15px]">
            <IconComp size={15} strokeWidth={2.2} />
          </span>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sec">{kpi.label}</h3>
            <p className="text-tri text-[10px] font-mono">{unit && ''}{index + 1}/4</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <Tip label="Resize (gesture: drag card aside) 🡒">
            <div className="flex gap-1 rounded-lg glass-soft p-0.5">
              {sizes.map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => {
                    store.setSize(sz.id)
                    store.logAction(`Resized ${kpi.label} to ${sz.label}`)
                  }}
                  aria-pressed={store.size === sz.id}
                  aria-label={`Resize ${kpi.label} to ${sz.label}`}
                  className={cn(
                    'rounded-md px-1.5 py-1 text-[10px] font-semibold transition-colors',
                    store.size === sz.id ? 'tone-soft tone-text' : 'text-tri hover:text-sec'
                  )}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </Tip>
          <Tip label="Focus this metric">
            <button
              className="icon-btn h-7 w-7"
              aria-label={`Focus ${kpi.label}`}
              onClick={() => {
                store.setFocusMode(true, kpi.id)
                store.logAction(`Focused ${kpi.label}`)
              }}
            >
              <Maximize2 size={13} />
            </button>
          </Tip>
        </div>
      </div>

      {/* Swipeable gain/faces — gesture-based zero-UI control */}
      <div className="mt-3 min-h-[150px] flex-1 overflow-hidden" tabIndex={0} role="tablist" aria-label={kpi.label}>
        <motion.div
          key={face}
          drag={reduced ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.24}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (info.offset.x < -64) setFace((f) => Math.min(2, f + 1))
            else if (info.offset.x > 64) setFace((f) => Math.max(0, f - 1))
          }}
          initial={{ opacity: 0, x: reduced ? 0 : face > 0 ? 26 : -26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          {face === 0 && (
            <div className={cn('flex flex-col gap-3', store.size === '2x2' && 'md:flex-row md:items-end md:justify-between')}>
              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-display tabular font-700 font-semibold leading-none"
                    style={{ fontSize: store.density === 'compact' ? 30 : 38 }}
                  >
                    {unit}
                  </span>
                  <span className={cn('chip py-0.5 px-2 text-[11px]', kpi.change >= 0 ? 'tone-success tone-soft' : 'tone-critical tone-soft')}>
                    {kpi.change >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {pct(kpi.change)}
                  </span>
                </div>
                <p className={cn('mt-1 text-xs leading-relaxed text-tri', kpi.trend === 'up' ? 'tone-success tone-text' : 'tone-critical tone-text')}>
                  {kpi.forecast} <span className="opacity-60">· AI forecast</span>
                </p>
              </div>
              <Sparkline
                data={series}
                width={store.size === '2x2' ? 220 : 132}
                height={40}
                tone={kpi.anomaly ? 'critical' : 'cyan'}
                live
              />
            </div>
          )}

          {face === 1 && (
            <div className="flex items-center gap-4">
              <GoalDial value={kpi.value} goal={kpi.goal} inverse={kpi.inverse} size={92} stroke={7} label={kpi.label} />
              <div className="flex-1 space-y-2">
                <p className="text-sm text-sec">Goal vs actual</p>
                <p className="text-xs text-tri leading-relaxed">
                  {kpi.inverse ? `Keeping ${kpi.label.toLowerCase()} under ${kpi.goal}${kpi.unit === 'percent' ? '%' : ''} — currently ${kpi.value}.` : `Hitting ${fmtNum(kpi.goal)} ${kpi.unit}`}
                </p>
                <p className={cn('chip', kpi.inverse ? 'tone-warn tone-soft' : 'tone-success tone-soft')}>
                  {Math.round((kpi.value / kpi.goal) * 100)}% of plan
                </p>
              </div>
            </div>
          )}

          {face === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-sec">Signal bench</p>
              {kpi.benchmark && (
                <div className="flex items-center justify-between rounded-xl glass-soft px-3 py-2.5">
                  <span className="text-xs text-tri">{kpi.benchmark.label}</span>
                  <span className={cn('chip text-[11px]', kpi.benchmark.value >= kpi.value ? (kpi.benchmark.lowerIsBetter ? 'tone-success tone-soft' : 'tone-warn tone-soft') : 'tone-success tone-soft')}>
                    {kpi.benchmark.value}
                  </span>
                </div>
              )}
              <button
                className="btn w-full text-xs"
                onClick={() => {
                  store.setWorkspace('executive')
                  store.logAction(`Deep-dive ${kpi.label}`)
                }}
              >
                <LayoutGrid size={12} /> Deep-dive analytics
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* face dots + drag hint */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-1.5" role="tablist" aria-label={`${kpi.label} views`}>
          {FACE_LABELS.map((f, i) => (
            <button
              key={f}
              role="tab"
              aria-selected={face === i}
              onClick={() => setFace(i)}
              aria-label={`${f} view`}
              className={cn('h-1.5 rounded-full transition-all', face === i ? 'w-5 tone-soft tone-text' : 'w-2.5 bg-current opacity-20 hover:opacity-40')}
            />
          ))}
        </div>
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-tri">
          <span className="hidden md:inline-flex items-center gap-1 opacity-60">
            <GripVertical size={11} /> swipe
          </span>
          <button
            className="icon-btn h-6 w-6"
            aria-label="Reset layout"
            onClick={() => {
              store.logAction('Layout reset to defaults')
              storeKpiReset(kpi.id)
            }}
          >
            <RotateCcw size={11} />
          </button>
        </span>
      </div>
    </motion.article>
  )
}

function storeKpiReset(id) {
  useDashboardStore.getState().setKpiSize(id, '1x1')
}