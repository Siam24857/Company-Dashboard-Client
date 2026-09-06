'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X, ChevronDown, Search, UserCheck, ScrollText, Fingerprint, Swords, Database, Cpu, Settings2 } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import { rolesTree, auditEvents, users2fa } from '@/lib/mock'
import { cn } from '@/lib/utils'
import ToneChip from '@/components/ui/ToneChip'
import Tip from '@/components/ui/Tip'
import { LiveUserSpy, FeatureFlags, PermissionMatrix, RoleClone } from '@/components/admin/AccessTab'
import { MetricBuilder, RetentionRules, ApiKeyManager, WebhookTester, EnvSyncCompare, SqlConsole } from '@/components/admin/DataTab'
import { UsageAnalytics, ScheduledJobs, RateLimits, BulkInvite, DataTransfer, ErrorDash, UpgradeSim, FeedbackAggr } from '@/components/admin/EngTab'
import { Maintenance, SessionTerminator, IpRules, SsoConfig, WhiteLabel, GlobalCss, SeatManagement, EmergencyShutdown, HealthReport, SearchReplace, ComplianceExport } from '@/components/admin/SysTab'

const TONES = {
  'role.grant': 'warn',
  'deploy.prod': 'info',
  'environment.switch': 'success',
  'task.assign': 'success',
  'bookmark.create': 'warn',
  'alert.ack': 'critical',
}

/** Module 6 — User & Access Management (Admin). */
export default function AdminPanel() {
  const open = useDashboardStore((s) => s.adminOpen)
  const setOpen = useDashboardStore((s) => s.setAdminOpen)
  const logAction = useDashboardStore((s) => s.logAction)
  const [tab, setTab] = useState('rbac')
  const [who, setWho] = useState(null)
  const [q, setQ] = useState('')

  const TABS = [
    { id: 'rbac', label: 'RBAC', icon: ShieldCheck },
    { id: 'audit', label: 'Audit trail', icon: ScrollText },
    { id: '2fa', label: '2FA grid', icon: Fingerprint },
    { id: 'admin', label: 'Admin cockpit', icon: Swords },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Admin & access">
          <div className="scrim absolute inset-0" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="glass-strong absolute left-1/2 top-1/2 flex max-h-[82vh] w-[min(96vw,780px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl shadow-2xl"
          >
            {/* impersonation banner */}
            {who && (
              <div className="tone-critical tone-faint flex items-center gap-3 border-b border-[var(--stroke)] px-4 py-2.5" role="alert">
                <UserCheck size={15} className="tone-critical tone-text" />
                <span className="text-xs text-sec">
                  Impersonating <strong className="text-pri">{who}</strong> — every action is logged and reversible.
                </span>
                <button className="ml-auto btn btn-danger !py-1 text-[11px]" onClick={() => { setWho(null); logAction('Exited impersonation mode') }}>
                  Exit impersonation
                </button>
              </div>
            )}

            <header className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="tone-warn tone-soft grid h-8 w-8 place-items-center rounded-xl"><ShieldCheck size={16} /></span>
                <div>
                  <h2 className="font-display text-sm font-semibold text-pri">Admin & Access</h2>
                  <p className="text-[10px] text-tri">role hierarchy · audit log · identity posture</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {TABS.map((t) => {
                  const I = t.icon
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      aria-pressed={tab === t.id}
                      className={cn('flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold', tab === t.id ? 'tone-cyan tone-soft tone-text' : 'text-tri hover:text-sec')}
                    >
                      <I size={13} /> <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  )
                })}
                <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close admin"><X size={16} /></button>
              </div>
            </header>

            <div className="overflow-y-auto p-5 pt-2">
              {tab === 'rbac' && <RBACTree logAction={logAction} />}
              {tab === 'audit' && <AuditTimeline logAction={logAction} />}
              {tab === '2fa' && <TwoFA q={q} setQ={setQ} setWho={setWho} who={who} logAction={logAction} />}
              {tab === 'admin' && <AdminCockpit logAction={logAction} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AdminCockpit({ logAction }) {
  const [sub, setSub] = useState('access')
  const SUB = [
    { id: 'access', label: 'Access', icon: UserCheck, group: <><LiveUserSpy /><FeatureFlags /><PermissionMatrix /><RoleClone /></> },
    { id: 'data', label: 'Data', icon: Database, group: <><MetricBuilder /><RetentionRules /><ApiKeyManager /><WebhookTester /><EnvSyncCompare /><SqlConsole /></> },
    { id: 'eng', label: 'Engineering', icon: Cpu, group: <><UsageAnalytics /><ScheduledJobs /><RateLimits /><BulkInvite /><DataTransfer /><ErrorDash /><UpgradeSim /><FeedbackAggr /></> },
    { id: 'sys', label: 'System', icon: Settings2, group: <><Maintenance /><SessionTerminator /><IpRules /><SsoConfig /><WhiteLabel /><GlobalCss /><SeatManagement /><EmergencyShutdown /><HealthReport /><SearchReplace /><ComplianceExport /></> },
  ]
  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5 border-b border-[var(--stroke)] pb-2">
        <Swords size={13} className="tone-cyan tone-text" />
        <p className="mr-2 font-display text-[11px] font-semibold text-pri">Feature-flag macros · identity · data · engineering · system</p>
        {SUB.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSub(s.id); logAction(`Opened admin cockpit → ${s.label}`) }}
            aria-pressed={sub === s.id}
            className={cn('flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold', sub === s.id ? 'tone-cyan tone-soft tone-text' : 'text-tri hover:text-sec')}
          >
            <s.icon size={11} /> {s.label}
          </button>
        ))}
      </div>
      {SUB.find((s) => s.id === sub).group}
    </div>
  )
}

