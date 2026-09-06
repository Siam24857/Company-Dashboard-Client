'use client'

import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, BarChart3, Database, ListTodo, Activity, ShieldCheck, Bookmark, Command, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import { cn } from '@/lib/utils'
import Tip from '@/components/ui/Tip'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import { WORKSPACES } from '@/lib/mock'

const groups = [
  {
    label: 'Operate',
    items: [
      { key: 'overview', label: 'Overview', icon: LayoutDashboard, target: '/command-center' },
      { key: 'analytics', label: 'Analytics', icon: BarChart3, target: '/command-center#analytics' },
      { key: 'tasks', label: 'Tasks', icon: ListTodo, target: '/command-center#tasks' },
      { key: 'data', label: 'Data', icon: Database, target: '/command-center/data' },
      { key: 'health', label: 'Health', icon: Activity, target: '/command-center#health' },
    ],
  },
  {
    label: 'Govern',
    items: [
      { key: 'admin', label: 'Admin & Access', icon: ShieldCheck, action: 'admin' },
      { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark, action: 'bookmarks' },
    ],
  },
]

/** Adaptive sidebar — brightness scales with usage, collapse-toggle, workspace switcher. */
export default function Sidebar() {
  const store = useDashboardStore((s) => ({
    collapsed: s.sidebarCollapsed,
    toggle: s.toggleSidebar,
    navCounts: s.navCounts,
    bump: s.bumpNav,
    workspace: s.workspace,
    setWorkspace: s.setWorkspace,
    mobileOpen: s.mobileNavOpen,
    setMobileOpen: s.setMobileNavOpen,
    bookmarks: s.bookmarks,
    setAdminOpen: s.setAdminOpen,
  }))
  const router = useRouter()
  const pathname = usePathname()
  const go = (item) => {
    store.bump(item.key)
    if (item.action === 'admin') store.setAdminOpen(true)
    else if (item.target) router.push(item.target)
  }

  const maxCount = Math.max(1, ...Object.values(store.navCounts))

  const body = (
    <div className="flex h-full flex-col">
      {/* brand */}
      <div className={cn('flex items-center gap-2.5 px-4 pb-4 pt-5', store.collapsed && 'justify-center px-2')}>
        <motion.div
          layout
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, var(--cyan), var(--violet))' }}
          aria-hidden="true"
        >
          <Command size={17} style={{ color: '#04070b' }} />
        </motion.div>
        {!store.collapsed && (
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-tight text-pri">IDEON</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-tri">Command Center</p>
          </div>
        )}
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2" aria-label="Primary">
        {groups.map((g) => (
          <div key={g.label}>
            {!store.collapsed && (
              <p className="mb-1.5 px-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-tri">{g.label}</p>
            )}
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const Icon = item.icon
                const active = item.target && pathname === item.target
                const bright = 0.55 + 0.45 * Math.min(1, (store.navCounts[item.key] || 0) / maxCount)
                return (
                  <Tip key={item.key} label={item.label} placement="right">
                    <button
                      onClick={() => go(item)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all',
                        store.collapsed && 'justify-center px-2',
                        active ? 'tone-cyan tone-soft tone-text' : 'text-sec hover:text-pri hover:bg-[var(--glass)]'
                      )}
                      style={{ opacity: active ? 1 : bright, filter: active ? 'brightness(1.15)' : undefined }}
                    >
                      <Icon size={17} strokeWidth={2} />
                      {!store.collapsed && <span className="truncate">{item.label}</span>}
                      {active && !store.collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full tone-cyan tone-text" aria-hidden="true" />}
                    </button>
                  </Tip>
                )
              })}
            </div>
          </div>
        ))}

        {!store.collapsed && (
          <div className="px-2">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-tri">Saved</p>
            <div className="space-y-0.5">
              {store.bookmarks.slice(0, 3).map((b) => (
                <button
                  key={b.id}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-sec hover:bg-[var(--glass)] hover:text-pri"
                  onClick={() => {
                    useDashboardStore.getState().logAction(`Restored bookmark: ${b.label}`)
                    if (b.label.includes('revenue') || b.label.includes('Sales')) useDashboardStore.getState().setVisual(b.payload || null)
                  }}
                >
                  <Bookmark size={12} className="text-tri" />
                  <span className="truncate">{b.label}</span>
                </button>
              ))}
              {store.bookmarks.length === 0 && <p className="py-1 text-[10px] italic text-tri">no bookmarks yet — ⌘P to save</p>}
            </div>
          </div>
        )}
      </nav>

      {/* workspace switcher */}
      <div className="px-3 py-2">
        <WorkspaceSwitcher />
      </div>

      {/* collapse control */}
      <div className="px-3 pb-2">
        <Tip label={store.collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <button className="icon-btn w-full !rounded-xl !justify-center !h-9 gap-2 text-xs" onClick={() => { store.toggle(); store.bump('sidebar') }} aria-label="Toggle sidebar">
            {store.collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /> Collapse</>}
          </button>
        </Tip>
      </div>
    </div>
  )

  return (
    <>
      {/* mobile drawer */}
      {store.mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="scrim absolute inset-0" onClick={() => store.setMobileOpen(false)} />
          <motion.div initial={{ x: -280 }} animate={{ x: 0 }} className="card-3d absolute inset-y-0 left-0 w-64 p-2">
            {body}
          </motion.div>
        </div>
      )}
      {/* desktop rail */}
      <motion.aside
        className={cn('sticky top-0 z-30 hidden h-screen shrink-0 lg:block')}
        initial={false}
        animate={{ width: store.collapsed ? 64 : 232 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      >
        <div className="card-3d m-2 h-[calc(100%-1rem)] overflow-hidden">
          {body}
        </div>
      </motion.aside>
    </>
  )
}