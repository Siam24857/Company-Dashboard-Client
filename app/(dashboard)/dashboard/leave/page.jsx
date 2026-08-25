'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Calendar, Clock } from 'lucide-react'

export default function UserLeavePage() {
  const router = useRouter()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' })

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const res = await api.get('/leave/me')
      setLeaveRequests(res.data.leaveRequests)
    } catch (error) {
      console.error('Error fetching leave requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitLeaveRequest = async (e) => {
    e.preventDefault()
    try {
      await api.post('/leave', formData)
      toast.success('Leave request submitted successfully')
      setShowForm(false)
      setFormData({ startDate: '', endDate: '', reason: '' })
      fetchLeaveRequests()
    } catch (error) {
      toast.error('Failed to submit leave request')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-offwhite">Leave Requests</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'New Leave Request'}
        </button>
      </div>
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Submit Leave Request</h3>
          <form onSubmit={submitLeaveRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="input" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={3} className="input w-full" required />
            </div>
            <button type="submit" className="btn-primary">Submit Request</button>
          </form>
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted font-medium">From</th>
              <th className="text-left py-3 px-4 text-muted font-medium">To</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Reason</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request.id} className="border-b border-border hover:bg-offwhite/[0.03]">
                <td className="py-3 px-4">{new Date(request.startDate).toLocaleDateString()}</td>
                <td className="py-3 px-4">{new Date(request.endDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-muted">{request.reason}</td>
                <td className="py-3 px-4">
                  <span className={`badge ${request.status === 'APPROVED' ? 'badge-teal' : request.status === 'PENDING' ? 'badge-orange' : 'badge-orange'}`}>
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
