'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'

export default function UserProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${params.id}`)
      setProject(res.data.project)
    } catch (error) {
      toast.error('Failed to fetch project')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-secondary"><ArrowLeft size={20} /></button>
        <h1 className="text-3xl font-bold text-offwhite">{project?.title}</h1>
      </div>
      <div className="card">
        <p className="text-muted">{project?.description}</p>
        <div className="flex gap-2 mt-4">
          <span className={`badge ${project?.status === 'IN_PROGRESS' ? 'badge-teal' : 'badge-orange'}`}>{project?.status}</span>
          <span className="badge badge-muted">{project?.department?.replace(/_/g, ' ')}</span>
        </div>
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Team Members</h3>
        <div className="space-y-3">
          {project?.members?.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-offwhite/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-teal text-sm font-semibold">
                  {member.user.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{member.user.fullName}</p>
                  <p className="text-xs text-muted">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Tasks</h3>
        <div className="space-y-3">
          {project?.tasks?.map((task) => (
            <div key={task.id} className="p-4 rounded-lg bg-offwhite/5 border border-border flex items-center justify-between">
              <div>
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-sm text-muted">{task.description}</p>
              </div>
              <span className={`badge ${task.status === 'DONE' ? 'badge-teal' : task.status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-muted'}`}>{task.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
