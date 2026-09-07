'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, Users, UserCheck, UserX, Clock,
  Briefcase, Target, ArrowRight, Search, Filter,
  Loader2, AlertTriangle, Shield, Calendar,
} from 'lucide-react'
import { cn, fmtNum } from '@/lib/utils'
import useDashboardStore from '@/store/dashboard.store'
import StatCard from '@/components/ui/StatCard'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [q, setQ] = useState('')
  const setCommandOpen = useDashboardStore((s) => s.setCommandOpen)

  const fetchTeams = useCallback(async () => {
    try {
      const res = await api.get('/teams')
      setTeams(res.data.teams || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTeams() }, [fetchTeams])

  const handleCreateTeam = async () => {
    const name = prompt('Enter team name:')
    if (!name) return
    try {
      const res = await api.post('/teams', { name, department: 'ENGINEERING' })
      toast.success(`Team "${name}" created`)
      fetchTeams()
    } catch (err) {
      toast.error('Failed to create team')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Failed to load teams" message="Could not reach the teams server." onRetry={fetchTeams} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Team Management</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Teams</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Manage team workspaces, members, and departments.</p>
        </div>
        <button onClick={handleCreateTeam} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
          <Plus size={14} /> New Team
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Teams', value: teams.length, icon: Users, tone: 'cyan' },
          { label: 'Active Members', value: teams.reduce((s, t) => s + (t._count?.members || 0), 0), icon: UserCheck, tone: 'green' },
          { label: 'Avg Capacity', value: Math.round(teams.reduce((s, t) => s + (t.memberCount || 0), 0) / Math.max(teams.length, 1)), icon: Target, tone: 'blue' },
          { label: 'Departments', value: [...new Set(teams.map(t => t.department))].length, icon: Briefcase, tone: 'purple' },
        ].map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm font-bold" style={{ color: 'var(--text-0)' }}>All Teams</h2>
          <div className="flex items-center gap-2">
            <Search size={14} style={{ color: 'var(--text-2)' }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search teams..."
              className="rounded-lg border bg-transparent px-3 py-1.5 text-xs outline-none focus:border-[var(--cyan)]"
              style={{ borderColor: 'var(--stroke)', color: 'var(--text-0)', width: 200 }}
            />
          </div>
        </div>
        <div className="space-y-3">
          {teams.length === 0 ? (
            <EmptyState title="No teams yet" description="Create your first team to get started." icon={Users} action={<button onClick={handleCreateTeam} className="btn btn-primary text-xs">Create Team</button>} />
          ) : (
            teams.map((team) => (
              <div key={team.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                  <Users size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{team.name}</h3>
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>{team.department}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    {team._count?.members || 0} members · {team._count?.projects || 0} projects
                  </p>
                </div>
                <a href={`/admin/teams/${team.id}`} className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--cyan)' }}>
                  Manage <ArrowRight size={12} />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}