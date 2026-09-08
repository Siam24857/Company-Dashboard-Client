'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  ArrowRight, CheckCircle2, Target, Users, Clock, Plus, X, Loader2,
  List, Columns3, Trash2, UserPlus,
} from 'lucide-react'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

const STATUS_COLORS = {
  TODO: 'bg-gray-500/10 text-gray-400',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
  IN_REVIEW: 'bg-amber-500/10 text-amber-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400',
  REJECTED: 'bg-red-500/10 text-red-400',
}

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'REJECTED']
const BOARD_COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']

const EMPTY_FORM = { title: '', description: '', assignee: '', priority: 'MEDIUM', status: 'TODO', dueDate: '' }

export default function AdminProjectDetailPage() {
  const params = useParams()
  const projectId = params?.id || ''
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [view, setView] = useState('list')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [changingStatus, setChangingStatus] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetchAll = useCallback(async () => {
    try {
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`),
        api.get('/users?limit=100').catch(() => ({ data: { users: [] } })),
      ])
      setProject(projectRes.data.project)
      setTasks(tasksRes.data.tasks || [])
      setUsers(usersRes.data.users || [])
      setError(false)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const createTask = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Task title is required')
      return
    }
    setSaving(true)
    try {
      const res = await api.post(`/projects/${projectId}/tasks`, {
        title: form.title,
        description: form.description || undefined,
        assignedTo: form.assignee || undefined,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || undefined,
      })
      toast.success('Task created successfully')
      setTasks(prev => [res.data.task, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (taskId, status) => {
    setChangingStatus(taskId)
    try {
      const res = await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status })
      setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t))
      toast.success(`Task marked as ${status.replace(/_/g, ' ')}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task status')
    } finally {
      setChangingStatus(null)
    }
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    setDeleting(taskId)
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`)
      toast.success('Task deleted')
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task')
    } finally {
      setDeleting(null)
    }
  }

  const userName = (id) => users.find(u => u.id === id)?.fullName || users.find(u => u.id === id)?.email || null

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
        <ErrorState title="Project not found" message="Could not load project details." onRetry={fetchAll} />
      </div>
    )
  }

  const statusStat = [
    { label: 'Status', value: project.status?.replace(/_/g, ' '), icon: CheckCircle2, tone: 'cyan' },
    { label: 'Progress', value: `${project.progress || 0}%`, icon: Target, tone: 'green' },
    { label: 'Members', value: project.members?.length || 0, icon: Users, tone: 'blue' },
    { label: 'Tasks', value: tasks.length, icon: CheckCircle2, tone: 'purple' },
  ]

  const renderTaskMeta = (task) => (
    <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: 'var(--text-2)' }}>
      {task.priority && <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold bg-gray-500/10">{task.priority}</span>}
      {task.dueDate && <span className="flex items-center gap-1"><Clock size={11} /> {new Date(task.dueDate).toLocaleDateString()}</span>}
      {userName(task.assignedTo) && <span className="flex items-center gap-1"><UserPlus size={11} /> {userName(task.assignedTo)}</span>}
    </div>
  )

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
        <button onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM) }} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
          {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? 'Close' : 'New Task'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statusStat.map((s, i) => (
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

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm font-bold" style={{ color: 'var(--text-0)' }}>Tasks ({tasks.length})</h2>
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--stroke)' }}>
            <button onClick={() => setView('list')} className={cn('flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium transition-colors', view === 'list' ? 'text-[var(--cyan)]' : 'hover:bg-[var(--glass-soft)]')} style={{ color: view === 'list' ? 'var(--cyan)' : 'var(--text-2)' }}>
              <List size={12} /> List
            </button>
            <button onClick={() => setView('board')} className={cn('flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium transition-colors', view === 'board' ? 'text-[var(--cyan)]' : 'hover:bg-[var(--glass-soft)]')} style={{ color: view === 'board' ? 'var(--cyan)' : 'var(--text-2)' }}>
              <Columns3 size={12} /> Board
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={createTask} className="mt-4 rounded-xl border p-4 space-y-4" style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)' }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-1)' }}>Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--cyan)]" style={{ borderColor: 'var(--stroke)', background: 'var(--glass)', color: 'var(--text-0)' }} placeholder="Task title" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-1)' }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--cyan)]" style={{ borderColor: 'var(--stroke)', background: 'var(--glass)', color: 'var(--text-0)' }} placeholder="Task description" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-1)' }}>Assignee {users.length === 0 && '(no users yet)'}</label>
                <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: 'var(--stroke)', background: 'var(--glass)', color: 'var(--text-0)' }}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.role?.replace(/_/g, ' ')})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-1)' }}>Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: 'var(--stroke)', background: 'var(--glass)', color: 'var(--text-0)' }}>
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-1)' }}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: 'var(--stroke)', background: 'var(--glass)', color: 'var(--text-0)' }}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-1)' }}>Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: 'var(--stroke)', background: 'var(--glass)', color: 'var(--text-0)' }} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} {saving ? 'Creating...' : 'Create Task'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="rounded-lg border px-4 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-1)' }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-4">
          {tasks.length === 0 ? (
            <EmptyState title="No tasks yet" description="Create a task to get started." icon={Target} />
          ) : view === 'list' ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex flex-wrap items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30" style={{ borderColor: 'var(--stroke)' }}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{task.title}</h3>
                      <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', STATUS_COLORS[task.status] || STATUS_COLORS.TODO)}>{task.status?.replace(/_/g, ' ')}</span>
                    </div>
                    {task.description && <p className="mt-1 text-[11px] line-clamp-2" style={{ color: 'var(--text-2)' }}>{task.description}</p>}
                    <div className="mt-2">{renderTaskMeta(task)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value)} disabled={changingStatus === task.id} className="rounded-lg border px-2 py-1.5 text-[11px] outline-none disabled:opacity-60" style={{ borderColor: 'var(--stroke)', background: 'var(--glass)', color: 'var(--text-0)' }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <button onClick={() => deleteTask(task.id)} disabled={deleting === task.id} className="rounded-lg border px-2 py-1.5 text-[11px] transition-colors hover:bg-[var(--glass-soft)] disabled:opacity-60" style={{ borderColor: 'var(--stroke)', color: 'var(--red)' }}>
                      {deleting === task.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {BOARD_COLUMNS.map((col) => (
                <div key={col} className="rounded-xl border p-3" style={{ borderColor: 'var(--stroke)', background: 'var(--glass)' }}>
                  <p className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                    {col.replace(/_/g, ' ')} <span className="rounded-full px-1.5 py-0.5 text-[9px]" style={{ background: 'var(--glass-soft)' }}>{tasks.filter(t => t.status === col).length}</span>
                  </p>
                  <div className="space-y-2">
                    {tasks.filter(t => t.status === col).length === 0 ? (
                      <p className="py-4 text-center text-[10px]" style={{ color: 'var(--text-3)' }}>No tasks</p>
                    ) : tasks.filter(t => t.status === col).map((task) => (
                      <div key={task.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-0)' }}>{task.title}</p>
                          <button onClick={() => deleteTask(task.id)} className="text-[10px] transition-colors hover:text-[var(--red)]" style={{ color: 'var(--text-3)' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {task.priority && <span className="rounded-full bg-gray-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-gray-400">{task.priority}</span>}
                        <div className="mt-2">{renderTaskMeta(task)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}