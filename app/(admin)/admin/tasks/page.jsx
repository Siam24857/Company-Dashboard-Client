'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { FileText, Check, X, ExternalLink } from 'lucide-react'

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tasks')
  const [reviewingSubmission, setReviewingSubmission] = useState(null)
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const projectsRes = await api.get('/projects')
      const projects = projectsRes.data.projects || []
      const allTasks = []
      const allSubmissions = []

      for (const project of projects) {
        const taskRes = await api.get(`/projects/${project.id}/tasks`)
        const projectTasks = taskRes.data.tasks || []
        allTasks.push(...projectTasks)

        for (const task of projectTasks) {
          try {
            const subRes = await api.get(`/tasks/${task.id}/submissions`)
            const taskSubmissions = subRes.data.submissions || []
            allSubmissions.push(...taskSubmissions.map(s => ({
              ...s,
              taskTitle: task.title,
              projectTitle: project.title,
            })))
          } catch (e) {
            // Skip tasks where we can't fetch submissions
          }
        }
      }

      setTasks(allTasks)
      setSubmissions(allSubmissions)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const reviewSubmission = async (submissionId, status) => {
    setReviewing(true)
    try {
      await api.patch(`/submissions/${submissionId}/review`, {
        status,
        adminFeedback: reviewFeedback || undefined,
      })
      toast.success(`Submission ${status.toLowerCase()} successfully`)
      setReviewingSubmission(null)
      setReviewFeedback('')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review submission')
    } finally {
      setReviewing(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      TODO: 'badge-muted',
      IN_PROGRESS: 'badge-orange',
      IN_REVIEW: 'badge-orange',
      COMPLETED: 'badge-teal',
      REJECTED: 'badge-orange',
      PENDING: 'badge-muted',
      APPROVED: 'badge-teal',
      CHANGES_REQUESTED: 'badge-orange',
    }
    return colors[status] || 'badge-muted'
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">Task Management</h1>
      <div className="flex gap-4 border-b border-border">
        <button onClick={() => setActiveTab('tasks')} className={`pb-3 px-1 font-medium ${activeTab === 'tasks' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}>
          All Tasks ({tasks.length})
        </button>
        <button onClick={() => setActiveTab('submissions')} className={`pb-3 px-1 font-medium ${activeTab === 'submissions' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}>
          Submissions ({submissions.length})
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="card overflow-x-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-muted mb-4" />
              <p className="text-muted">No tasks created yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted font-medium">Title</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Project</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Priority</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Due Date</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-border hover:bg-offwhite/[0.03]">
                    <td className="py-3 px-4 font-medium">{task.title}</td>
                    <td className="py-3 px-4 text-muted">{task.projectTitle || '-'}</td>
                    <td className="py-3 px-4 text-muted">{task.priority}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusColor(task.status)}`}>{task.status?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-3 px-4 text-muted">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4 text-muted">{task.submissions?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="card text-center py-12">
              <FileText size={48} className="mx-auto text-muted mb-4" />
              <p className="text-muted">No submissions yet</p>
            </div>
          ) : (
            submissions.map((submission) => (
              <div key={submission.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-offwhite">{submission.taskTitle}</h3>
                      <span className={`badge ${getStatusColor(submission.status)}`}>{submission.status?.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm text-muted mb-1">By: {submission.user?.fullName || submission.user?.email || 'Unknown'}</p>
                    <p className="text-sm text-muted mb-2">Project: {submission.projectTitle}</p>
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-xs text-muted font-medium">Summary:</p>
                        <p className="text-sm">{submission.summary}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted font-medium">Completed Work:</p>
                        <p className="text-sm">{submission.completedWork}</p>
                      </div>
                      {submission.problems && (
                        <div>
                          <p className="text-xs text-muted font-medium">Problems:</p>
                          <p className="text-sm">{submission.problems}</p>
                        </div>
                      )}
                      {submission.timeSpentMinutes && (
                        <p className="text-xs text-muted">Time spent: {submission.timeSpentMinutes} minutes</p>
                      )}
                      {submission.screenshotUrl && (
                        <a href={submission.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-teal text-sm flex items-center gap-1 hover:underline">
                          <ExternalLink size={14} /> View Attachment
                        </a>
                      )}
                      {submission.adminFeedback && (
                        <div className="mt-2 p-2 rounded bg-offwhite/5 border border-border">
                          <p className="text-xs text-muted font-medium">Admin Feedback:</p>
                          <p className="text-sm">{submission.adminFeedback}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-2">Submitted: {new Date(submission.createdAt).toLocaleString()}</p>
                  </div>
                  {submission.status === 'PENDING' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setReviewingSubmission(submission.id)}
                        className="btn-primary text-sm flex items-center gap-1"
                      >
                        <Check size={16} /> Review
                      </button>
                    </div>
                  )}
                </div>
                {reviewingSubmission === submission.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Feedback (optional)</label>
                      <textarea
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value)}
                        rows={3}
                        className="input w-full"
                        placeholder="Provide feedback for this submission..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => reviewSubmission(submission.id, 'APPROVED')}
                        disabled={reviewing}
                        className="btn-primary flex items-center gap-1"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => reviewSubmission(submission.id, 'CHANGES_REQUESTED')}
                        disabled={reviewing}
                        className="btn-secondary flex items-center gap-1"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => reviewSubmission(submission.id, 'REJECTED')}
                        disabled={reviewing}
                        className="btn-danger flex items-center gap-1"
                      >
                        <X size={16} /> Reject
                      </button>
                      <button
                        onClick={() => { setReviewingSubmission(null); setReviewFeedback('') }}
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
      )}
    </div>
  )
}
