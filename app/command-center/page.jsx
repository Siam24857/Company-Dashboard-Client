'use client'

import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Bookmark, Share2, Save, Focus, EyeOff, MousePointer2, TrendingUp } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import { KPI_DEFS, kpiSeries, notificationPool } from '@/lib/mock'
import KpiCard from '@/components/kpi/KpiCard'
import AnalyticsHub from '@/components/analytics/AnalyticsHub'
import InsightsFeed from '@/components/insights/InsightsFeed'
import TaskBoard from '@/components/tasks/TaskBoard'
import SystemHealth from '@/components/health/SystemHealth'
import GoalDial from '@/components/kpi/GoalDial'
import Sparkline from '@/components/kpi/Sparkline'
import Tip from '@/components/ui/Tip'
import SelfHeatmap from '@/components/user/SelfHeatmap'
import ReportsPanel from '@/components/user/Reports'
import Achievements from '@/components/user/Achievements'
import { PrivateNotes, RemindersPanel } from '@/components/user/NotesPanel'
import { DefaultLanding } from '@/components/user/UserToolbar'

/** Cognitive Overview — zero-cognitive-load command surface. */
export default function CommandCenterPage() {
  const store = useDashboardStore((s) => ({
    focusMode: s.focusMode,
    focusTarget: s.focusTarget,
    setFocusMode: s.setFocusMode,
    visual: s.visual,
    workspace: s.workspace,
  }))

  /* ambient activity simulator — gentle data pulse + the occasional HUN */
  useEffect(() => {
    const logAction = useDashboardStore.getState().logAction
    const pushHun = useDashboardStore.getState().pushHun
    const pools = [
      'Sessions/s ▴ 4,182',
      'P99 latency ▾ 214ms',
      'Signups +38 this hour',
      'Cohort D7 retention 81%',
      'ARPU $96 · record',
    ]
    let i = 0
    let lastHun = 0
    const t = setInterval(() => {
      logAction(pools[i++ % pools.length], { toneColor: 'var(--cyan)' })
      if (Date.now() - lastHun > 26000) {
        const n = notificationPool[Math.floor(Math.random() * notificationPool.length)]
        pushHun(n)
        lastHun = Date.now()
      }
    }, 7000)
    return () => clearInterval(t)
  }, [])

  const focusedKpi = useMemo(
    () => (store.focusTarget ? KPI_DEFS.find((k) => k.id === store.focusTarget) : null),
    [store.focusTarget]
  )

  if (store.focusMode && focusedKpi) return <KpiFocusView kpi={focusedKpi} section />
  if (store.focusMode) return <FocusBlank onExit={() => store.setFocusMode(false)} />

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* scene toolbar */}
      <section aria-label="Scene controls" className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-bold text-pri">Cognitive Overview</h1>
          <p className="text-[11px] text-tri">
            workspace: <span className="tone-cyan tone-text capitalize">{store.workspace}</span> · density adaptive · data is the hero
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Tip label="Save current layout to this browser" wide>
            <button className="btn" onClick={() => { useDashboardStore.getState().persist(); toast.success('Layout saved') }}>
              <Save size={13} /> Save layout
            </button>
          </Tip>
          <Tip label="Copy a shareable deep link of this view" wide>
            <button className="btn" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Share link copied'))}>
              <Share2 size={13} />
            </button>
          </Tip>
          <Tip label="Bookmark this filtered view" wide>
            <button
              className="btn"
              onClick={() => {
                const label = store.visual?.title || 'Custom view'
                useDashboardStore.getState().addBookmark(label, store.visual)
                toast.success(`Bookmarked: ${label}`)
              }}
            >
              <Bookmark size={13} />
            </button>
          </Tip>
          <Tip label="Focus mode — hide chrome, float the data" wide>
            <button className="btn btn-primary" onClick={() => store.setFocusMode(true)}>
              <Focus size={13} /> Focus
            </button>
          </Tip>
        </div>
      </section>

      {/* Row 1 — adaptive KPI cluster */}
      <section aria-label="Key performance indicators">
        <GridHeading kicker="Biz-Ops cluster" title="KPI cluster" badge="anomaly scan: active" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_DEFS.map((kpi, i) => (
            <KpiCard key={kpi.id} kpi={kpi} series={kpiSeries[kpi.id]} index={i} />
          ))}
        </div>
      </section>

      {/* Row 2 — analytics 70 / insights 30 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section id="analytics" aria-label="Analytics hub" className="scroll-mt-20">
          <AnalyticsHub />
        </section>
        <InsightsFeed />
      </div>

      {/* Row 3 — task workflow 60 / system health 40 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section id="tasks" aria-label="Task workflow" className="scroll-mt-20">
          <div className="card-3d p-5">
            <TaskBoard />
          </div>
        </section>
        <section id="health" aria-label="System health" className="scroll-mt-20">
          <SystemHealth />
        </section>
      </div>

      {/* Row 4 — your personal layer */}
      <section aria-label="Personal layer">
        <GridHeading kicker="your layer" title="Personal" badge="private · only you" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.5fr_1fr]">
          <SelfHeatmap />
          <ReportsPanel />
          <div className="card-3d flex flex-col gap-3 p-4">
            <DefaultLanding />
            <Achievements />
            <PrivateNotes />
            <RemindersPanel />
          </div>
        </div>
      </section>
    </div>
  )
}

function GridHeading({ kicker, title, badge }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-tri">{kicker}</p>
        <h2 className="font-display text-sm font-semibold text-pri">{title}</h2>
      </div>
      <span className="chip tone-success tone-soft">{badge}</span>
    </div>
  )
}

function FocusBlank({ onExit }) {
  return (
    <div className="grid h-full place-items-center">
      <div className="text-center">
        <MousePointer2 size={26} className="mx-auto mb-3 text-tri" />
        <p className="text-sm text-sec">Focus mode · command palette (⌘K) to drive everything.</p>
        <button className="btn btn-primary mt-4" onClick={onExit}>
          <EyeOff size={13} /> Exit focus
        </button>
      </div>
    </div>
  )
}

function KpiFocusView({ kpi }) {
  const setFocusMode = useDashboardStore((s) => s.setFocusMode)
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card-3d m-6 grid h-[calc(100vh-4rem)] place-items-center">
      <div className="max-w-xl text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className={`tone-${kpi.tone} tone-soft grid h-12 w-12 place-items-center rounded-2xl`}>
            <TrendingUp size={20} />
          </span>
          <h2 className="font-display text-2xl font-bold text-pri">{kpi.label}</h2>
        </div>
        <div className="flex items-center justify-center gap-8">
          <KpiDialOuter kpi={kpi} />
          <Sparkline data={kpiSeries[kpi.id]} width={260} height={70} tone="cyan" live />
        </div>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-sec">{kpi.forecast}</p>
        <button className="btn btn-primary mt-6" onClick={() => setFocusMode(false)}>
          <EyeOff size={13} /> Exit focus
        </button>
      </div>
    </motion.div>
  )
}

function KpiDialOuter({ kpi }) {
  return (
    <div>
      <GoalDial value={kpi.value} goal={kpi.goal} inverse={kpi.inverse} size={120} stroke={9} label={kpi.label} />
      <p className="mt-2 text-xs text-tri">goal vs actual</p>
    </div>
  )
}