'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Calendar, CheckOut, X } from 'lucide-react'

export default function SalesAttendancePage() {
  const router = useRouter()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [notes, setNotes] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [workCompleted, setWorkCompleted] = useState('')
  const [screenshot, setScreenshot] = useState('')
  const [submittedToday, setSubmittedToday] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/me')
      const todayRecord = res.data.attendances?.find(a => {
        const recordDate = new Date(a.date).toISOString().split('T')[0]
        return recordDate === today
      })
      if (todayRecord) {
        setSubmittedToday(true)
        setCheckIn(todayRecord.checkIn ? new Date(todayRecord.checkIn).toTimeString().slice(0, 5) : '')
        setCheckOut(todayRecord.checkOut ? new Date(todayRecord.checkOut).toTimeString().slice(0, 5) : '')
      }
      setRecords(res.data.attendances || [])
    } catch (error) {
      toast.error('Failed to fetch attendance')
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/attendance', {
        checkIn,
        checkOut,
        status: 'PRESENT',
        taskTitle,
        taskDescription,
        workCompleted,
        screenshotUrl: screenshot,
        notes,
      })
      toast.success('Attendance marked successfully')
      setSubmittedToday(true)
      fetchAttendance()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">My Attendance</h1>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Mark Today's Attendance</h3>
        <form onSubmit={markAttendance} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Check-In Time</label>
              <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Check-Out Time</label>
              <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Task Title</label>
            <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="input" placeholder="What task did you work on?" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Task Description</label>
            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} rows={3} className="input w-full" placeholder="Describe your task..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Work Completed</label>
            <textarea value={workCompleted} onChange={(e) => setWorkCompleted(e.target.value)} rows={3} className="input w-full" placeholder="What did you complete today?" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Screenshot Evidence URL</label>
            <input type="text" value={screenshot} onChange={(e) => setScreenshot(e.target.value)} className="input" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input w-full" />
          </div>
          <button type="submit" disabled={submittedToday || submitting} className="btn-primary">
            {submitting ? 'Submitting...' : submittedToday ? 'Already Submitted Today' : 'Mark Attendance'}
          </button>
        </form>
      </div>
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Attendance History</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted font-medium">Date</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Check-In</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Check-Out</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
              <th className="text-left py-3 px-4 text-muted font-medium">Task</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-border hover:bg-offwhite/[0.03]">
                <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-muted">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</td>
                <td className="py-3 px-4 text-muted">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
                <td className="py-3 px-4">
                  <span className={`badge ${record.status === 'PRESENT' ? 'badge-teal' : record.status === 'ABSENT' ? 'badge-orange' : 'badge-muted'}`}>
                    {record.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-muted">{record.taskTitle || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
