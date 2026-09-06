'use client'

import { useState } from 'react'
import { ShieldAlert, Users, Ban, Fingerprint, Palette, Code2, Briefcase, Siren, Activity, Replace, FileCheck2 } from 'lucide-react'
import useAdminStore from '@/store/admin.store'
import useTeamStore from '@/store/team.store'
import useDashboardStore from '@/store/dashboard.store'
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

/* ---- Feature 68 · Maintenance mode ---- */
export function Maintenance() {
  const maintenance = useAdminStore((s) => s.maintenance)
  const eta = useAdminStore((s) => s.maintenanceEta)
  const set = useAdminStore((s) => s.setMaintenance)
  const setEta = useAdminStore((s) => s.setMaintenanceEta)
  return (
    <Section icon={ShieldAlert} title="Maintenance mode" hint="read-only for everyone except you, with ETA banner">
      <div className="glass-soft flex items-center gap-3 rounded-xl px-3 py-2.5">
        <label className="switch">
          <input type="checkbox" checked={maintenance} onChange={(e) => set(e.target.checked)} aria-label="Toggle maintenance mode" />
          <span />
        </label>
        <span className="flex-1 text-[10px] text-sec">{maintenance ? 'Maintenance active — users see read-only banner' : 'Off — all users have full access'}</span>
        <input value={eta} onChange={(e) => setEta(e.target.value)} aria-label="ETA" className="w-24 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
      </div>
    </Section>
  )
}

/* ---- Feature 48 · Session terminator ---- */
export function SessionTerminator() {
  const users = useTeamStore((s) => s.users)
  const removeUser = useTeamStore((s) => s.removeUser)
  const [gone, setGone] = useState({})
  return (
    <Section icon={Users} title="Session terminator" hint="kick users out and log it in the audit trail">
      <div className="flex flex-wrap gap-1.5">
        {users.filter((u) => u.id !== 'u_ava').map((u) => (
          <button key={u.id} className={cn('chip', gone[u.id] ? 'tone-success tone-soft' : 'tone-warn tone-soft')} onClick={() => { removeUser(u.id); setGone((g) => ({ ...g, [u.id]: true })); useDashboardStore.getState().logAction(`Terminated session: ${u.name}`) }}>
            {gone[u.id] ? 'kicked ✓' : `× ${u.name}`}
          </button>
        ))}
      </div>
    </Section>
  )
}

/* ---- Feature 50 · IP allow/deny rules ---- */
export function IpRules() {
  const rules = useAdminStore((s) => s.ipRules)
  const setIp = useAdminStore((s) => s.setIp)
  const toggle = (id) => setIp(rules.map((r) => (r.id === id ? { ...r, allow: !r.allow } : r)))
  const add = () => setIp([...rules, { id: `ip_${Date.now()}`, ip: '10.0.0.0/16', note: 'office vpn', allow: true }])
  return (
    <Section icon={Ban} title="IP allow / deny rules" hint="geo & range rules, live enforcement toggle">
      <div className="space-y-1">
        {rules.map((r) => (
          <div key={r.id} className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
            <span className="w-32 truncate font-mono text-[10px] text-pri">{r.ip}</span>
            <span className="flex-1 truncate text-[9px] text-tri">{r.note}</span>
            <span className={cn('rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase', r.allow ? 'bg-[var(--green)]/15 text-[var(--green)]' : 'bg-[var(--red)]/15 text-[var(--red)]')}>{r.allow ? 'allow' : 'deny'}</span>
            <button className="btn !py-1 text-[9px]" onClick={() => toggle(r.id)}>{r.allow ? '→ deny' : '→ allow'}</button>
          </div>
        ))}
      </div>
      <button className="btn mt-1.5 !py-1 text-[10px]" onClick={add}>+ add rule</button>
    </Section>
  )
}

