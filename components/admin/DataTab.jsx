'use client'

import { useMemo, useState } from 'react'
import { Calculator, Clock3, KeyRound, Webhook, GitCompare, Database, Play } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useAdminStore from '@/store/admin.store'
import { ENV_METRICS, SQL_TEMPLATES } from '@/lib/mock'
import { cn } from '@/lib/utils'

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

/* ---- Feature 56 · Custom metric builder ---- */
export function MetricBuilder() {
  const add = useDashboardStore((s) => s.addCustomKpi)
  const existing = useDashboardStore((s) => s.customKPIs)
  const [a, setA] = useState('Revenue')
  const [op, setOp] = useState('-')
  const [b, setB] = useState('Costs')
  const [name, setName] = useState('Gross margin')

  const compute = useMemo(() => {
    const m = { Revenue: 1284, Costs: 611, Users: 48.2, Churn: 3.6 }
    const x = m[a] ?? 0
    const y = m[b] ?? 0
    const val = op === '+' ? x + y : op === '-' ? x - y : op === '*' ? x * y : y ? x / y : 0
    return Math.round(val * 1000)
  }, [a, op, b])

  return (
    <Section icon={Calculator} title="Custom metric builder" hint="(Revenue - Cost) / Users — no code, renders as a KPI widget">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <select value={a} onChange={(e) => setA(e.target.value)} aria-label="Left operand" className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-sec outline-none">
          {['Revenue', 'Costs', 'Users', 'Churn'].map((f) => <option key={f}>{f}</option>)}
        </select>
        <span className="font-mono text-[12px] text-pri">{op === '-' && a === 'Revenue' && b === 'Costs' ? '−' : op}</span>
        <select value={op} onChange={(e) => setOp(e.target.value)} aria-label="Operator" className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 font-mono text-[10px] text-sec outline-none">
          {['+', '-', '*', '/'].map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={b} onChange={(e) => setB(e.target.value)} aria-label="Right operand" className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-sec outline-none">
          {['Revenue', 'Costs', 'Users', 'Churn'].map((f) => <option key={f}>{f}</option>)}
        </select>
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Metric name" className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
        <button className="btn btn-primary !py-1.5 text-[10px]" onClick={() => add({ label: name, value: compute, unit: op === '/' ? 'number' : 'currency', goal: Math.round(compute * 1.2), change: 3.1, trend: 'up', forecast: 'Custom formula metric — tracks above plan.' })}>Build</button>
      </div>
      <p className="mb-1 text-[10px] text-sec">preview: <span className="font-mono tabular text-pri">$ {compute.toLocaleString()}</span></p>
      {existing.length > 0 && (
        <div className="space-y-1">
          {existing.map((k) => (
            <div key={k.id} className="glass-soft flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px]">
              <span className="text-sec"><strong className="text-pri">{k.label}</strong> · now $ {k.value.toLocaleString()}</span>
              <button className="text-tri hover:text-pri" onClick={() => useDashboardStore.getState().removeCustomKpi(k.id)} aria-label="Remove metric">×</button>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

/* ---- Feature 46 · Data retention rules ---- */
export function RetentionRules() {
  const retention = useAdminStore((s) => s.retention)
  const setRetention = useAdminStore((s) => s.setRetention)
  return (
    <Section icon={Clock3} title="Data retention rules" hint="auto-purge · countdown to purge">
      <div className="space-y-1">
        {retention.map((r) => (
          <div key={r.id} className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
            <span className="w-32 truncate text-[10px] font-semibold text-pri">{r.table}</span>
            <input type="range" min={1} max={365} value={r.days} onChange={(e) => setRetention(r.id, Number(e.target.value))} aria-label={`Retention for ${r.table}`} className="h-1 flex-1" />
            <span className="w-24 tabular text-[10px] text-sec">{r.days}d · purge {r.nextPurge}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ---- Feature 57 · API key manager ---- */
export function ApiKeyManager() {
  const keys = useAdminStore((s) => s.apiKeys)
  const rotate = useAdminStore((s) => s.rotateKey)
  const revoke = useAdminStore((s) => s.revokeKey)
  return (
    <Section icon={KeyRound} title="API key manager" hint="generate · rotate · revoke with usage per key">
      <div className="space-y-1">
        {keys.map((k) => (
          <div key={k.id} className={cn('glass-soft flex items-center gap-2 rounded-xl px-3 py-2', k.revoked && 'opacity-50')}>
            <span className="w-32 truncate text-[10px] font-semibold text-pri">{k.name}</span>
            <span className="font-mono text-[9px] text-tri">ideon_••••{k.prefix.slice(-4)}</span>
            <span className="ml-auto w-20 text-right tabular text-[9px] text-tri">{k.calls.toLocaleString()} calls · {k.lastUsed}</span>
            <button className="btn !py-1 text-[9px]" disabled={k.revoked} onClick={() => rotate(k.id)}>Rotate</button>
            <button className="btn btn-danger !py-1 text-[9px]" disabled={k.revoked} onClick={() => revoke(k.id)}>Revoke</button>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ---- Feature 52 · Webhook tester ---- */
export function WebhookTester() {
  const webhooks = useAdminStore((s) => s.webhooks)
  const [url, setUrl] = useState(webhooks[0]?.url || 'https://hooks.slack.com/services/T…/B…/xx')
  const [status, setStatus] = useState(null)
  const [sending, setSending] = useState(false)
  return (
    <Section icon={Webhook} title="Webhook tester" hint="send a test payload, view raw response / error">
      <div className="mb-2 flex gap-1.5">
        <input value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Webhook URL" className="min-w-0 flex-1 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 font-mono text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
        <button className="btn btn-primary !py-1.5 text-[10px]" disabled={sending} onClick={() => {
          setSending(true)
          setTimeout(() => {
            setSending(false)
            setStatus(Math.random() > 0.25 ? { ok: true, ms: Math.round(80 + Math.random() * 220), body: '{"ok":true,"ts":1757132000}' } : { ok: false, body: 'HTTP 502 BAD GATEWAY', ms: 3200 })
          }, 900)
        }}>
          <Play size={11} /> {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
      {status && (
        <div className={cn('code-block rounded-xl p-2.5 font-mono text-[10px]', status.ok ? 'text-[var(--green)]' : 'text-[var(--red)]')}>
          {status.ok ? '✓ 200 OK' : '✗ failed'} · {status.ms}ms{'\n'}{status.body}
        </div>
      )}
    </Section>
  )
}

/* ---- Feature 51 · Environment sync compare ---- */
export function EnvSyncCompare() {
  const metrics = Object.entries(ENV_METRICS)
  return (
    <Section icon={GitCompare} title="Environment sync compare" hint="dev vs staging vs prod — spot drift">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px]">
          <thead><tr className="text-tri"><th className="py-1 pr-2">metric</th>{metrics.map(([e]) => <th key={e} className="px-2 py-1 capitalize">{e}</th>)}</tr></thead>
          <tbody>
            {['revenue', 'latency', 'errors', 'users'].map((m) => (
              <tr key={m} className="border-t border-[var(--stroke)]">
                <td className="py-1.5 pr-2 text-sec">{m}</td>
                {metrics.map(([, data]) => (
                  <td key={m} className={cn('px-2 py-1.5 tabular', m === 'latency' && data.latency > 400 ? 'text-[var(--red)]' : 'text-pri')}>{m === 'revenue' && data[m] > 1000 ? '$' : ''}{data[m].toLocaleString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-[9px] text-tri">{Object.keys(ENV_METRICS).length} environments · drift alert on latency & errors</p>
    </Section>
  )
}

/* ---- Feature 65 · Database query runner (read-only, sandboxed) ---- */
export function SqlConsole() {
  const [sql, setSql] = useState(SQL_TEMPLATES[0].sql)
  const [result, setResult] = useState(null)
  const run = () => {
    const rows = {
      'region': [['EU', 521], ['NA', 402], ['APAC', 268], ['LATAM', 62], ['MEA', 31]],
      'endpoint': [['/export', 401], ['/graph', 322], ['/tasks', 214], ['/auth', 148]],
      'role': [['Executive', 1], ['Sales', 9], ['Ops', 6], ['Analyst', 42], ['Dev', 31]],
    }
    const key = sql.includes('region') ? 'region' : sql.includes('endpoint') ? 'endpoint' : 'role'
    setResult({ rows: rows[key], ms: Math.round(8 + Math.random() * 60) })
    useDashboardStore.getState().logAction('Ran read-only SQL query')
  }
  return (
    <Section icon={Database} title="Read-only SQL console" hint="sandboxed, all queries SELECT · results render as a table">
      <textarea value={sql} onChange={(e) => setSql(e.target.value)} rows={3} spellCheck={false} aria-label="SQL query" className="code-block w-full resize-none rounded-xl p-2.5 font-mono text-[10px] outline-none" />
      <div className="mb-2 flex flex-wrap gap-1.5">
        {SQL_TEMPLATES.map((t) => <button key={t.label} className="btn btn-ghost !py-1 text-[9px]" onClick={() => setSql(t.sql)}>{t.label}</button>)}
        <button className="btn btn-primary ml-auto !py-1 text-[10px]" onClick={run}><Play size={11} /> Run</button>
      </div>
      {result && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px]">
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={i} className="border-t border-[var(--stroke)]">
                  {r.map((c, j) => <td key={j} className={cn('py-1 pr-3 tabular', j === 0 ? 'text-sec' : 'text-pri')}>{c.toLocaleString()}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-[9px] text-tri">{result.rows.length} rows · {result.ms}ms</p>
        </div>
      )}
    </Section>
  )
}