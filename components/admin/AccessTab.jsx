'use client'

import { useState } from 'react'
import { Eye, Flag, Grid3x3, CopyPlus, Search } from 'lucide-react'
import useTeamStore from '@/store/team.store'
import useFlagsStore from '@/store/flags.store'
import useAdminStore from '@/store/admin.store'
import { FLAG_GROUPS } from '@/lib/mock'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'

/* ---- Feature 41 · Live User Spy ---- */
export function LiveUserSpy() {
  const users = useTeamStore((s) => s.users)
  const removeUser = useTeamStore((s) => s.removeUser)
  return (
    <Section icon={Eye} title="Live user spy" hint="every logged-in session, page and age">
      <div className="space-y-1.5">
        {users.map((u) => (
          <div key={u.id} className="glass-soft flex items-center gap-2.5 rounded-xl px-3 py-2">
            <span className="grid h-7 w-7 place-items-center rounded-full text-[9px] font-bold" style={{ background: u.color, color: '#04070b' }}>{u.name[0]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-pri">{u.name} {u.id === 'u_ava' && <span className="text-[9px] text-tri">(you)</span>}</p>
              <p className="truncate text-[9px] text-tri">{u.page} · session {timeAgo(new Date(u.sessionStart).toISOString())}</p>
            </div>
            <span className={cn('h-2 w-2 rounded-full', u.online ? 'bg-[var(--green)]' : 'bg-[var(--stroke)]')} aria-label={u.online ? 'online' : 'offline'} />
            <button className="btn btn-danger !py-1 text-[9px]" disabled={u.id === 'u_ava'} onClick={() => removeUser(u.id)}>Kill</button>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ---- Feature 42 · Feature Flag Toggles ---- */
export function FeatureFlags() {
  const flags = useFlagsStore((s) => s.flags)
  const setFlag = useFlagsStore((s) => s.setFlag)
  const setGroup = useFlagsStore((s) => s.setGroup)
  const reset = useFlagsStore((s) => s.reset)
  const [q, setQ] = useState('')
  return (
    <Section icon={Flag} title="Feature flags" hint="instant on/off per group — no redeploy">
      <div className="mb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tri" />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search flags" placeholder="Search flags…" className="w-full rounded-lg border border-[var(--stroke)] bg-transparent py-1.5 pl-7 pr-2 text-[11px] text-pri outline-none focus:border-[var(--cyan)]" />
        </div>
        <button className="btn btn-ghost !py-1 text-[10px]" onClick={reset}>Reset</button>
      </div>
      {FLAG_GROUPS.map((g) => {
        const list = Object.entries(flags).filter(([, f]) => f.group === g && f.id.includes(q.toLowerCase()))
        if (!list.length) return null
        return (
          <div key={g} className="mb-3">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-tri">{g}</p>
              <div className="flex gap-1">
                {['on', 'off'].map((v) => (
                  <button key={v} className="rounded-md border border-[var(--stroke)] px-1.5 py-0.5 text-[9px] text-tri hover:text-pri" onClick={() => setGroup(g, v === 'on')}>{v === 'on' ? 'All on' : 'All off'}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {list.map(([id, f]) => (
                <label key={id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--glass)]">
                  <input type="checkbox" checked={f.on} onChange={(e) => setFlag(id, e.target.checked)} aria-label={id} className="h-3 w-3 accent-[var(--cyan)]" />
                  <span className={cn('truncate text-[10px]', f.on ? 'text-pri' : 'text-tri')}>{id}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </Section>
  )
}

/* ---- Feature 43 · Permission Matrix ---- */
const PERM_COLS = ['dashboard.read', 'export.read', 'admin.read', 'deploy.write', 'ticket.write', 'admin.full']
export function PermissionMatrix() {
  const perms = useAdminStore((s) => s.permissions)
  const setPerm = useAdminStore((s) => s.setPermission)
  const users = Object.keys(perms)
  return (
    <Section icon={Grid3x3} title="Permission matrix" hint="rows = people · columns = permissions · bulk edit">
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-[10px]">
          <thead>
            <tr className="text-left text-tri">
              <th className="pb-1.5 pr-2 font-semibold">user</th>
              {PERM_COLS.map((p) => <th key={p} className="pb-1.5 pr-2 font-semibold">{p.replace('.', ' / ')}</th>)}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u} className="border-t border-[var(--stroke)]">
                <td className="py-1.5 pr-2 text-sec">{u}</td>
                {PERM_COLS.map((p) => (
                  <td key={p} className="py-1.5 pr-2">
                    <button
                      aria-label={`${u} ${p}`}
                      className={cn('grid h-4 w-4 place-items-center rounded-[4px] border', perms[u]?.[p] ? 'tone-success tone-soft tone-text' : 'border-[var(--stroke)] text-transparent')}
                      onClick={() => setPerm(u, p, !perms[u]?.[p])}
                    >✓</button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

/* ---- Feature 55 · Role cloning ---- */
export function RoleClone() {
  const roles = useAdminStore((s) => s.roles)
  const clone = useAdminStore((s) => s.cloneRole)
  const [from, setFrom] = useState(roles[0] || 'Executive')
  const [to, setTo] = useState('')
  return (
    <Section icon={CopyPlus} title="Role cloning" hint="duplicate a role + its permission set, then tweak">
      <div className="flex flex-wrap items-center gap-1.5">
        <select value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Source role" className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-sec outline-none">
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="new role name" aria-label="New role" className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
        <button className="btn btn-primary !py-1.5 text-[10px]" onClick={() => { if (to) { clone(from, to); setTo('') } }}>Clone</button>
      </div>
    </Section>
  )
}

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

export default LiveUserSpy