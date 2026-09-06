'use client'

import { useEffect, useState } from 'react'
import { Search, Bell, Menu, Sun, Moon, Cpu } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useLiveStore from '@/store/live.store'
import useAuthStore from '@/store/auth.store'
import { CURRENT_USER, ENVS } from '@/lib/mock'
import { cn } from '@/lib/utils'
import Tip from '@/components/ui/Tip'
import StatusDot from '@/components/ui/StatusDot'
import { usePathname } from 'next/navigation'

/** Sentient header — contextual smart bar, command search, live status, AI toggle. */
export default function Header() {
  const [greeting, setGreeting] = useState('')
  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 5 ? 'Late shift' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening')
  }, [])
  const store = useDashboardStore((s) => ({
    theme: s.theme,
    toggleTheme: s.toggleTheme,
    setCommandOpen: s.setCommandOpen,
    aiOpen: s.aiOpen,
    setAiOpen: s.setAiOpen,
    env: s.env,
    setEnv: s.setEnv,
    mobileOpen: s.mobileNavOpen,
    setMobileOpen: s.setMobileNavOpen,
    pushHun: s.pushHun,
    focusMode: s.focusMode,
  }))
  const connected = useLiveStore((s) => s.connected)
  const user = useAuthStore((s) => s.user) || CURRENT_USER
  const pathname = usePathname()

  const pageTitle = pathname?.includes('/data') ? 'Data Intelligence' : 'Cognitive Overview'

  return (
    <header
      className={cn('glass sticky top-0 z-40 flex items-center gap-3 px-4 py-2.5', store.focusMode && 'focus-hidden')}
      role="banner"
    >
      {/* mobile menu */}
      <button className="icon-btn lg:hidden" aria-label="Open navigation" onClick={() => store.setMobileOpen(true)}>
        <Menu size={18} />
      </button>

      {/* greeting + page context */}
      <div className="hidden min-w-0 shrink-0 sm:block">
        <p className="truncate font-display text-[13px] font-semibold leading-tight text-pri">
          {greeting || 'Welcome'}, {user?.name?.split(' ')[0] || 'Ava'}
        </p>
        <p className="text-[10px] tracking-wide text-tri">
          {pageTitle} · <span className="tone-success tone-text">{connected ? 'live' : 'reconnecting'}</span>
        </p>
      </div>

      {/* command search (center) */}
      <button
        onClick={() => store.setCommandOpen(true)}
        className="glass-soft group mx-auto flex w-full max-w-xl items-center gap-2.5 rounded-xl border-[var(--stroke)] px-3.5 py-2.5 text-left transition-all hover:border-[var(--cyan)] hover:shadow-[0_0_24px_-6px_var(--glow)]"
        aria-label="Open command palette"
      >
        <Search size={14} className="shrink-0 text-tri group-hover:text-pri" />
        <span className="flex-1 truncate text-xs text-tri">Search anything, command anything…</span>
        <span className="kbd shrink-0">⌘K</span>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        {/* environment switcher */}
        <EnvSwitcher />
        {/* live status */}
        <Tip label={connected ? 'Live stream connected' : 'Reconnecting…'}>
          <span className="flex items-center gap-1.5 rounded-lg glass-soft px-2 py-1.5">
            <StatusDot tone={connected ? 'success' : 'warn'} ping />
            <span className="hidden font-mono text-[10px] text-sec md:inline">WSS</span>
          </span>
        </Tip>

        {/* notifications */}
        <Tip label="Notifications">
          <button
            className="icon-btn relative"
            aria-label="Notifications"
            onClick={() => store.pushHun({ title: 'You are all caught up', body: 'No unresolved alerts right now.', tone: 'info' })}
          >
            <Bell size={16} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full tone-warn tone-text" aria-hidden="true" />
          </button>
        </Tip>

        {/* AI copilot */}
        <Tip label="AI Copilot · ⌘A">
          <button
            className={cn('icon-btn relative', store.aiOpen && 'tone-ai tone-soft tone-text')}
            aria-label="Toggle AI copilot"
            aria-pressed={store.aiOpen}
            onClick={() => store.setAiOpen(!store.aiOpen)}
          >
            <Cpu size={16} />
            <span className="live-dot absolute -right-0.5 -top-0.5" style={{ background: 'var(--violet)', width: 7, height: 7 }} aria-hidden="true" />
          </button>
        </Tip>

        {/* theme */}
        <Tip label={store.theme === 'dark' ? 'Switch to light' : 'Switch to dark · ⌘L'}>
          <button className="icon-btn" aria-label="Toggle theme" onClick={() => store.toggleTheme()}>
            {store.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </Tip>

        {/* avatar */}
        <Tip label={`${user?.name} · ${user?.role || CURRENT_USER.role}`} placement="bottom">
          <button
            className="relative grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold"
            style={{ background: 'linear-gradient(135deg, var(--cyan), var(--violet))', color: '#04070b' }}
            aria-label="Account menu"
          >
            {user?.name ? user.name.split(' ').map((x) => x[0]).join('').slice(0, 2) : 'AC'}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 tone-success tone-text tone-dot-glow" style={{ borderColor: 'var(--bg-1)', background: 'var(--green)' }} aria-hidden="true" />
          </button>
        </Tip>
      </div>
    </header>
  )
}

/** Multi-environment switcher with color-coded indicator. */
export function EnvSwitcher() {
  const env = useDashboardStore((s) => s.env)
  const setEnv = useDashboardStore((s) => s.setEnv)
  const envMeta = ENVS.find((e) => e.id === env) || ENVS[2]
  return (
    <Tip label={`Environment: ${env}`}>
      <div className="glass-soft flex items-center gap-0.5 rounded-lg p-0.5" role="group" aria-label="Environment switcher">
        {ENVS.map((e) => (
          <button
            key={e.id}
            onClick={() => setEnv(e.id)}
            aria-pressed={env === e.id}
            className={cn(
              'rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all',
              env === e.id ? 'bg-[color-mix(in_srgb,var(--bg-1)_80%,transparent)] text-pri shadow-sm' : 'text-tri hover:text-sec'
            )}
          >
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: e.color }} aria-hidden="true" />
            {e.label}
          </button>
        ))}
      </div>
    </Tip>
  )
}