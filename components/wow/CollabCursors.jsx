'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useTeamStore from '@/store/team.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 75 · Shared cursors — see teammates move around the board live. */
export default function CollabCursors() {
  const enabled = useFlagsStore((s) => !!s.flags['collab-cursors']?.on)
  const users = useTeamStore((s) => s.users)
  const moveCursor = useTeamStore((s) => s.moveCursor)
  const [pos, setPos] = useState({})

  useEffect(() => {
    if (!enabled) return
    const peers = users.filter((u) => u.id !== 'u_ava' && u.online)
    if (!peers.length) return
    const tick = setInterval(() => {
      setPos((prev) => {
        const n = {}
        for (const u of peers) {
          const p = prev[u.id] || { x: Math.random() * 70, y: Math.random() * 70 }
          n[u.id] = {
            x: Math.min(92, Math.max(4, p.x + (Math.random() - 0.5) * 12)),
            y: Math.min(88, Math.max(4, p.y + (Math.random() - 0.5) * 10)),
          }
          moveCursor(u.id, n[u.id].x, n[u.id].y)
        }
        return n
      })
    }, 2200)
    return () => clearInterval(tick)
  }, [enabled, users])

  if (!enabled) return null
  const peers = users.filter((u) => u.id !== 'u_ava' && u.online)

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden="true">
      {peers.map((u) => {
        const p = pos[u.id] || { x: 40, y: 40 }
        return (
          <motion.span
            key={u.id}
            className="collab-cursor absolute flex items-center gap-1.5"
            transition={{ duration: 0.4 }}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24">
              <path d="M4 2 L20 12 L12 13 L8 20 Z" fill={u.color} />
            </svg>
            <span className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: u.color, color: '#04070b' }}>{u.name}</span>
          </motion.span>
        )
      })}
    </div>
  )
}