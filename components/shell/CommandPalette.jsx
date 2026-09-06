'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowUp, ArrowDown, CornerDownLeft, Sparkles, LayoutDashboard, BarChart3, ListTodo, Database, Activity, Bookmark, FileText, Focus, Sun, ShieldCheck, X, Map, TrendingUp } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import { resolveQuery, QUICK_SUGGESTIONS } from '@/lib/ai'
import { cn } from '@/lib/utils'
import { Bar, BarChart, ResponsiveContainer } from 'recharts'

const NAV_ITEMS = [
  { kind: 'nav', label: 'Overview', icon: LayoutDashboard, target: '/command-center' },
  { kind: 'nav', label: 'Analytics hub', icon: BarChart3, target: '/command-center#analytics' },
  { kind: 'nav', label: 'Task workflow', icon: ListTodo, target: '/command-center#tasks' },
  { kind: 'nav', label: 'Data table', icon: Database, target: '/command-center/data' },
  { kind: 'nav', label: 'System health', icon: Activity, target: '/command-center#health' },
]

const ACTIONS = [
  { kind: 'action', label: 'Export current view', icon: FileText, run: (s) => s.logAction('Exporting current view') },
  { kind: 'action', label: 'Toggle focus mode', icon: Focus, run: (s) => s.setFocusMode(!s.focusMode, null) },
  { kind: 'action', label: 'Toggle light/dark theme', icon: Sun, run: (s) => s.toggleTheme() },
  { kind: 'action', label: 'Open admin & access', icon: ShieldCheck, run: (s) => s.setAdminOpen(true) },
]

let routerPush = () => {}

