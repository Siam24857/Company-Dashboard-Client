'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Users, FolderOpen, ClipboardList, Megaphone, Loader2, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

export default function AdminGlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    if (!open || query.trim().length < 2) { setResults(null); setLoading(false); return }
    setLoading(true)
    const t = setTimeout(() => {
      api.get('/analytics/search', { params: { q: query.trim() } })
        .then((res) => { setResults(res.data.results || {}) })
        .catch(() => { setResults({}) })
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [query, open])

  const navigate = (href) => {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  const sections = useMemo(() => {
    if (!results) return []
    const out = []
    if (results.users?.length) out.push({ label: 'Users', href: '/admin/users', icon: Users, items: results.users.map(u => ({ label: u.fullName, sub: u.email || u.role, href: '/admin/users', id: u.id })) })
    if (results.projects?.length) out.push({ label: 'Projects', href: '/admin/projects', icon: FolderOpen, items: results.projects.map(p => ({ label: p.title, sub: p.status, href: `/admin/projects/${p.id}`, id: p.id })) })
    if (results.tasks?.length) out.push({ label: 'Tasks', href: '/admin/projects', icon: ClipboardList, items: results.tasks.map(t => ({ label: t.title, sub: t.status, href: '/admin/projects', id: t.id })) })
    if (results.announcements?.length) out.push({ label: 'Announcements', href: '/admin/announcements', icon: Megaphone, items: results.announcements.map(a => ({ label: a.title, sub: a.priority, href: '/admin/announcements', id: a.id })) })
    return out
  }, [results])

  const hasResults = sections.length > 0

  return (
    <div className="relative" ref={searchRef}>
      <button onClick={() => setOpen(true)} className="flex h-9 items-center gap-2 rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] px-3 text-xs transition-colors hover:border-[var(--cyan)]/50" style={{ color: 'var(--text-2)' }}>
        <Search size={14} />
        <span className="hidden lg:inline">Search anything…</span>
        <kbd className="ml-2 hidden rounded border border-[var(--stroke)] px-1.5 py-0.5 text-[9px] font-mono sm:inline">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="fixed left-1/2 top-[10vh] w-[min(94vw,640px)] -translate-x-1/2 overflow-hidden rounded-2xl border"
              style={{ borderColor: 'var(--stroke)', background: 'var(--bg-2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              initial={{ y: -16, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -12, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b px-4 py-3.5" style={{ borderColor: 'var(--stroke)' }}>
                <Search size={16} style={{ color: 'var(--text-2)' }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users, projects, tasks, announcements…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-0)', caretColor: 'var(--cyan)' }}
                />
                {loading && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-2)' }} />}
                <button onClick={() => setOpen(false)} className="rounded border px-1.5 py-0.5 text-[10px]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}>ESC</button>
              </div>

              <div className="max-h-[55vh] overflow-y-auto p-2">
                {query.trim().length < 2 ? (
                  <div className="px-4 py-10 text-center text-xs" style={{ color: 'var(--text-2)' }}>
                    Type at least 2 characters to search the entire company.
                  </div>
                ) : !hasResults && !loading ? (
                  <div className="px-4 py-10 text-center text-xs" style={{ color: 'var(--text-2)' }}>
                    No results for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  sections.map((section, si) => (
                    <div key={si} className="mb-2">
                      <div className="px-3 py-1.5">
                        <p className="mono text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-2)' }}>{section.label}</p>
                      </div>
                      {section.items.map((item) => (
                        <button
                          key={item.id || item.label}
                          onClick={() => navigate(item.href)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--glass-soft)]"
                        >
                          <section.icon size={15} style={{ color: 'var(--cyan)' }} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium" style={{ color: 'var(--text-0)' }}>{item.label}</p>
                            <p className="truncate text-[11px]" style={{ color: 'var(--text-2)' }}>{item.sub}</p>
                          </div>
                          <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: 'var(--text-2)' }} />
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
