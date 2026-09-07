'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'

export default function AdminProjectDetailPage() {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const projectId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : ''

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}`)
      setProject(res.data.project)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchProject() }, [fetchProject])

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Project not found" message="Could not load project details." onRetry={fetchProject} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <a href="/admin/projects" className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--cyan)' }}>
            Projects <ArrowRight size={14} />
          </a>
          <span className="text-xs" style={{ color: 'var(--text-2)' }}>/</span>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>{project.title}</h1>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Status', value: project.status?.replace(/_/g, ' '), icon: CheckCircle2, tone: 'cyan' },
          { label: 'Progress', value: `${project.progress || 0}%`, icon: Target, tone: 'green' },
          { label: 'Members', value: project.members?.length || 0, icon: Users, tone: 'blue' },
          { label: 'Tasks', value: project._count?.tasks || 0, icon: Target, tone: 'purple' },
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
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Project Details</h2>
        <p className="text-sm" style={{ color: 'var(--text-1)' }}>{project.description || 'No description provided.'}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stroke)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>Start Date</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-0)' }}>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stroke)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>Due Date</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-0)' }}>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}