/** Global Command Palette — search everything, navigate anywhere, run AI queries. */
export default function CommandPalette({ push }) {
  if (push) routerPush = push
  const open = useDashboardStore((s) => s.commandOpen)
  const setOpen = useDashboardStore((s) => s.setCommandOpen)
  const [q, setQ] = useState('')
  const [ai, setAi] = useState(null)
  const [active, setActive] = useState(0)
  const [srcMode, setSrcMode] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQ('')
      setAi(null)
      setSrcMode(false)
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const t = setTimeout(() => {
      if (q.trim().length >= 3 && !q.startsWith('/')) {
        setSrcMode(true)
        setAi(resolveQuery(q))
      } else {
        setSrcMode(false)
        setAi(null)
      }
    }, 280)
    return () => clearTimeout(t)
  }, [q, open])

  const results = useMemo(() => {
    if (srcMode) return []
    const needle = q.toLowerCase()?.replace(/^\/\w+\s*/, '')
    const navs = NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(needle))
    const acts = ACTIONS.filter((a) => a.label.toLowerCase().includes(needle))
    const bookmarks = useDashboardStore
      .getState()
      .bookmarks.filter((b) => b.label.toLowerCase().includes(needle))
      .map((b) => ({ kind: 'bookmark', label: b.label, id: b.id, icon: Bookmark, run: (s) => b.payload && s.setVisual(b.payload) }))
    const sugg = !needle
      ? QUICK_SUGGESTIONS.map((raw, i) => ({ kind: 'ai', label: raw, icon: Sparkles, raw }))
      : []
    return [...acts, ...sugg, ...navs, ...bookmarks].slice(0, 12)
  }, [q, srcMode])

  useEffect(() => setActive(0), [q, ai, srcMode])

  const commitVisual = (visual) => {
    useDashboardStore.getState().logAction(`AI render: ${visual.title}`)
    useDashboardStore.getState().setVisual(visual)
  }

  const exec = (item) => {
    if (item.kind === 'ai') {
      useDashboardStore.getState().pushAiMessage({ role: 'user', text: item.raw })
      const r = resolveQuery(item.raw)
      if (r.kind === 'visual') commitVisual(r)
      setOpen(false)
      return
    }
    if (item.kind === 'nav') {
      routerPush(item.target)
      useDashboardStore.getState().logAction(`Navigated to ${item.label}`)
      setOpen(false)
      return
    }
    item.run?.(useDashboardStore.getState())
    useDashboardStore.getState().logAction(`Palette: ${item.label}`)
    setOpen(false)
  }

  const execAi = () => {
    if (!ai) return
    useDashboardStore.getState().pushAiMessage({ role: 'user', text: q })
    if (ai.kind === 'visual') commitVisual(ai)
    else if (ai.kind === 'action') applyAction(ai)
    else useDashboardStore.getState().pushAiMessage({ role: 'ai', text: ai.answer })
    setOpen(false)
  }

  const applyAction = (a) => {
    const s = useDashboardStore.getState()
    if (a.action === 'nav') routerPush(`/command-center#${a.target}`)
    else if (a.action === 'theme') s.toggleTheme()
    else if (a.action === 'focus') s.setFocusMode(true, null)
    else if (a.action === 'env') s.setEnv(a.env)
    else if (a.action === 'impersonate') s.setAdminOpen(true)
    else if (a.action === 'export') s.logAction('Exporting current view')
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (srcMode) execAi()
      else if (results[active]) exec(results[active])
    }
  }

  const emptyBody = (
    <div className="grid place-items-center gap-2 py-9 text-center">
      <Search size={20} className="text-tri" />
      <p className="text-xs text-tri">
        {q ? 'No exact match — switch to copilot query for an instant answer.' : 'Ask in plain language — “revenue vs costs, last 6 months”.'}
      </p>
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Command palette" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="scrim absolute inset-0" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: -16, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -12, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="glass-strong absolute left-1/2 top-[12vh] w-[min(94vw,660px)] -translate-x-1/2 overflow-hidden rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[var(--stroke)] px-4 py-3.5">
              {srcMode ? <Sparkles size={17} className="shrink-0 tone-ai tone-text" /> : <Search size={17} className="shrink-0 text-tri" />}
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search everyone, command anything…"
                className="flex-1 bg-transparent text-sm text-pri placeholder:text-tri outline-none"
                aria-label="Command search"
              />
              {srcMode && <span className="chip tone-ai tone-soft">copilot</span>}
              <button className="icon-btn h-6 w-6" onClick={() => setOpen(false)} aria-label="Close palette"><X size={14} /></button>
            </div>

            <div className="max-h-[52vh] space-y-1 overflow-y-auto p-2">
              {srcMode && ai && <AiCard ai={ai} onPick={execAi} />}
              {srcMode && ai && ai.kind === 'visual' && (
                <p className="px-2 pt-1 text-[10px] text-tri">press ↵ to pin to analytics canvas</p>
              )}
              {!srcMode &&
                (results.length === 0 ? emptyBody : results.map((item, i) => {
                  const Icon = item.icon || Sparkles
                  return (
                    <button
                      key={`${item.kind}-${item.label}-${i}`}
                      onClick={() => exec(item)}
                      onMouseEnter={() => setActive(i)}
                      className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors', active === i && 'tone-ai tone-faint')}
                      role="option"
                      aria-selected={active === i}
                    >
                      <Icon size={15} className={cn(active === i ? 'tone-ai tone-text' : 'text-tri')} />
                      <span className={cn('flex-1 truncate', active === i ? 'text-pri' : 'text-sec')}>{item.label}</span>
                      {item.kind === 'ai' && <CornerDownLeft size={11} className="text-tri" />}
                      {item.kind === 'ai' && <span className="text-[9px] uppercase tracking-widest text-tri">copilot</span>}
                    </button>
                  )
                }))}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--stroke)] px-3 py-2 text-[10px] text-tri">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1"><ArrowUp size={10} /><ArrowDown size={10} /> navigate</span>
                <span className="flex items-center gap-1"><CornerDownLeft size={10} /> select</span>
                <span className="hidden items-center gap-1 sm:flex"><Sparkles size={10} /> NL query → instant chart</span>
              </span>
              <span>esc to dismiss</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AiCard({ ai, onPick }) {
  if (ai.kind === 'visual' && ai.visual === 'chart') {
    const d0 = ai.datasets?.[0]
    return (
      <button className="block w-full rounded-xl p-0.5 text-left focus-visible:outline-none" onClick={onPick}>
        <div className="tone-ai tone-faint rounded-xl p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-pri"><Sparkles size={14} className="tone-ai tone-text" /> {ai.title}</p>
            <span className="chip tone-ai tone-soft shrink-0">render</span>
          </div>
          {d0 && (
            <div className="mt-2 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ai.labels.map((l, i) => ({ name: l, v: d0.data[i] }))}>
                  <Bar dataKey="v" fill="var(--violet)" radius={[4, 4, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </button>
    )
  }
  if (ai.kind === 'visual' && ai.visual === 'geospatial') {
    return (
      <button className="block w-full rounded-xl" onClick={onPick}>
        <div className="tone-ai tone-faint flex items-center justify-between rounded-xl p-3.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-pri"><Map size={14} className="tone-ai tone-text" /> {ai.title}</p>
          <span className="chip tone-ai tone-soft">open map</span>
        </div>
      </button>
    )
  }
  if (ai.kind === 'visual' && ai.visual === 'dial') {
    return (
      <button className="block w-full rounded-xl" onClick={onPick}>
        <div className="tone-ai tone-faint flex items-center justify-between rounded-xl p-3.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-pri"><TrendingUp size={14} className="tone-ai tone-text" /> {ai.title}</p>
          <span className="chip tone-success tone-soft tabular">{Math.round((ai.kpi.value / ai.kpi.goal) * 100)}% of goal</span>
        </div>
      </button>
    )
  }
  if (ai.kind === 'action') {
    return (
      <button className="block w-full rounded-xl" onClick={onPick}>
        <div className="tone-ai tone-faint flex items-center justify-between rounded-xl p-3.5 text-sm font-semibold text-pri">
          <span className="flex items-center gap-2"><Sparkles size={14} className="tone-ai tone-text" /> {ai.label}</span>
          <span className="chip tone-ai tone-soft">execute</span>
        </div>
      </button>
    )
  }
  return (
    <div className="tone-ai tone-faint rounded-xl p-3.5 text-sm leading-relaxed text-sec">
      <span className="mb-1 flex items-center gap-2 font-semibold text-pri"><Sparkles size={14} className="tone-ai tone-text" /> AI says</span>
      {ai.answer}
    </div>
  )
}

export { NAV_ITEMS, ACTIONS }