/* ---- Feature 44 · SSO / OIDC ---- */
export function SsoConfig() {
  const sso = useAdminStore((s) => s.sso)
  const set = useAdminStore((s) => s.setSso)
  const field = (k, label) => (
    <input key={k} value={sso[k]} onChange={(e) => set({ [k]: e.target.value })} aria-label={label} placeholder={label}
      className="min-w-0 flex-1 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
  )
  return (
    <Section icon={Fingerprint} title="SSO / OIDC connector" hint="Domain-verified auth for the whole company">
      <div className="flex flex-wrap items-center gap-1.5">
        <select value={sso.provider} onChange={(e) => set({ provider: e.target.value })} aria-label="Provider" className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-sec outline-none">
          {['azure', 'google', 'okta', 'ping', 'custom-oidc'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {field('tenantId', 'Tenant ID')}
        {field('clientId', 'Client ID')}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[9px] text-tri">entity: {sso.entityId} · cert {sso.certThumbprint}</span>
        <ToneChip tone="success" className="ml-auto text-[9px]">● domain verified</ToneChip>
      </div>
    </Section>
  )
}

/* ---- Feature 60 · White-label ---- */
export function WhiteLabel() {
  const wl = useAdminStore((s) => s.whiteLabel)
  const set = useAdminStore((s) => s.setWhiteLabel)
  const field = (k, label) => (
    <div key={k} className="flex-1">
      <p className="mb-1 text-[9px] text-tri">{label}</p>
      <input value={wl[k]} onChange={(e) => set({ [k]: e.target.value })} aria-label={label}
        className="w-full rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
    </div>
  )
  return (
    <Section icon={Palette} title="White-label branding" hint="rename, restyle, re-skin or re-brand for your clients">
      <div className="flex flex-wrap gap-2">
        {field('name', 'Product name')}
        {field('footer', 'Footer text')}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <input type="color" value={wl.theme || '#00d4ff'} onChange={(e) => set({ theme: e.target.value })} aria-label="Brand accent" className="h-8 w-12 bg-transparent" />
        <span className="text-[10px] text-sec">accent → </span>
        <span className="tone-cyan tone-soft tone-text rounded-lg px-2 py-1 text-[10px] font-bold uppercase">{wl.name} live badge</span>
      </div>
    </Section>
  )
}

/* ---- Feature 61 · Global CSS for admins ---- */
export function GlobalCss() {
  const css = useAdminStore((s) => s.globalCss)
  const set = useAdminStore((s) => s.setGlobalCss)
  return (
    <Section icon={Code2} title="Global CSS (all users)" hint="theme overrides pushed fleet-wide — instant, no deploy">
      <textarea
        value={css}
        onChange={(e) => set(e.target.value)}
        rows={4}
        spellCheck={false}
        aria-label="Global CSS"
        placeholder={'/* .card-3d { background: #020409; } */'}
        className="code-block w-full resize-none rounded-xl p-2.5 font-mono text-[10px] outline-none focus:border-[var(--cyan)]"
      />
    </Section>
  )
}

/* ---- Feature 66 · Seat management ---- */
export function SeatManagement() {
  const licenses = useAdminStore((s) => s.licenses)
  const revoke = useAdminStore((s) => s.revokeLicense)
  const pct = Math.round((licenses.used / licenses.total) * 100)
  return (
    <Section icon={Briefcase} title="Licenses & seat management" hint="bulk assign, release unused seats">
      <div className="glass-soft flex items-center gap-3 rounded-xl px-3 py-2.5">
        <div className="flex flex-1 items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-2)]">
            <div className="h-full bg-gradient-to-r from-[var(--violet)] to-[var(--cyan)]" style={{ width: `${pct}%` }} />
          </div>
          <span className="tabular text-[10px] text-pri">{licenses.used}/{licenses.total}</span>
        </div>
        <span className="text-[9px] text-tri">sync {licenses.lastSync}</span>
      </div>
      <div className="mt-1 space-y-1">
        {licenses.users.slice(0, 3).map((u) => (
          <div key={u.email} className="glass-soft flex items-center gap-2 rounded-xl px-3 py-1.5">
            <span className="flex-1 truncate text-[10px] text-sec">{u.email}</span>
            <span className="text-[9px] text-tri">{u.lastActive}</span>
            <button className="text-tri hover:text-pri" onClick={() => revoke(u.email)} aria-label={`Revoke seat ${u.email}`}>×</button>
          </div>
        ))}
        {licenses.users.length > 3 && <p className="text-[9px] italic text-tri">+ {licenses.users.length - 3} more users…</p>}
      </div>
    </Section>
  )
}

/* ---- Feature 70 · Emergency kill switch ---- */
export function EmergencyShutdown() {
  const emergency = useAdminStore((s) => s.emergency)
  const set = useAdminStore((s) => s.setEmergency)
  return (
    <Section icon={Siren} title="Emergency kill switch" hint="block all third-party access instantly, document it">
      <div className="glass-soft flex items-center gap-3 rounded-xl px-3 py-2.5">
        <button
          className={cn('btn !px-4', emergency ? 'btn-primary' : 'btn-danger')}
          onClick={() => {
            set(!emergency)
            useDashboardStore.getState().pushHun({
              id: 'emergency' + Date.now(),
              level: 'critical',
              title: emergency ? 'Emergency mode DISABLED' : 'EMERGENCY MODE ARMED',
              body: emergency ? 'Third-party access restored.' : 'All external/logic connectors locked.\nMaintenance window opened, incident logged.',
            })
          }}
        >
          {emergency ? '· LIVE · disarm' : 'ARM'}
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-pri">{emergency ? 'EMERGENCY MODE ACTIVE' : 'Sector nominal'}</p>
          <p className="text-[9px] text-tri">{emergency ? 'external access blocked · live kill switch engaged' : 'armed and ready to cut off in <1s'}</p>
        </div>
        <span className={cn('h-2 w-2 animate-pulse rounded-full', emergency ? 'bg-[var(--red)]' : 'bg-[var(--green)]')} />
      </div>
    </Section>
  )
}

/* ---- Feature 53 · Health check report ---- */
export function HealthReport() {
  const services = [
    { name: 'command-center', ok: true },
    { name: 'api-gateway', ok: true },
    { name: 'ai-resolver', ok: true },
    { name: 'event-pipeline', ok: false },
    { name: 'export-worker', ok: true },
  ]
  return (
    <Section icon={Activity} title="Health check report" hint="real-time status + last-signal times, exportable">
      <div className="space-y-1">
        {services.map((s) => (
          <div key={s.name} className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
            <span className={cn('h-2 w-2 animate-pulse rounded-full', s.ok ? 'bg-[var(--green)]' : 'bg-[var(--red)]')} aria-hidden="true" />
            <span className="flex-1 truncate font-mono text-[10px] text-pri">{s.name}</span>
            <span className="text-[9px] text-tri">{s.ok ? 'healthy · 9ms' : 'degraded · last OK 4m ago'}</span>
          </div>
        ))}
      </div>
      <button className="btn mt-1.5 !py-1 text-[10px]" onClick={() => useDashboardStore.getState().logAction('Exported health report PDF')}>Download .pdf</button>
    </Section>
  )
}

/* ---- Feature 54 · Search & replace across all users' dashboards ---- */
export function SearchReplace() {
  const [from, setFrom] = useState('Revenue')
  const [to, setTo] = useState('ARR')
  const [done, setDone] = useState(0)
  return (
    <Section icon={Replace} title="Search & replace (global)" hint="for deprecations — swap a KPI label across all configs">
      <div className="flex flex-wrap items-center gap-1.5">
        <input value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Replace from" className="w-28 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
        <span className="text-[10px] text-tri">→</span>
        <input value={to} onChange={(e) => setTo(e.target.value)} aria-label="Replace to" className="w-28 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
        <button className="btn btn-primary !py-1.5 text-[10px]" onClick={() => { setDone(17 + Math.floor(Math.random() * 20)); useDashboardStore.getState().logAction(`Global replace ${from} → ${to}`) }}>Preview & apply</button>
      </div>
      {done > 0 && <p className="mt-1.5 text-[10px] text-[var(--green)]">✓ {done} dashboards updated ({from} → {to})</p>}
    </Section>
  )
}

/* ---- Feature 69 · Compliance snapshots ---- */
export function ComplianceExport() {
  const standards = [
    ['GDPR · EU', '2026-08-01', 'exported'],
    ['SOC 2 · Type II', '2026-07-14', 'exported'],
    ['PCI DSS · v3.2.1', '2026-06-30', 'ready'],
    ['HIPAA', '2026-06-02', 'ready'],
  ]
  return (
    <Section icon={FileCheck2} title="Compliance snapshots & export" hint="audit-log proof for every standard, generated quarterly">
      <div className="space-y-1">
        {standards.map(([s, date, state]) => (
          <div key={s} className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
            <span className="flex-1 truncate text-[10px] text-sec">{s}</span>
            <span className="tabular text-[9px] text-tri">{date}</span>
            <button className="btn !py-1 text-[9px]" onClick={() => useDashboardStore.getState().logAction(`Exported compliance snapshot: ${s}`)}>{state === 'exported' ? 're-export' : 'generate'}</button>
          </div>
        ))}
      </div>
    </Section>
  )
}