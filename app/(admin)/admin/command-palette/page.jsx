'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'

export default function AdminCommandPalettePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const commands = [
    { label: 'New Project', icon: '📁', category: 'Projects' },
    { label: 'Create Team', icon: '👥', category: 'Teams' },
    { label: 'View Analytics', icon: '📊', category: 'Analytics' },
    { label: 'Open Webhooks', icon: '🔗', category: 'Enterprise' },
    { label: 'Manage KPIs', icon: '🎯', category: 'Enterprise' },
    { label: 'View Audit Logs', icon: '📋', category: 'Security' },
    { label: 'Check System Health', icon: '💚', category: 'System' },
    { label: 'Toggle Feature Flag', icon: '🎌', category: 'Enterprise' },
    { label: 'Create Approval', icon: '✅', category: 'Approvals' },
    { label: 'View Incidents', icon: '🚨', category: 'Enterprise' },
    { label: 'Run Background Job', icon: '⚡', category: 'Enterprise' },
    { label: 'Open Automation', icon: '🤖', category: 'Enterprise' },
    { label: 'View Employees', icon: '👤', category: 'People' },
    { label: 'View Risks', icon: '⚠️', category: 'Projects' },
    { label: 'Manage Milestones', icon: '🏁', category: 'Projects' },
    { label: 'Open Data Quality', icon: '🔍', category: 'Enterprise' },
    { label: 'View Approvals', icon: '📝', category: 'Approvals' },
    { label: 'Open Dashboard Builder', icon: '📐', category: 'Enterprise' },
  ]

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()))
    : commands

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="skeleton h-32 w-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Command Palette</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Command Center</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Search and execute platform commands quickly.</p>
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: 'var(--stroke)' }}>
          <span className="text-lg" style={{ color: 'var(--text-2)' }}>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-2)]"
            style={{ color: 'var(--text-0)' }}
            autoFocus
          />
          <kbd className="rounded border px-2 py-0.5 text-[10px]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}>ESC</kbd>
        </div>

        <div className="mt-4 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--text-2)' }}>No results found.</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={i}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-[var(--glass-soft)]"
                style={{ color: 'var(--text-0)' }}
                onClick={() => toast.info(`Executing: ${cmd.label}`)}
              >
                <span className="text-lg">{cmd.icon}</span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-medium">{cmd.label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>{cmd.category}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}