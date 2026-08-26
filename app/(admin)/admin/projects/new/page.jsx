'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { ArrowLeft, Plus, X } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'PLANNING',
    priority: 'MEDIUM',
    department: 'BUSINESS_MANAGEMENT',
    startDate: '',
    dueDate: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users?limit=100')
      setUsers(res.data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const addMember = (userId) => {
    if (!selectedMembers.find(m => m.userId === userId)) {
      setSelectedMembers([...selectedMembers, { userId, role: 'Member' }])
    }
  }

  const removeMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(m => m.userId !== userId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required')
      return
    }
    if (!form.startDate) {
      toast.error('Start date is required')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/projects', {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        department: form.department,
        startDate: form.startDate,
        dueDate: form.dueDate || undefined,
        members: selectedMembers.length > 0 ? selectedMembers : undefined,
      })
      toast.success('Project created successfully')
      router.push(`/admin/projects/${res.data.project.id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user?.fullName || user?.email || 'Unknown'
  }

  const departments = [
    { value: 'BUSINESS_MANAGEMENT', label: 'Business Management' },
    { value: 'SALES_MANAGEMENT', label: 'Sales Management' },
    { value: 'OPERATIONS_DEVELOPER', label: 'Operations Developer' },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-secondary"><ArrowLeft size={20} /></button>
        <h1 className="text-3xl font-bold text-offwhite">Create New Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Project Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input w-full"
            placeholder="Enter project title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input w-full"
            rows={4}
            placeholder="Describe the project"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Department *</label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="input w-full"
            >
              {departments.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="input w-full"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input w-full"
            >
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Date *</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="input w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Team Members</label>
          <select
            onChange={(e) => { if (e.target.value) { addMember(e.target.value); e.target.value = '' } }}
            className="input w-full"
          >
            <option value="">Select a member to add...</option>
            {users
              .filter(u => !selectedMembers.find(m => m.userId === u.id))
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.role?.replace(/_/g, ' ')})
                </option>
              ))}
          </select>
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedMembers.map((member) => (
                <span key={member.userId} className="badge badge-teal flex items-center gap-1">
                  {getUserName(member.userId)}
                  <button type="button" onClick={() => removeMember(member.userId)} className="hover:text-orange ml-1">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
