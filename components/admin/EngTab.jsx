'use client'

import { useState } from 'react'
import { BarChart2, Clock, Gauge, Upload, DatabaseZap, Bug, Rocket, ThumbsUp, Hammer } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useAdminStore from '@/store/admin.store'
import { errorGroups } from '@/lib/mock'
import { cn } from '@/lib/utils'
import ToneChip from '@/components/ui/ToneChip'

function Section({ icon: Icon, title, hint, children }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={13} className="tone-cyan tone-text" />
        <p className="font-display text-[11px] font-semibold text-pri">{title}</p>
        <span className="text-[9px] text-tri">{hint}</span>
      </div>
      {children}
    </div>
  )
}

/* ---- Feature 45 · Usage analytics (what to deprecate) ---- */
export function UsageAnalytics() {
  const usage = useDashboardStore((s) => s.usage)
  const top = (sig) => Object.entries(sig).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const items = top(usage.clicks)
  const max = Math.max(1, ...items.map(([, v]) => v))
  return (
    <Section icon={BarChart2} title="Usage analytics" hint="widget interactions — deprecation signal">
      {items.length ? (
        <div className="space-y-1.5">
          {items.map(([w, v]) => (
            <div key={w} className="flex items-center gap-2">
              <span className="w-32 truncate text-[10px] text-sec">{w}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-2)]">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--cyan)]" style={{ width: `${(v / max) * 100}%` }} />
              </div>
              <span className="w-8 text-right tabular text-[10px] text-pri">{v}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] italic text-tri">no interactions tracked yet — click some widgets</p>
      )}
    </Section>
  )
}

