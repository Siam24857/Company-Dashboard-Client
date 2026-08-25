'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { ChevronLeft, Calendar, Clock, FileText } from 'lucide-react'

export default function AdminAttendancePage() {
  const router = useRouter()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate])

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/attendance?startDate=${selectedDate}&endDate=${selectedDate}`)
      setRecords(res.data.attendances)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-offwhite">Attendance Management</h1>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map((status) => (
          <div key={status} className="card">
            <p className="text-muted text-sm">{status}</p>
            <p className="text-2xl font-bold mt-2">{records.filter(r => r.status === status).length}</p>
          </div>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted font-medium">Name</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Department</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Date</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Check-In</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Check-Out</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-border hover:bg-offwhite/[0.03]">
                <td className="py-3 px-4">{record.user.fullName}</td>
                <td className="py-3 px-4 text-muted">{record.user.department?.replace(/_/g, ' ')}</td>
                <td className="py-3 px-4 text-muted">{new Date(record.date).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-muted">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</td>
                <td className="py-3 px-4 text-muted">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
                <td className="py-3 px-4">
                  <span className={`badge ${record.status === 'PRESENT' ? 'badge-teal' : record.status === 'ABSENT' ? 'badge-orange' : 'badge-muted'}`}>
                    {record.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-muted">{record.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
