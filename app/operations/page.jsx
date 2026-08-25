'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Calendar, FolderOpen, MessageSquare, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OperationsDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    attendanceThisMonth: 0,
    assignedTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      const [attendanceRes, tasksRes] = await Promise.all([
        api.get(`/attendance/me?startDate=${startOfMonth.toISOString()}&endDate=${today.toISOString()}`),
        api.get('/ops/tasks'),
      ])

      const attendances = attendanceRes.data.attendances || []
      const presentCount = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length

      setStats({
        attendanceThisMonth: attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 0,
        assignedTasks: tasksRes.data.tasks?.length || 0,
        inProgressTasks: tasksRes.data.tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0,
        completedTasks: tasksRes.data.tasks?.filter(t => t.status === 'COMPLETED').length || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-offwhite">Welcome back!</h1>
        <p className="text-muted mt-1">Here's what's happening with your development tasks today.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Attendance This Month', value: `${stats.attendanceThisMonth}%`, icon: Calendar, color: 'text-teal' },
          { label: 'Assigned Tasks', value: stats.assignedTasks, icon: FolderOpen, color: 'text-teal' },
          { label: 'In Progress', value: stats.inProgressTasks, icon: FolderOpen, color: 'text-orange' },
          { label: 'Completed', value: stats.completedTasks, icon: FolderOpen, color: 'text-teal' },
        ].map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon size={32} className={stat.color} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
