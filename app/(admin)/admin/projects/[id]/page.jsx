'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { ArrowLeft, Plus, Trash2, ExternalLink } from 'lucide-react'

export default function AdminProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', assignedTo: '', dueDate: '' })

  useEffect(() => {
    fetchProject()
    fetchUsers()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${params.id}`)
      setProject(res.data.project)
      setTasks(res.data.project.tasks || [])
    } catch (error) {
      toast.error('Failed to fetch project')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users?limit=100')
      setUsers(res.data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/projects/${params.id}/tasks`, {
        title: taskForm.title,
        description: taskForm.description || undefined,
        priority: taskForm.priority,
        assignedTo: taskForm.assignedTo || undefined,
        dueDate: taskForm.dueDate || undefined,
      })
      toast.success('Task added successfully')
      setShowTaskForm(false)
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', assignedTo: '', dueDate: '' })
      fetchProject()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add task')
    }
  }

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await api.delete(`/projects/${params.id}/tasks/${taskId}`)
      toast.success('Task deleted successfully')
      fetchProject()
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const getAssignedUserName = (userId) => {
    if (!userId) return 'Unassigned'
    const user = users.find(u => u.id === userId)
    return user?.fullName || user?.email || 'Unknown'
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
          <span className={`badge ${project?.status === 'IN_PROGRESS' ? 'badge-teal' : 'badge-orange'}`}>{project?.status?.replace(/_/g, ' ')}</span>
          <span className="badge badge-muted">{project?.department?.replace(/_/g, ' ')}</span>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Tasks ({tasks.length})</h3>
          <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Add Task
          </button>
        </div>
        {showTaskForm && (
          <form onSubmit={addTask} className="mb-6 p-4 rounded-lg bg-offwhite/5 border border-border space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Task Title *</label>
              <input placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="input w-full" rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="input w-full">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Assign To</label>
                <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} className="input w-full">
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.fullName} ({user.role?.replace(/_/g, ' ')})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="input w-full" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Add Task</button>
              <button type="button" onClick={() => { setShowTaskForm(false); setTaskForm({ title: '', description: '', priority: 'MEDIUM', assignedTo: '', dueDate: '' }) }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-muted text-center py-6">No tasks yet. Click "Add Task" to create one.</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg bg-offwhite/5 border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <span className={`badge text-xs ${task.status === 'COMPLETED' ? 'badge-teal' : task.status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-muted'}`}>
                        {task.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {task.description && <p className="text-sm text-muted mb-2">{task.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span>Priority: {task.priority}</span>
                      <span>Assigned: {getAssignedUserName(task.assignedTo)}</span>
                      {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                    {task.submissions && task.submissions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted">Submissions: {task.submissions.length}</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-orange hover:text-orange/80 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