function RBACTree({ logAction }) {
  const [open, setOpen] = useState({})
  return (
    <div className="space-y-1">
      {rolesTree.map((node) => (
        <div key={node.name}>
          <button
            onClick={() => setOpen((o) => ({ ...o, [node.name]: !o[node.name] }))}
            aria-expanded={!!open[node.name]}
            className="glass-soft flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-left"
          >
            <ChevronDown size={14} className={cn('text-tri transition-transform', !open[node.name] && '-rotate-90')} />
            <span className="flex-1 text-sm font-semibold text-pri">{node.name}</span>
            <ToneChip tone={node.tone} className="tabular">{node.count} users</ToneChip>
          </button>
          <AnimatePresence>
            {open[node.name] && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="ml-6 space-y-2 border-l py-2 pl-4" style={{ borderColor: 'var(--stroke)' }}>
                  {node.children.map((c) => (
                    <div key={c.name} className="glass-soft rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-pri">{c.name}</span>
                        <span className="tabular text-[10px] text-tri">{c.count} members</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {c.perms.map((p) => (
                          <span key={p} className="font-mono text-[9px]">{p}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

function AuditTimeline({ logAction }) {
  return (
    <div className="relative space-y-1.5 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-[var(--stroke)]">
      {auditEvents.map((e, i) => (
        <div key={i} className="relative flex items-start gap-3 rounded-xl px-2 py-1.5">
          <span className={cn('relative z-10 mt-1 h-[9px] w-[9px] shrink-0 rounded-full', `tone-${TONES[e.action] || 'info'}`, 'tone-text')} style={{ background: 'var(--tone)' }} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-pri">
              <span className="font-mono text-[10px] text-tri">{e.actor}</span>{' '}
              <span className="tone-font">{e.action.replace('.', ' → ')}</span>{' '}
              <span className="text-sec">{e.target}</span>
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-widest text-tri">{e.at} UTC</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function TwoFA({ q, setQ, setWho, who, logAction }) {
  const filtered = users2fa.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()))
  const enabled = users2fa.filter((u) => u.enabled).length
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-sec">
          Enabled: <strong className="tabular">{enabled}/{users2fa.length}</strong>
          <Tip label="2FA enumerates per-user posture" wide>ⓘ</Tip>
        </p>
        <div className="relative w-52">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tri" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find user…"
            aria-label="Search users"
            className="w-full rounded-lg border border-[var(--stroke)] bg-transparent py-1.5 pl-7 pr-3 text-xs text-pri outline-none focus:border-[var(--cyan)]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {filtered.map((u) => (
          <div key={u.email} className="glass-soft flex items-center gap-3 rounded-xl p-3">
            <span className={cn('grid h-8 w-8 place-items-center rounded-full text-[10px] font-bold', u.enabled ? 'tone-success tone-soft tone-text' : 'tone-warn tone-soft tone-text')}>
              {u.name.split(' ').map((x) => x[0]).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-pri">{u.name}</p>
              <p className="truncate text-[10px] text-tri">{u.role}</p>
            </div>
            <ToneChip tone={u.enabled ? 'success' : 'warn'} dot className="text-[9px]">
              {u.enabled ? '2FA on' : '2FA off'}
            </ToneChip>
            <button
              className={cn('btn !py-1 text-[10px]', who === u.name && 'btn-danger')}
              onClick={() => {
                setWho(who === u.name ? null : u.name)
                logAction(who === u.name ? 'Exited impersonation mode' : `Impersonating ${u.name}`)
              }}
            >
              {who === u.name ? 'Exit' : 'Log in as'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}