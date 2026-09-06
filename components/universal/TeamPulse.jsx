'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useTeamStore from '@/store/team.store'
import useFlagsStore from '@/store/flags.store'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Feature 8 — Team Pulse. Ring of who's online now; hover exposes their active filter. */
export default function TeamPulse() {
  const users = useTeamStore((s) => s.users)
  const filters = useTeamStore((s) => s.remoteFilters)
  const on = useFlagsStore((s) => !!s.flags['team-pulse']?.on)
  const [open, setOpen] = useState(false)
  const online = users.filter((u) => u.online)

  useEffect(() => {
    if (!on) return undefined
    const t = setInterval(() => useTeamStore.setState((s) => ({ users: s.users }) ), 15000)
    return () => clearInterval(t)
  }, [on])

  if (!on) return null

  return (
    <div className="relative">
      <button
        className="icon-btn"
        aria-label={`${online.length} colleagues online`}
        onClick={() => setOpen((o) => !o)}
      >
        <Users size={15} />
        <span className="chip absolute -right-1 -top-1 !px-1 !py-0 text-[8px] tone-success tone-text">{online.length}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="glass-strong absolute right-0 top-10 z-50 w-60 rounded-2xl border border-[var(--stroke)] p-3 shadow-2xl">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-tri">
              <span className="live-dot" style={{ background: 'var(--green)' }} /> live viewers
            </p>
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className={cn('flex items-center gap-2 rounded-lg px-2 py-1.5', !u.online && 'opacity-45')}>
                  <span className="grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold" style={{ background: u.color, color: '#04070b' }}>
                    {u.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-pri">{u.name}</p>
                    <p className="truncate text-[9px] text-tri">{filters[u.id] || u.page}</p>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: u.online ? 'var(--green)' : 'var(--stroke)' }} aria-hidden="true" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}