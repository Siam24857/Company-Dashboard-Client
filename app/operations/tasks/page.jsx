'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store'
import { FileText, Send, X, ChevronDown, ChevronUp } from 'lucide-react'

export default function OperationsTasksPage() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  const [expandedTask, setExpandedTask] = useState(null)
  const [submissionForm, setSubmissionForm] = useState({
    summary: '',
    completedWork: '',
    problems: '',
    timeSpentMinutes: '',
  })
  const [attachment, setAttachment] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await api.get('/projects')
      const projects = res.data.projects || []
      const allTasks = []
      for (const project of projects) {
        const taskRes = await api.get(`/projects/${project.id}/tasks`)
        const projectTasks = taskRes.data.tasks || []
        allTasks.push(...projectTasks.map(t => ({ ...t, projectTitle: project.title, projectId: project.id })))
      }
      setTasks(allTasks)
    } catch (error) {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleAttachmentUpload = async () => {
    if (!attachment) return null
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', attachment)
      const res = await api.post('/upload/task-evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { url: res.data.url, publicId: res.data.publicId }
    } catch (error) {
      toast.error('Failed to upload attachment')
      return null
    } finally {
      setUploading(false)
    }
  }

  const submitTask = async (taskId) => {
    if (!submissionForm.summary.trim() || !submissionForm.completedWork.trim()) {
      toast.error('Summary and completed work are required')
      return
    }

    setSubmitting(taskId)
    try {
      let screenshotUrl = null
      let screenshotPublicId = null

      if (attachment) {
        const uploadResult = await handleAttachmentUpload()
        if (uploadResult) {
          screenshotUrl = uploadResult.url
          screenshotPublicId = uploadResult.publicId
        }
      }

      await api.post(`/tasks/${taskId}/submit`, {
        summary: submissionForm.summary,
        completedWork: submissionForm.completedWork,
        problems: submissionForm.problems || undefined,
        timeSpentMinutes: submissionForm.timeSpentMinutes ? parseInt(submissionForm.timeSpentMinutes) : undefined,
        screenshotUrl: screenshotUrl || undefined,
        screenshotPublicId: screenshotPublicId || undefined,
      })

      toast.success('Task submitted successfully')
      setExpandedTask(null)
      setSubmissionForm({ summary: '', completedWork: '', problems: '', timeSpentMinutes: '' })
      setAttachment(null)
      fetchTasks()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit task')
    } finally {
      setSubmitting(null)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      TODO: 'badge-muted',
      IN_PROGRESS: 'badge-orange',
      IN_REVIEW: 'badge-orange',
      COMPLETED: 'badge-teal',
      REJECTED: 'badge-orange',
    }
    return colors[status] || 'badge-muted'
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">My Tasks</h1>
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="card text-center py-12">
            <FileText size={48} className="mx-auto text-muted mb-4" />
            <p className="text-muted">No tasks assigned yet</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-offwhite">{task.title}</h3>
                    <span className={`badge ${getStatusColor(task.status)}`}>{task.status?.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-muted mb-2">{task.description || 'No description'}</p>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span>Priority: {task.priority}</span>
                    {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                    {task.projectTitle && <span>Project: {task.projectTitle}</span>}
                  </div>
                  {task.submissions && task.submissions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted mb-1">Previous submissions: {task.submissions.length}</p>
                      <div className="flex gap-2">
                        {task.submissions.map((sub) => (
                          <span key={sub.id} className={`badge text-xs ${sub.status === 'APPROVED' ? 'badge-teal' : sub.status === 'REJECTED' ? 'badge-orange' : 'badge-muted'}`}>
                            {sub.status}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {task.status !== 'COMPLETED' && task.status !== 'IN_REVIEW' && (
                  <button
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <Send size={16} />
                    Submit Work
                    {expandedTask === task.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>
              {expandedTask === task.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Summary *</label>
                    <input
                      type="text"
                      value={submissionForm.summary}
                      onChange={(e) => setSubmissionForm({ ...submissionForm, summary: e.target.value })}
                      className="input w-full"
                      placeholder="Brief summary of your work"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Completed Work *</label>
                    <textarea
                      value={submissionForm.completedWork}
                      onChange={(e) => setSubmissionForm({ ...submissionForm, completedWork: e.target.value })}
                      rows={4}
                      className="input w-full"
                      placeholder="Describe what you completed..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Problems Encountered</label>
                      <textarea
                        value={submissionForm.problems}
                        onChange={(e) => setSubmissionForm({ ...submissionForm, problems: e.target.value })}
                        rows={2}
                        className="input w-full"
                        placeholder="Any issues faced..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time Spent (minutes)</label>
                      <input
                        type="number"
                        value={submissionForm.timeSpentMinutes}
                        onChange={(e) => setSubmissionForm({ ...submissionForm, timeSpentMinutes: e.target.value })}
                        className="input w-full"
                        placeholder="e.g. 120"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Attachment</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        onChange={(e) => setAttachment(e.target.files[0])}
                        accept="image/*,.pdf,.doc,.docx"
                        className="input w-full"
                      />
                      {attachment && (
                        <button onClick={() => setAttachment(null)} className="text-orange">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    {attachment && <p className="text-xs text-muted mt-1">{attachment.name}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => submitTask(task.id)}
                      disabled={submitting === task.id || uploading}
                      className="btn-primary flex items-center gap-2"
                    >
                      {submitting === task.id ? 'Submitting...' : uploading ? 'Uploading...' : 'Submit Work'}
                    </button>
                    <button
                      onClick={() => { setExpandedTask(null); setSubmissionForm({ summary: '', completedWork: '', problems: '', timeSpentMinutes: '' }); setAttachment(null) }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
