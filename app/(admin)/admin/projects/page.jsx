'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import {
  RefreshCw, Plus, Search, Filter,
  Loader2, ChevronDown, Target,
  CheckCircle2, Clock, AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [q, setQ] = useState('')

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.projects || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const statusColors = {
    PLANNING: 'bg-amber-500/10 text-amber-400',
    IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
    ON_HOLD: 'bg-gray-500/10 text-gray-400',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400',
    CANCELLED: 'bg-red-500/10 text-red-400',
  }

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Failed to load projects" message="Could not reach the projects server." onRetry={fetchProjects} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Projects</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Projects & Tasks</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Manage all projects and their tasks.</p>
        </div>
        <button onClick={() => router.push('/admin/projects/new')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
          <Plus size={14} /> New Project
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Projects', value: projects.length, icon: Target, tone: 'cyan' },
          { label: 'Active', value: projects.filter(p => p.status === 'IN_PROGRESS').length, icon: CheckCircle2, tone: 'green' },
          { label: 'Planning', value: projects.filter(p => p.status === 'PLANNING').length, icon: Clock, tone: 'blue' },
          { label: 'Completed', value: projects.filter(p => p.status === 'COMPLETED').length, icon: CheckCircle2, tone: 'emerald' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{s.label}</span>
              <s.icon size={14} style={{ color: 'var(--text-2)' }} />
            </div>
            <div className="mt-2 text-lg font-bold" style={{ color: 'var(--text-0)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>All Projects</h2>
        <div className="space-y-2">
          {projects.length === 0 ? (
            <EmptyState title="No projects" description="Create your first project to get started." icon={Target} />
          ) : (
            projects.map((project) => (
              <div key={project.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                  <Target size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{project.title}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', statusColors[project.status] || 'bg-gray-500/10 text-gray-400')}>
                      {project.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    {project.department?.replace(/_/g, ' ')} · {project.members?.length || 0} members · {project._count?.tasks || 0} tasks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {project.progress && (
                    <div className="h-2 w-20 overflow-hidden rounded-full" style={{ background: 'var(--stroke)' }}>
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: `${project.progress}%` }} />
                    </div>
                  )}
                  <a href={`/admin/projects/${project.id}`} className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--cyan)' }}>
                    View <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}