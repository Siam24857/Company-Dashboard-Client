'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Plus, FolderOpen, Calendar, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.projects)
    } catch (error) {
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  const getStatusColor = (status) => {
    const colors = {
      PLANNING: 'badge-muted',
      IN_PROGRESS: 'badge-teal',
      ON_HOLD: 'badge-orange',
      COMPLETED: 'badge-teal',
      CANCELLED: 'badge-orange',
    }
    return colors[status] || 'badge-muted'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-offwhite">Projects & Tasks</h1>
        <button onClick={() => router.push('/admin/projects/new')} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card hover:border-teal/30 transition-colors cursor-pointer" onClick={() => router.push(`/admin/projects/${project.id}`)}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-offwhite">{project.title}</h3>
                <p className="text-sm text-muted mt-1">{project.department?.replace(/_/g, ' ')}</p>
              </div>
              <span className={`badge ${getStatusColor(project.status)}`}>{project.status?.replace(/_/g, ' ')}</span>
            </div>
            <p className="text-sm text-muted mb-4 line-clamp-2">{project.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1"><Calendar size={16} />{new Date(project.startDate).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Clock size={16} />{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{project.members?.length || 0} members</span>
                <span className="text-sm text-muted">{project.tasks?.length || 0} tasks</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
