'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Check, X, Eye } from 'lucide-react'

export default function AdminLeavePage() {
  const router = useRouter()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const res = await api.get('/leave')
      setLeaveRequests(res.data.leaveRequests)
    } catch (error) {
      toast.error('Failed to fetch leave requests')
    } finally {
      setLoading(false)
    }
  }

  const updateLeaveStatus = async (id, status, reason) => {
    try {
      await api.patch(`/leave/${id}/status`, { status, reason })
      toast.success(`Leave request ${status.toLowerCase()} successfully`)
      fetchLeaveRequests()
    } catch (error) {
      toast.error('Failed to update leave request')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">Leave Requests</h1>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted font-medium">User</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Department</th>
              <th className="text-left py-3 px-4 text-muted font-medium">From</th>
              <th className="text-left py-3 px-4 text-muted font-medium">To</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Reason</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
              <th className="text-right py-3 px-4 text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request.id} className="border-b border-border hover:bg-offwhite/[0.03]">
                <td className="py-3 px-4 font-medium">{request.user.fullName}</td>
                <td className="py-3 px-4 text-muted">{request.user.department?.replace(/_/g, ' ')}</td>
                <td className="py-3 px-4 text-muted">{new Date(request.startDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-muted">{new Date(request.endDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-muted">{request.reason}</td>
                <td className="py-3 px-4">
                  <span className={`badge ${request.status === 'APPROVED' ? 'badge-teal' : request.status === 'PENDING' ? 'badge-orange' : 'badge-orange'}`}>
                    {request.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {request.status === 'PENDING' && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => updateLeaveStatus(request.id, 'APPROVED')} className="btn-secondary text-xs px-2 py-1"><Check size={16} /></button>
                      <button onClick={() => updateLeaveStatus(request.id, 'REJECTED', 'Not approved')} className="btn-danger text-xs px-2 py-1"><X size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
