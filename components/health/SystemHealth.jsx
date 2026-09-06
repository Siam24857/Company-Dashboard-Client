'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, MemoryStick, Globe, Activity, AlertTriangle, Layers, History, ChevronDown } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip, XAxis, CartesianGrid } from 'recharts'
import useLiveStore from '@/store/live.store'
import { errorGroups, jobs, healthSeries } from '@/lib/mock'
import { cn } from '@/lib/utils'
import LazyMount from '@/hooks/useInView'
import Skeleton from '@/components/ui/Skeleton'
import ToneChip from '@/components/ui/ToneChip'

/** Module 7 — System Health & Performance */
export default function SystemHealth() {
  return (
    <LazyMount fallback={<HealthSkeleton />}>
      <section className="card-3d flex h-full flex-col overflow-hidden" aria-label="System health">
        <header className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="tone-success tone-soft grid h-7 w-7 place-items-center rounded-lg">
              <Activity size={14} />
            </span>
            <h2 className="font-display text-sm font-semibold text-pri">System Health</h2>
          </div>
          <span className="chip tone-success tone-soft"><span className="live-dot" aria-hidden="true" /> all systems nominal</span>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-3 p-5 [min-height:400px] lg:grid-cols-2">
          <ResourceMonitors />
          <LatencyPanel />
          <ErrorAggregator />
          <JobQueue />
        </div>
      </section>
    </LazyMount>
  )
}

function ResourceMonitors() {
  const meta = [
    { icon: Cpu, label: 'CPU', base: 46, tone: 'cyan', unit: '%' },
    { icon: MemoryStick, label: 'Memory', base: 62, tone: 'warn', unit: '%' },
    { icon: Globe, label: 'Network', base: 71, tone: 'success', unit: 'Mbps' },
  ]
  const [vals, setVals] = useState([46, 62, 71])
  useEffect(() => {
    const t = setInterval(() => {
      setVals((v) => [
        Math.min(99, Math.max(4, v[0] + (Math.random() - 0.5) * 10)),
        Math.min(99, Math.max(4, v[1] + (Math.random() - 0.5) * 4)),
        Math.min(99, Math.max(4, v[2] + (Math.random() - 0.5) * 14)),
      ])
    }, 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="glass-soft rounded-2xl p-3.5">
      <p className="mb-3 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-tri">
        <Activity size={11} /> Live resource monitor
      </p>
      <div className="grid grid-cols-3 gap-2">
        {meta.map((m, i) => (
          <div key={m.label} className="rounded-xl p-2" style={{ background: 'var(--glass)' }}>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-sec">
              <m.icon size={11} /> {m.label}
            </div>
            <div className="mt-1 font-display text-lg font-semibold tabular text-pri">
              {vals[i].toFixed(0)}<span className="text-[10px] text-tri">{m.unit}</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--text-2) 20%, transparent)' }}>
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${vals[i]}%` }}
                style={{ background: vals[i] > 85 ? 'var(--red)' : 'var(--green)' }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LatencyPanel() {
  const latencyHistory = useLiveStore((s) => s.latencyHistory)
  const latencyMs = useLiveStore((s) => s.latencyMs)
  const data = latencyHistory.map((d, i) => ({ t: i, ms: d.v }))
  return (
    <div className="glass-soft rounded-2xl p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-tri">
          <History size={11} /> API latency tracker
        </p>
        <span className={cn('chip tabular', latencyMs > 45 ? 'tone-warn tone-soft' : 'tone-success tone-soft')}>
          {latencyMs} ms
        </span>
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="var(--stroke)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis hide domain={[0, 90]} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div className="glass-strong rounded-lg px-2 py-1 text-[10px] tabular">{payload[0].payload.ms} ms</div>
            ) : null} />
            <Line type="monotone" dataKey="ms" stroke="var(--cyan)" strokeWidth={1.8} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ErrorAggregator() {
  const [open, setOpen] = useState(0)
  return (
    <div className="glass-soft rounded-2xl p-3.5">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-tri">
        <AlertTriangle size={11} /> Error aggregator · grouped
      </p>
      <div className="space-y-1.5">
        {errorGroups.map((e, i) => (
          <div key={e.id} className={cn('rounded-xl px-2.5 py-2', i === open && 'tone-faint')} onClick={() => setOpen(open === i ? -1 : i)} role="button" tabIndex={0} onKeyDown={(ev) => ev.key === 'Enter' && setOpen(open === i ? -1 : i)}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', `tone-${e.severity === 'critical' ? 'critical' : e.severity === 'warn' ? 'warn' : 'info'}`, 'tone-text')} />
                <span className="truncate font-mono text-[11px] text-pri">{e.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={cn('tabular text-xs font-semibold', e.trend === 'up' ? 'tone-critical tone-text' : e.trend === 'down' ? 'tone-success tone-text' : 'text-tri')}>
                  {e.trend === 'up' ? '▲' : e.trend === 'down' ? '▼' : '■'} {e.count.toLocaleString()}
                </span>
                <ChevronDown size={12} className={cn('text-tri transition-transform', i === open && 'rotate-180')} />
              </div>
            </div>
            {i === open && (
              <p className="mt-1.5 pl-3 text-[10px] leading-relaxed text-tri">
                First seen {e.first} · service <span className="font-mono">{e.service}</span> · deduplicated into a single group for triage. Retry seems to clear the burst.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function JobQueue() {
  return (
    <div className="glass-soft rounded-2xl p-3.5">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-tri">
        <Layers size={11} /> Background job queue
      </p>
      <div className="space-y-2">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-xl px-2.5 py-2" style={{ background: 'var(--glass)' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', j.status === 'done' ? 'tone-success tone-text' : j.status === 'running' ? 'tone-cyan tone-text' : 'tone-warn tone-text')} />
                <span className="truncate font-mono text-[11px] text-pri">{j.name}</span>
              </span>
              <span className="tabular text-[10px] text-tri">{j.eta}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--text-2) 18%, transparent)' }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={j.status === 'done' ? { width: '100%' } : j.status === 'running' ? { width: ['68%', '72%', '70%', '74%'] } : { width: '0%' }}
                  style={{ background: j.status === 'done' ? 'var(--green)' : j.status === 'running' ? 'var(--cyan)' : 'var(--yellow)' }}
                  transition={j.status === 'running' ? { repeat: Infinity, duration: 4 } : { duration: 0.8 }}
                />
              </div>
              <span className="w-10 text-right tabular text-[10px] text-tri">{j.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HealthSkeleton() {
  return (
    <section className="card-3d flex h-full flex-col p-5" aria-hidden="true">
      <Skeleton className="h-8 w-44" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </section>
  )
}