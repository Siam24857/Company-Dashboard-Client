'use client'

import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Download, FileText, Layers, Sparkles, ChevronRight, ToggleLeft, ToggleRight, Play } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import { quarterly, quarterlyPrev } from '@/lib/mock'
import { cn, downloadCSV, exportPDF, windowPoints } from '@/lib/utils'
import ToneChip from '@/components/ui/ToneChip'
import Sparkline from '@/components/kpi/Sparkline'
import { SafeSection } from '@/hooks/useInView'

const CHART_TYPES = ['auto', 'line', 'bar', 'area', 'pie']

const palette = ['var(--green)', 'var(--red)', 'var(--violet)', 'var(--cyan)', 'var(--yellow)']

function GlassTooltip({ active, payload, label, type }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong pointer-events-none rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-pri">{label || ''}</p>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey || p.name} className="flex items-center gap-2 text-sec" style={{ color: 'var(--text-1)' }}>
            <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
            <span>{p.name}:</span>
            <span className="tabular text-pri">
              {type === 'currency' ? `$${Number(p.value).toLocaleString()}` : Number(p.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const DRILL_DOWN = {
  Revenue: [
    { k: 'EU', v: 521 },
    { k: 'NA', v: 402 },
    { k: 'APAC', v: 268 },
    { k: 'LATAM', v: 62 },
    { k: 'MEA', v: 31 },
  ],
  Costs: [
    { k: 'Infra', v: 288 },
    { k: 'Payroll', v: 276 },
    { k: 'Acquisition', v: 142 },
    { k: 'Tooling', v: 77 },
  ],
  Profit: [
    { k: 'Net margin', v: 501 },
    { k: 'EBITDA', v: 466 },
    { k: 'FCF', v: 389 },
  ],
}

/** Main analytics canvas: snapshot chart w/ smart suggestion, comparative mode, drill-down. */
export default function MainChart({ startingSpec }) {
  const visual = useDashboardStore((s) => s.visual)
  const send = useDashboardStore.getState
  const timeWindow = useDashboardStore((s) => s.timeWindow)
  const replay = useDashboardStore((s) => s.replay)
  const ghostOn = useDashboardStore((s) => s.ghost)
  const ghostDays = useDashboardStore((s) => s.ghostDays)
  const [typeIdx, setTypeIdx] = useState(0)
  const [compare, setCompare] = useState(true)
  const [drill, setDrill] = useState([])
  const [unit] = useState('currency')

  const spec = visual || startingSpec
  const activeType = CHART_TYPES[typeIdx]

  const chartType = useMemo(() => {
    if (activeType !== 'auto') return activeType
    return spec?.type && spec.type !== 'bar' ? spec.type : 'composed'
  }, [activeType, spec])

  const pointCap = windowPoints(timeWindow)

  const shapeData = useMemo(() => {
    const labels = drill.length
      ? drill[drill.length - 1].data.map((d) => d.k)
      : spec?.labels || quarterly.labels
    if (drill.length) {
      return drill[drill.length - 1].data.map((d) => ({ name: d.k, value: d.v }))
    }
    const ds = spec?.datasets || [
      { name: 'Revenue', key: 'revenue', data: quarterly.revenue.map((v) => v * 1000), color: palette[0] },
      { name: 'Costs', key: 'costs', data: quarterly.costs.map((v) => v * 1000), color: palette[1] },
    ]
    const replayScale = replay && replay.index > 0 ? 1 + (replay.index / (replay.max || 1)) * 0.3 : 1
    return labels.map((l, i) => {
      const row = { name: l }
      ds.forEach((d) => {
        row[d.name] = Math.round((d.data[i] || 0) * replayScale)
      })
      return row
    }).slice(-pointCap)
  }, [drill, spec, replay, pointCap])

  const compareRows = useMemo(() => {
    if (!compare || drill.length) return []
    const labels = spec?.labels || quarterly.labels
    const revenue = spec?.datasets?.find((d) => d.key === 'revenue') || { data: quarterly.revenue.map((v) => v * 1000) }
    return labels.map((l, i) => ({ name: l, prev: Math.round((quarterlyPrev.revenue[i] || 0) * 1000), dim: '#prev' })).slice(-pointCap)
  }, [compare, drill, spec, pointCap])

  const ghostRows = useMemo(() => {
    if (!ghostOn || drill.length) return []
    const labels = spec?.labels || quarterly.labels
    const ghostMult = 1 + ghostDays * 0.002
    return labels.map((l, i) => ({ name: l, ghost: Math.round((quarterlyPrev.revenue[i] || 0) * 1000 * ghostMult), dim: '#ghost' })).slice(-pointCap)
  }, [ghostOn, ghostDays, drill, spec, pointCap])

  const S = spec?.datasets?.find((d) => d.key === 'revenue')?.data || quarterly.revenue.map((v) => v * 1000)
  const trend = useMemo(() => S.slice(-30), [S])

  const handleBarClick = (entry) => {
    if (!entry?.name) return
    const bucket = DRILL_DOWN[entry.name]
    if (!bucket) return
    setDrill((d) => [...d, { label: entry.name, data: bucket }])
    send().logAction(`Drilled into ${entry.name} ${drill.length} levels deep`)
  }

  const totalDatasets = spec?.datasets?.length || 2

  const renderPie = () => {
    const ds = spec?.datasets?.[0]?.data || quarterly.revenue.map((v) => v * 1000)
    const data = (drill.length ? drill[drill.length - 1].data : spec?.labels.map((l, i) => ({ name: l, value: ds[i] }))) || []
    return (
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={92} paddingAngle={3} onClick={(e) => drill.length < 1 && handleBarClick({ name: e.name })}>
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<GlassTooltip type={unit} />} />
      </PieChart>
    )
  }

  const renderMain = () => {
    switch (chartType) {
      case 'pie':
        return renderPie()
      case 'line':
        return (
          <ComposedChart data={shapeData}>
            <CartesianGrid stroke="var(--stroke)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<GlassTooltip type={unit} />} />
            <Line type="monotone" dataKey="Revenue" stroke="var(--green)" strokeWidth={2.2} dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="Costs" stroke="var(--red)" strokeWidth={2.2} dot={false} activeDot={{ r: 5 }} />
          </ComposedChart>
        )
      case 'area':
        return (
          <ComposedChart data={shapeData}>
            <defs>
              <linearGradient id="cfa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--green)" stopOpacity={0.34} />
                <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--stroke)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<GlassTooltip type={unit} />} />
            <Area type="monotone" dataKey="Revenue" stroke="var(--green)" strokeWidth={2} fill="url(#cfa)" />
            <Area type="monotone" dataKey="Costs" stroke="var(--red)" strokeWidth={1.5} fill="transparent" />
          </ComposedChart>
        )
      default:
        return (
          <ComposedChart data={shapeData}>
            <CartesianGrid stroke="var(--stroke)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<GlassTooltip type={unit} />} />
            {totalDatasets > 1 ? (
              <>
                <Bar dataKey="Revenue" fill="var(--green)" radius={[6, 6, 0, 0]} maxBarSize={42} onClick={(entry) => handleBarClick(entry)} cursor="pointer" />
                <Bar dataKey="Costs" fill="var(--red)" radius={[6, 6, 0, 0]} maxBarSize={42} onClick={(entry) => handleBarClick(entry)} cursor="pointer" />
              </>
            ) : (
              <Bar dataKey={spec?.datasets?.[0]?.name || 'value'} fill="var(--cyan)" radius={[6, 6, 0, 0]} maxBarSize={42} onClick={(entry) => handleBarClick(entry)} cursor="pointer" />
            )}
            {compareRows.map((row) => (
              <Line key={row.name} type="monotone" dataKey="prev" data={compareRows} name="Prev period" stroke="var(--violet)" strokeWidth={1.6} strokeDasharray="5 4" dot={false} />
            ))}
            {ghostRows.map((row) => (
              <Line key={`g${row.name}`} type="monotone" dataKey="ghost" data={ghostRows} name="Ghost compare" stroke="var(--ghost)" strokeWidth={1.8} strokeDasharray="2 6" dot={false} />
            ))}
            {drill.length > 0 && <ReferenceLine y={150} stroke="var(--cyan)" strokeDasharray="4 4" />}
          </ComposedChart>
        )
    }
  }

  return (
    <SafeSection>
      <div className="flex h-full flex-col">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-semibold text-pri">{spec?.title || 'Revenue vs Costs'}</h2>
              {spec?.suggested && (
                <ToneChip tone="ai" dot>
                  <Sparkles size={11} /> AI suggested
                </ToneChip>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-tri">
              {drill.length === 0 ? (
                <span className="flex items-center gap-1"><Layers size={11} /> All channels · 6 months</span>
              ) : (
                <span className="flex flex-wrap items-center gap-1">
                  <button className="underline-offset-2 hover:underline" onClick={() => { setDrill([]); send().logAction('Breadcrumb: all channels') }}>All</button>
                  {drill.map((d, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <ChevronRight size={10} />
                      <button
                        className="underline-offset-2 hover:underline"
                        onClick={() => { setDrill(drill.slice(0, i + 1)); send().logAction(`Breadcrumb: ${d.label}`) }}
                      >
                        {d.label}
                      </button>
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className={cn('btn', compare ? 'btn-tonal tone-cyan' : '')} onClick={() => { setCompare(!compare); send().logAction('Toggled comparative analysis') }}>
              {compare ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
              <span className="hidden sm:inline">Compare prev</span>
            </button>
            <button className="btn" onClick={() => { downloadCSV('command-center-chart.csv', [[ 'label', ...(spec?.datasets||[]).map(d=>d.name) ], ...shapeData.map(r => [r.name, ...(spec?.datasets||[]).map(d=>r[d.name]||0)])]); send().logAction('Exported chart CSV') }} aria-label="Export CSV">
              <Download size={13} />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button className="btn" onClick={() => { exportPDF(); send().logAction('Exported chart PDF') }} aria-label="Export PDF">
              <FileText size={13} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* chart type tabs */}
        <div className="mt-3 flex items-center gap-1.5" role="tablist" aria-label="Chart type">
          {CHART_TYPES.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={typeIdx === CHART_TYPES.indexOf(t)}
              onClick={() => setTypeIdx(CHART_TYPES.indexOf(t))}
              className={cn('rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors', CHART_TYPES.indexOf(t) === typeIdx ? 'tone-soft tone-text' : 'text-tri hover:text-sec')}
            >
              {t === 'auto' ? (
                <span className="flex items-center gap-1"><Sparkles size={10} /> Auto</span>
              ) : t}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-tri">
            <RefreshCw size={11} className={cn('animate-[spin-slow]', false)} style={{ animation: 'spin-slow 1.6s linear infinite' }} />
            streaming · 30s window
          </span>
        </div>

        {/* canvas */}
        <div
          className="relative mt-2 min-h-[300px] flex-1 lg:min-h-[320px]"
          onMouseMove={(e) => {
            if (!window.__holoActive) window.__holoActive = true
            const top = shapeData.slice(-1)[0]
            if (top && Math.random() < 0.35) {
              const label = spec?.datasets?.[0]?.name || 'Revenue'
              window.dispatchEvent(
                new CustomEvent('cc-holo', {
                  detail: { label, value: (top[label] || top.value || 0).toLocaleString(), x: e.clientX, y: e.clientY },
                })
              )
            }
          }}
        >
          {replay?.index > 0 && (
            <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full bg-[var(--violet)]/15 px-3 py-1 font-mono text-[10px] tracking-widest text-[var(--violet)]" aria-hidden="true">
              <Play size={9} className="mr-1 inline" /> REPLAY · frame {replay.index}/{replay.max}
            </div>
          )}
          {compare && !drill.length && (
            <div className="data-field pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          )}
          <ResponsiveContainer width="100%" height="100%">
            {renderMain()}
          </ResponsiveContainer>
          <AnimatePresence mode="wait">
            <motion.div
              key="legend"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute bottom-1 left-2 flex gap-3 text-[10px] text-tri"
            >
              {spec?.datasets?.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} /> {d.name}
                </span>
              ))}
              {compare && !drill.length && (
                <span className="flex items-center gap-1">
                  <span className="h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: 'var(--violet)' }} /> Prev period
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <Sparkline data={trend} width={110} height={28} tone="green" />
            <span className="text-[11px] text-tri">6mo momentum ▴</span>
          </div>
          {drill.length > 0 && (
            <button className="btn btn-ghost text-[11px] text-tri hover:text-sec" onClick={() => setDrill([])}>
              <RefreshCw size={11} /> Reset drill-down
            </button>
          )}
        </div>
      </div>
    </SafeSection>
  )
}