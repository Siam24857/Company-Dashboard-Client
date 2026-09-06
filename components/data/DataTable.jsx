'use client'

import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Download, FileText, ArrowUpDown, Check, Pencil, ListFilter, Trash2, Star } from 'lucide-react'
import { tableColumns, generateRows } from '@/lib/mock'
import { cn, downloadCSV, fmtCurrency, clamp } from '@/lib/utils'
import useDashboardStore from '@/store/dashboard.store'
import LazyMount from '@/hooks/useInView'
import Skeleton from '@/components/ui/Skeleton'
import ToneChip from '@/components/ui/ToneChip'

const ROW_H = 46
const OVERSCAN = 6
const FULL_ROWS = 12000

const statusTone = (s) => (s === 'active' ? 'success' : s === 'past_due' ? 'critical' : s === 'trialing' ? 'warn' : 'info')

/** Data Table 2.0 â€” windowed 10k+ rows, pinned columns, inline editing, batch ops. */
export default function DataTable() {
  return (
    <LazyMount fallback={<TableSkeleton />}>
      <Table />
    </LazyMount>
  )
}

function Table() {
  const all = useMemo(() => generateRows(FULL_ROWS), [])
  const [rows, setRows] = useState(all)
  const [sort, setSort] = useState({ key: 'mrr', dir: -1 })
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState([])
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')
  const scrollRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const logAction = useDashboardStore((s) => s.logAction)
  const favIds = useDashboardStore((s) => s.favorites)
  const toggleFavorite = useDashboardStore((s) => s.toggleFavorite)
  const favSet = useMemo(() => new Set(favIds), [favIds])

  const filtered = useMemo(() => {
    if (!q) return rows
    const needle = q.toLowerCase()
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(needle)))
  }, [rows, q])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    const grouped = (fa, fb) => {
      const favDelta = (favSet.has(fb.id) ? 1 : 0) - (favSet.has(fa.id) ? 1 : 0)
      if (favDelta) return favDelta
      if (sort) {
        const { key, dir } = sort
        const av = fa[key]
        const bv = fb[key]
        return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))) * dir
      }
      return 0
    }
    arr.sort(grouped)
    return arr
  }, [filtered, sort, favSet])

  const total = sorted.length
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN)
  const viewportH = 420
  const visibleCount = Math.ceil((viewportH + OVERSCAN * 2 * ROW_H) / ROW_H)
  const end = Math.min(total, start + visibleCount)
  const view = sorted.slice(start, end)

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: key === 'mrr' ? -1 : 1 }))

  const toggleRow = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const commitEdit = (id, key) => {
    const next = rows.map((r) => (r.id === id ? { ...r, [key]: editVal } : r))
    setRows(next)
    logAction(`Inline edit: ${id} ${key} = ${editVal}`)
    setEditing(null)
  }

  const bulkStatus = (status) => {
    const next = rows.map((r) => (selected.includes(r.id) ? { ...r, status } : r))
    setRows(next)
    logAction(`Batch ${selected.length} rows â†’ ${status}`)
    setEditing(null)
    setSelected([])
  }

  const bulkCancel = (selectedIdsList) => {
    const set = new Set(selectedIdsList)
    const next = rows.filter((r) => !set.has(r.id))
    setRows(next)
    logAction(`Batch deleted ${selectedIdsList.length} rows`)
    setSelected([])
  }

  const pinnedKeys = tableColumns.filter((c) => c.pinned).map((c) => c.key)
  const selectedIds = new Set(selected)

  return (
    <section className="card-3d flex h-full flex-col overflow-hidden" aria-label="Data table 2.0">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--stroke)] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="tone-info tone-soft grid h-7 w-7 place-items-center rounded-lg"><ListFilter size={14} /></span>
          <h2 className="font-display text-sm font-semibold text-pri">Data Table 2.0</h2>
        </div>
        <div className="relative ml-auto w-52">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tri" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search anythingâ€¦"
            aria-label="Search rows"
            className="w-full rounded-lg border border-[var(--stroke)] bg-transparent py-1.5 pl-8 pr-3 text-xs text-pri placeholder:text-tri outline-none focus:border-[var(--cyan)]"
          />
        </div>
        <button className="btn" onClick={() => { downloadCSV('current-view.csv', [tableColumns.map((c) => c.label), ...sorted.slice(0, 2000).map((r) => tableColumns.map((c) => r[c.key]))]); logAction('Exported current view (CSV)') }}>
          <Download size={13} /> Current view
        </button>
        <button className="btn" onClick={() => { downloadCSV('full-raw.csv', [tableColumns.map((c) => c.label), ...rows.map((r) => tableColumns.map((c) => r[c.key]))]); logAction('Exported full raw dataset') }}>
          <FileText size={13} /> Full raw
        </button>
      </div>

      {/* batch bar */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[var(--stroke)]"
          >
            <div className="flex flex-wrap items-center gap-2 px-5 py-2">
              <span className="chip tone-info tone-soft">{selected.length} selected</span>
              {['active', 'trialing', 'past_due', 'canceled'].map((st) => (
                <button key={st} className="btn !py-1 text-[10px] capitalize" onClick={() => bulkStatus(st)}>{st}</button>
              ))}
              <button className="btn !py-1 text-[10px] tone-critical tone-soft" onClick={() => bulkCancel(selected)}>
                <Trash2 size={10} /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* windowed body */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex items-center border-b border-[var(--stroke)] px-4 text-[10px] uppercase tracking-widest text-tri" style={{ height: ROW_H }}>
          {tableColumns.map((c) => (
            <div
              key={c.key}
              className={cn('flex items-center gap-1 px-3', c.pinned && 'sticky z-10 bg-[var(--bg-1)]')}
              style={{
                width: c.key === 'id' ? 130 : c.key === 'customer' ? 170 : 120,
                ...(c.pinned === 'left' ? { left: c.key === 'id' ? 0 : 130, paddingLeft: c.key === 'id' ? 12 : 16 } : {}),
              }}
            >
              <button className="flex items-center gap-1 font-semibold hover:text-sec" onClick={() => toggleSort(c.key)}>
                {c.label}
                {sort.key === c.key && <ArrowUpDown size={10} className={sort.dir === -1 ? 'tone-cyan tone-text' : 'rotate-180'} />}
              </button>
            </div>
          ))}
          <div className="flex-1" />
          <span className="pr-4 tabular opacity-0">Ã—</span>
        </div>

        <div ref={scrollRef} className="h-[420px] overflow-auto overscroll-contain" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)} style={{ willChange: 'scroll-position' }}>
          <div style={{ height: total * ROW_H, position: 'relative' }}>
            <div style={{ transform: `translateY(${start * ROW_H}px)` }}>
              {view.map((r) => (
                <div
                  key={r.id}
                  className={cn('group/row flex items-center border-b border-[var(--stroke)] px-4 text-xs transition-colors', selectedIds.has(r.id) && 'tone-faint tone-info', favSet.has(r.id) && 'row-favourite')}
                  style={{ height: ROW_H }}
                >
                  {tableColumns.map((c) => {
                    const val = r[c.key]
                    const pinned = c.pinned === 'left'
                    return (
                      <div
                        key={c.key}
                        className={cn('flex items-center gap-2 px-3', pinned && 'sticky inset-y-0 z-[9] bg-[var(--bg-1)]')}
                        style={{
                          width: c.key === 'id' ? 150 : c.key === 'customer' ? 170 : 120,
                          ...(pinned ? { left: c.key === 'id' ? 0 : 140, paddingLeft: c.key === 'id' ? 12 : 16 } : {}),
                        }}
                        onDoubleClick={() => { if (c.key !== 'health' && c.key !== 'status') { setEditing(`${r.id}:${c.key}`); setEditVal(val) } }}
                      >
                        {c.key === 'id' && (
                          <>
                            <button
                              className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', selectedIds.has(r.id) ? 'tone-info tone-soft tone-border' : 'opacity-30 hover:opacity-70')}
                              onClick={() => toggleRow(r.id)}
                              aria-label={`Select ${r.id}`}
                              aria-pressed={selectedIds.has(r.id)}
                            >
                              {selectedIds.has(r.id) && <Check size={11} />}
                            </button>
                            <button
                              className="shrink-0 text-tri transition-colors hover:text-[var(--yellow)]"
                              data-macro
                              onClick={() => { toggleFavorite(r.id); logAction(`Favourite ${r.id} ${favSet.has(r.id) ? 'removed' : 'added'}`) }}
                              aria-label={`${favSet.has(r.id) ? 'Unfavourite' : 'Favourite'} ${r.id}`}
                              aria-pressed={favSet.has(r.id)}
                            >
                              <Star size={11} className={favSet.has(r.id) ? 'fill-[var(--yellow)] text-[var(--yellow)]' : ''} />
                            </button>
                          </>
                        )}
                        {editing === `${r.id}:${c.key}` ? (
                          <input
                            autoFocus
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(r.id, c.key)}
                            onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(r.id, c.key); if (e.key === 'Escape') setEditing(null) }}
                            className="w-full rounded border border-[var(--cyan)] bg-transparent px-1.5 py-1 text-xs outline-none"
                            aria-label={`Edit ${c.label}`}
                          />
                        ) : c.key === 'mrr' ? (
                          <span className="tabular font-mono text-pri">{fmtCurrency(Number(val), false)}</span>
                        ) : c.key === 'status' ? (
                          <ToneChip tone={statusTone(val)} className="text-[9px]">{val.replace('_', ' ')}</ToneChip>
                        ) : c.key === 'health' ? (
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-12 overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--text-2) 18%, transparent)' }}>
                              <div className="h-full" style={{ width: `${val}%`, background: val > 70 ? 'var(--green)' : val > 40 ? 'var(--yellow)' : 'var(--red)' }} />
                            </div>
                            <span className="tabular text-[10px] text-tri">{val}</span>
                          </div>
                        ) : (
                          <span className={cn('truncate', c.key === 'id' && 'tabular font-mono text-sec', c.key === 'customer' && 'pii font-medium text-pri')}>{val}</span>
                        )}
                      </div>
                    )
                  })}
                  <div className="flex-1" />
                  <div className="pr-4 opacity-0 transition-opacity group-hover/row:opacity-100">
                    <Pencil size={11} className="text-tri" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* status strip */}
        <div className="flex items-center justify-between border-t border-[var(--stroke)] px-5 py-2 text-[10px] text-tri">
          <span className="tabular">showing {start + 1}â€“{Math.min(end, total)} of {total.toLocaleString()} rows</span>
          <span className="flex items-center gap-1.5">virtualized window Â· 60fps proud <span className="live-dot tone-success tone-text" aria-hidden="true" /></span>
        </div>
      </div>
    </section>
  )
}

export function TableSkeleton() {
  return (
    <section className="card-3d flex h-full flex-col p-5" aria-hidden="true">
      <Skeleton className="h-8 w-60" />
      <Skeleton className="mt-4 h-[420px] w-full" />
    </section>
  )
}