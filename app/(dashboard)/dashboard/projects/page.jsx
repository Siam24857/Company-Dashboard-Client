'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { FolderOpen, ChevronRight } from 'lucide-react'

export default function UserProjectsPage() {
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">My Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card hover:border-teal/30 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <FolderOpen size={24} className="text-teal" />
                <h3 className="font-semibold text-offwhite">{project.title}</h3>
              </div>
            </div>
            <p className="text-sm text-muted mb-4 line-clamp-2">{project.description}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className={`badge ${project.status === 'IN_PROGRESS' ? 'badge-teal' : 'badge-orange'}`}>{project.status?.replace(/_/g, ' ')}</span>
              <span className="badge badge-muted">{project.department?.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-muted">{project.members?.length || 0} members</span>
              <ChevronRight size={20} className="text-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
