'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Activity, Filter } from 'lucide-react'

export default function AdminAuditLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionFilter, setActionFilter] = useState('')

  useEffect(() => {
    fetchAuditLogs()
  }, [page, actionFilter])

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '50' })
      if (actionFilter) params.append('action', actionFilter)

      const res = await api.get(`/admin/audit-logs?${params.toString()}`)
      setLogs(res.data.logs)
      setTotalPages(res.data.pagination.pages)
    } catch (error) {
      toast.error('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">Audit Logs</h1>
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <Filter size={20} className="text-muted" />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input w-full sm:w-64">
            <option value="">All Actions</option>
            <option value="USER_APPROVED">User Approved</option>
            <option value="USER_SUSPENDED">User Suspended</option>
            <option value="USER_DELETED">User Deleted</option>
            <option value="ATTENDANCE_UPDATED">Attendance Updated</option>
            <option value="ATTENDANCE_OVERRIDDEN">Attendance Overridden</option>
            <option value="TASK_APPROVED">Task Approved</option>
            <option value="TASK_REJECTED">Task Rejected</option>
            <option value="ANNOUNCEMENT_CREATED">Announcement Created</option>
            <option value="ANNOUNCEMENT_UPDATED">Announcement Updated</option>
            <option value="ANNOUNCEMENT_DELETED">Announcement Deleted</option>
            <option value="PROJECT_CREATED">Project Created</option>
            <option value="PROJECT_UPDATED">Project Updated</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted font-medium">Action</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Actor</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Target</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Description</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-offwhite/[0.03]">
                  <td className="py-3 px-4">
                    <span className="badge badge-teal">{log.action}</span>
                  </td>
                  <td className="py-3 px-4 text-muted">{log.actorEmail || '-'}</td>
                  <td className="py-3 px-4 text-muted">{log.target || '-'}</td>
                  <td className="py-3 px-4 text-muted">{log.description || '-'}</td>
                  <td className="py-3 px-4 text-muted">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50">
              Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
