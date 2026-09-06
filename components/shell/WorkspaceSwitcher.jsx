'use client'

import useDashboardStore from '@/store/dashboard.store'
import { WORKSPACES } from '@/lib/mock'
import { cn } from '@/lib/utils'
import { useDashboardIcon } from '@/lib/icons'
import Tip from '@/components/ui/Tip'

/** Workspace switcher — dynamic density: role presets change what's on screen. */
export default function WorkspaceSwitcher({ collapsed }) {
  const workspace = useDashboardStore((s) => s.workspace)
  const setWorkspace = useDashboardStore((s) => s.setWorkspace)
  const density = useDashboardStore((s) => s.density)
  const setDensity = useDashboardStore((s) => s.setDensity)

  return (
    <div className="space-y-2">
      {collapsed ? (
        <div className="flex flex-col items-center gap-1">
          <Tip label={`Workspace: ${workspace}`} placement="right">
            <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: 'var(--glass)' }}>
              {(() => {
                const W = useDashboardIcon(WORKSPACES.find((w) => w.id === workspace)?.icon)
                return <W size={16} className="tone-cyan tone-text" />
              })()}
            </span>
          </Tip>
        </div>
      ) : (
        <>
          <p className="px-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-tri">Workspace</p>
          <div className="grid grid-cols-1 gap-1">
            {WORKSPACES.map((w) => {
              const W = useDashboardIcon(w.icon)
              const active = workspace === w.id
              return (
                <button
                  key={w.id}
                  onClick={() => setWorkspace(w.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all',
                    active ? 'tone-cyan tone-soft tone-text' : 'text-sec hover:text-pri hover:bg-[var(--glass)]'
                  )}
                >
                  <W size={14} className={active ? 'tone-cyan tone-text' : 'text-tri'} />
                  {w.label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full tone-cyan tone-text" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl px-2.5 py-2" style={{ background: 'var(--glass)' }}>
            <span className="text-[10px] text-tri">Density</span>
            <div className="flex gap-1" role="group" aria-label="Density">
              {['compact', 'comfortable'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  aria-pressed={density === d}
                  className={cn('rounded-md px-2 py-0.5 text-[10px] capitalize', density === d ? 'tone-soft tone-cyan tone-text' : 'text-tri')}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}