'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, UserPlus, MessageSquare, Check, X, Workflow, Link2, Layers, Trash2 } from 'lucide-react'
import { initialTasks, TASK_PRIORITIES } from '@/lib/mock'
import useDashboardStore from '@/store/dashboard.store'
import { cn } from '@/lib/utils'
import LazyMount from '@/hooks/useInView'
import Skeleton from '@/components/ui/Skeleton'
import ToneChip from '@/components/ui/ToneChip'
import Tip from '@/components/ui/Tip'

const STATUS = [
  { id: 'todo', label: 'To Do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
]

const fmtSLA = (s) => {
  if (s <= 0) return '0s'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

/** Module 4 — Workflow & Task Management Engine */
export default function TaskBoard() {
  return (
    <LazyMount fallback={<TasksSkeleton />}>
      <Board />
    </LazyMount>
  )
}

function Board() {
  const [tasks, setTasks] = useState(initialTasks)
  const [selected, setSelected] = useState([])
  const [graph, setGraph] = useState(false)
  const [tick, setTick] = useState(0)
  const logAction = useDashboardStore((s) => s.logAction)
  const columnsRef = useRef({})

  /* real-time SLA countdown */
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    setTasks((ts) => ts.map((t) => (t.sla > 0 ? { ...t, sla: Math.max(0, t.sla - 1) } : t)))
  }, [tick])

  const move = (id, status) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)))
    logAction(`Moved ${id} → ${status}`)
  }

  const onDrop = (id, info) => {
    const { point } = info
    let best = null
    for (const statusId of Object.keys(columnsRef.current)) {
      const r = columnsRef.current[statusId]?.getBoundingClientRect()
      if (!r) continue
      if (point.x >= r.left && point.x <= r.right) best = statusId
    }
    if (best) move(id, best)
  }

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const batchStatus = (status) => {
    setTasks((ts) => ts.map((t) => (selected.includes(t.id) ? { ...t, status } : t)))
    logAction(`Batch: ${selected.length} tasks → ${status}`)
    setSelected([])
  }

  const countByStatus = (status) => tasks.filter((t) => t.status === status).length

  return (
    <div className="flex h-full flex-col">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="tone-cyan tone-soft grid h-7 w-7 place-items-center rounded-lg">
            <Workflow size={14} />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold text-pri">Task Workflow</h2>
            <p className="text-[10px] text-tri">{tasks.length} tasks · drag between lanes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5">
              <span className="chip tone-info tone-soft">{selected.length} selected</span>
              {['todo', 'doing', 'done'].map((s) => (
                <button key={s} className="btn !py-1 text-[10px] capitalize" onClick={() => batchStatus(s)}>
                  {s}
                </button>
              ))}
              <button className="btn !py-1 text-[10px] tone-critical tone-soft" onClick={() => { setTasks((ts) => ts.filter((t) => !selected.includes(t.id))); logAction(`Batch deleted ${selected.length} tasks`); setSelected([]) }}>
                <Trash2 size={10} /> Delete
              </button>
            </motion.div>
          )}
          <button className={cn('btn !py-1.5 text-[11px]', graph && 'btn-tonal tone-ai')} onClick={() => { setGraph(!graph); logAction('Toggled dependency graph') }}>
            <Link2 size={12} /> Dependencies
          </button>
        </div>
      </header>

      {graph && (
        <DependencyGraph tasks={tasks} columnsRef={columnsRef} />
      )}

      <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3 [min-height:420px]">
        {STATUS.map((col) => (
          <div
            key={col.id}
            ref={(el) => { columnsRef.current[col.id] = el }}
            className="glass-soft flex min-h-[380px] flex-col rounded-2xl p-2.5"
          >
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sec">
                <span className={cn('h-1.5 w-1.5 rounded-full', col.id === 'doing' ? 'tone-warn tone-text' : col.id === 'done' ? 'tone-success tone-text' : 'tone-info tone-text')} />
                {col.label}
              </span>
              <span className="tabular rounded-md px-1.5 py-0.5 text-[10px] text-tri" style={{ background: 'var(--glass)' }}>
                {countByStatus(col.id)}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto [min-height:180px]">
              <AnimatePresence>
                {tasks.filter((t) => t.status === col.id).map((task) => (
                  <TaskCard key={task.id} task={task} selected={selected.includes(task.id)} onToggle={() => toggleSelect(task.id)} onDrop={onDrop} onMove={move} />
                ))}
              </AnimatePresence>
              {tasks.filter((t) => t.status === col.id).length === 0 && (
                <div className="grid flex-1 place-items-center rounded-xl border border-dashed py-10 text-[11px] uppercase tracking-widest text-tri" style={{ borderColor: 'var(--stroke)' }}>
                  drop here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskCard({ task, selected, onToggle, onDrop, onMove }) {
  const pr = TASK_PRIORITIES.find((p) => p.id === task.prio)
  const ratio = task.slaTotal > 0 ? task.sla / task.slaTotal : 0
  const slaTone = ratio <= 0.2 ? 'critical' : ratio <= 0.5 ? 'warn' : 'success'
  const depIssued = task.dep && !initialTasks.find((t) => t.id === task.dep)?.status !== 'done'

  return (
    <motion.div
      layout
      drag
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.12}
      onDragEnd={(_, info) => onDrop(task.id, info)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'card-3d group/task relative cursor-grab p-3 active:cursor-grabbing',
        selected && 'tone-border tone-info',
        task.status === 'done' && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
            selected ? 'tone-success tone-soft tone-border' : 'border-current opacity-30 hover:opacity-70'
          )}
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          aria-label={`Select ${task.title}`}
          aria-pressed={selected}
        >
          {selected && <Check size={11} />}
        </button>
        <p className="flex-1 text-xs font-medium leading-snug text-pri">{task.title}</p>
        <ToneChip tone={pr.id === 'high' ? 'critical' : pr.id === 'medium' ? 'warn' : 'success'} className="text-[9px]">
          {pr.label}
        </ToneChip>
      </div>

      {/* avatar + tags */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold text-contrast" style={{ background: 'color-mix(in srgb, var(--cyan) 22%, transparent)', color: 'var(--cyan)' }}>
            {task.assignee}
          </span>
          <span className="tabular text-[10px] text-tri">{task.est}h</span>
        </div>
        <div className="flex items-center gap-1.5">
          {task.dep && (
            <Tip label={`Blocked by: ${task.dep}`} wide>
              <span className="chip tone-ai tone-soft text-[9px] py-0 px-1.5"><Link2 size={9} />{task.dep}</span>
            </Tip>
          )}
          <span className="tabular text-[10px] text-tri">#{task.id}</span>
        </div>
      </div>

      {/* SLA countdown timer */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="relative h-1 flex-1 overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--text-2) 20%, transparent)' }}>
          <motion.div
            className={cn('absolute inset-y-0 left-0 rounded-full')}
            style={{ background: ratio <= 0.2 ? 'var(--red)' : ratio <= 0.5 ? 'var(--yellow)' : 'var(--green)', width: `${Math.max(4, ratio * 100)}%` }}
            animate={{ width: `${Math.max(4, ratio * 100)}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <span className={cn('chip tabular py-0 text-[9px]', `tone-${slaTone}`, 'tone-soft')}>
          {fmtSLA(task.sla)} left
        </span>
      </div>

      {/* quick actions (hover) — Start / Assign / Comment */}
      <div className="pointer-events-none absolute inset-x-3 -bottom-1 flex translate-y-2 items-center justify-end gap-1 opacity-0 transition-all duration-200 group-hover/task:translate-y-0 group-hover/task:opacity-100 group-focus-within/task:opacity-100">
        <button className="icon-btn h-6 w-6 glass-strong" aria-label={`Start ${task.title}`} onClick={() => onMove(task.id, 'doing')}>
          <Play size={11} />
        </button>
        <button className="icon-btn h-6 w-6 glass-strong" aria-label={`Assign ${task.title}`} onClick={() => { onMove(task.id, task.status); useDashboardStore.getState().logAction(`Assign pipeline opened for ${task.id}`) }}>
          <UserPlus size={11} />
        </button>
        <button className="icon-btn h-6 w-6 glass-strong" aria-label={`Comment ${task.title}`}>
          <MessageSquare size={11} />
        </button>
      </div>

      {task.dep && !depIssued && (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset" style={{}} />
      )}
    </motion.div>
  )
}

function DependencyGraph({ tasks }) {
  const nodes = tasks.slice(0, 8)
  const edges = tasks.filter((t) => t.dep).slice(0, 6)
  const R = 22
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-3 overflow-hidden"
    >
      <div className="glass-soft rounded-2xl p-3">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-tri">
          <Layers size={11} /> dependency graph · blockers chain
        </p>
        <svg viewBox="0 0 640 120" className="w-full" role="img" aria-label="Task dependency graph">
          {edges.map((e, i) => {
            const from = nodes.findIndex((n) => n.id === e.dep)
            const to = nodes.findIndex((n) => n.id === e.id)
            if (from < 0 || to < 0) return null
            const fx = from * 82 + 41
            const tx = to * 82 + 41
            const fy = Math.abs(from - to) > 4 ? 24 : 60
            const ty = Math.abs(from - to) > 4 ? 60 : 90
            return (
              <path
                key={`${e.dep}-${e.id}`}
                d={`M${fx} ${fy} C${fx} ${(fy + ty) / 2}, ${tx} ${(fy + ty) / 2}, ${tx} ${ty}`}
                fill="none"
                stroke={e.prio === 'high' ? 'var(--yellow)' : 'var(--violet)'}
                strokeWidth="1.3"
                strokeDasharray="4 3"
              >
                <animateTransform attributeName="transform" attributeType="XML" type="translate" from="0 0" to="4 0" dur="1.2s" repeatCount="indefinite" />
              </path>
            )
          })}
          {nodes.map((n, i) => (
            <g key={n.id}>
              <circle cx={i * 82 + 41} cy={n.dep ? 30 : 78} r={R} fill="var(--bg-1)" stroke={n.status === 'done' ? 'var(--green)' : n.prio === 'high' ? 'var(--yellow)' : 'var(--violet)'} strokeWidth="1.5" />
              <text x={i * 82 + 41} y={n.dep ? 34 : 82} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-1)">
                {n.id.replace('t', 'T')}
              </text>
              <text x={i * 82 + 41} y={n.dep ? 120 : 114} textAnchor="middle" fontSize="8" fill="var(--text-2)">
                {n.status}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </motion.div>
  )
}

export function TasksSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-soft rounded-2xl p-3">
            <Skeleton className="mb-3 h-5 w-20" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="mt-2 h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}