/* ---- Feature 62 · Scheduled jobs monitor ---- */
export function ScheduledJobs() {
  const jobs = useAdminStore((s) => s.jobs)
  const log = useDashboardStore((s) => s.logAction)
  const [at, setAt] = useState({})
  return (
    <Section icon={Clock} title="Scheduled jobs monitor" hint="last run · next run · manual trigger">
      <div className="space-y-1">
        {jobs.map((j) => (
          <div key={j.id} className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
            <span className={cn('h-2 w-2 rounded-full', j.ok ? 'bg-[var(--green)]' : 'bg-[var(--yellow)]')} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold text-pri">{j.name} <span className="font-mono text-[9px] text-tri">{j.cron}</span></p>
              <p className="text-[9px] text-tri">last {j.last} · next {j.next}</p>
            </div>
            <span className="true" />
            <button className="btn !py-1 text-[9px]" onClick={() => { setAt((s) => ({ ...s, [j.id]: true })); setTimeout(() => setAt((s) => ({ ...s, [j.id]: false })), 800); logAction(`Triggered cron: ${j.name}`) }}>
              {at[j.id] ? <Hammer size={10} /> : 'Trigger'}
            </button>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ---- Feature 64 · Rate limit controller ---- */
export function RateLimits() {
  const limits = useAdminStore((s) => s.rateLimits)
  const setLimit = useAdminStore((s) => s.setLimit)
  return (
    <Section icon={Gauge} title="Rate limit controller" hint="per-endpoint limits + real-time throttle logs">
      <div className="space-y-1">
        {limits.map((r) => (
          <div key={r.id} className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
            <span className="w-32 truncate font-mono text-[9px] text-sec">{r.endpoint}</span>
            <input type="range" min={10} max={1000} step={10} value={r.perMin} onChange={(e) => setLimit(r.id, Number(e.target.value))} aria-label={`Rate limit ${r.endpoint}`} className="h-1 flex-1" />
            <span className="w-16 tabular text-[10px] text-pri">{r.perMin}/min</span>
            <span className="text-[9px] text-tri">{r.logs} throttled</span>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ---- Feature 47 · Bulk user invite CSV ---- */
export function BulkInvite() {
  const [text, setText] = useState('john.doe@ideon.co, Sales Manager, NA\njane.roe@ideon.co, Developer, EU\n')
  const [done, setDone] = useState(false)
  const parse = () => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    setDone(lines.length)
    useDashboardStore.getState().logAction(`Bulk invited ${lines.length} users by CSV`)
  }
  return (
    <Section icon={Upload} title="Bulk user invite + role" hint="paste a CSV: email, role, team — 100+ users at once">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} spellCheck={false} aria-label="CSV invites" className="code-block w-full resize-none rounded-xl p-2.5 font-mono text-[10px] outline-none" />
      <div className="flex items-center justify-between">
        <span className={done ? 'text-[10px] text-[var(--green)]' : 'text-[10px] text-tri'}>{done ? `✓ ${done} invites queued with roles & teams` : 'format: email, role, team'}</span>
        <button className="btn btn-primary !py-1 text-[10px]" onClick={parse}>Invite</button>
      </div>
    </Section>
  )
}

/* ---- Feature 58 · Full data export / import ---- */
export function DataTransfer() {
  const [pct, setPct] = useState(0)
  const [busy, setBusy] = useState(null)
  const go = (kind) => {
    setBusy(kind)
    setPct(0)
    const t = setInterval(() => setPct((p) => {
      if (p >= 100) { clearInterval(t); setTimeout(() => { setBusy(null); setPct(0) }, 400); return 100 }
      return p + 11
    }), 160)
    if (kind === 'export') setTimeout(() => {
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), revenue: 1284000, users: 48213 }, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'ideon-backup-sanitized.json'
      a.click()
      URL.revokeObjectURL(a.href)
    }, 2600)
    useDashboardStore.getState().logAction(`Started sanitised ${kind} (${kind === 'export' ? 'full DB export' : 'backup import'})`)
  }
  return (
    <Section icon={DatabaseZap} title="Data import / export (full)" hint="one-click sanitised DB export or backup import">
      <div className="flex items-center gap-2">
        <button className="btn max-w-auto flex-1 !py-2 text-[11px]" onClick={() => go('export')} disabled={!!busy}>Export database</button>
        <button className="btn max-w-auto flex-1 !py-2 text-[11px]" onClick={() => go('import')} disabled={!!busy}>Import backup</button>
      </div>
      {busy && (
        <div className="mt-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-2)]">
            <div className="h-full bg-[var(--cyan)] transition-[width] duration-150" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-center tabular text-[9px] text-tri">{busy}… {pct}%</p>
        </div>
      )}
    </Section>
  )
}

/* ---- Feature 59 · Error dashboard ---- */
export function ErrorDash() {
  const groups = errorGroups.slice(0, 6)
  return (
    <Section icon={Bug} title="Error dashboard" hint="client-side JS & API 4xx/5xx grouped by browser/version">
      <div className="space-y-1">
        {groups.map((g, i) => (
          <div key={i} className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
            <span className={cn('h-2 w-2 shrink-0 rounded-full', g.severity === 'critical' ? 'bg-[var(--red)]' : 'bg-[var(--yellow)]')} />
            <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-sec">{g.name}</span>
            <span className="text-[9px] text-tri">@{g.service} · {g.first}</span>
            <span className="tabular text-[10px] font-semibold text-pri">{g.count}</span>
            <ToneChip tone={g.severity === 'critical' ? 'critical' : g.severity === 'warn' ? 'warn' : 'info'} className="text-[9px]">{g.severity}</ToneChip>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ---- Feature 67 · Upgrade simulator ---- */
export function UpgradeSim() {
  const [mode, setMode] = useState(false)
  const speed = mode ? 1.22 : 1
  const p99 = mode ? 174 : 214
  return (
    <Section icon={Rocket} title="Upgrade simulator" hint="test the new build in a sandbox before prod push">
      <div className="glass-soft flex items-center gap-3 rounded-xl px-3 py-2.5">
        <button className={cn('btn', mode && 'btn-primary')} onClick={() => setMode(!mode)}>{mode ? 'Sandbox active' : 'Preview v2.5.0'}</button>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[9px] text-tri"><span>latency p99</span><span className="tabular text-pri">{p99}ms {mode && <span className="text-[var(--green)]">−19%</span>}</span></div>
          <div className="flex justify-between text-[9px] text-tri"><span>throughput</span><span className="tabular text-pri">×{speed.toFixed(2)}</span></div>
        </div>
      </div>
    </Section>
  )
}

/* ---- Feature 63 · User feedback aggregator ---- */
export function FeedbackAggr() {
  const feedback = useAdminStore((s) => s.feedback)
  const seed = [
    { id: 'f1', text: 'Love the ghost compare — hours saved.', sentiment: 'positive' },
    { id: 'f2', text: 'Replay mode is confusing in prod.', sentiment: 'negative' },
    { id: 'f3', text: 'Need dark on the board page too.', sentiment: 'neutral' },
  ]
  const list = [...feedback, ...seed].slice(0, 8)
  const tone = { positive: 'success', neutral: 'info', negative: 'critical' }
  return (
    <Section icon={ThumbsUp} title="Feedback aggregator" hint="sentiment-tagged in-app feedback">
      <div className="space-y-1">
        {list.map((f) => (
          <div key={f.id} className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-[10px] text-sec">{f.text}</span>
            <ToneChip tone={tone[f.sentiment]} className="text-[9px]">{f.sentiment}</ToneChip>
          </div>
        ))}
      </div>
    </Section>
  )
}