'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Calendar, FolderOpen, MessageSquare, Bell, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    attendanceThisMonth: 0,
    activeProjects: 0,
    unreadMessages: 0,
    leaveBalance: 12,
  })
  const [recentNotifications, setRecentNotifications] = useState([])
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

      const [attendanceRes, projectsRes, messagesRes, notificationsRes] = await Promise.all([
        api.get(`/attendance/me?startDate=${startOfMonth.toISOString()}&endDate=${today.toISOString()}`),
        api.get('/projects'),
        api.get('/messages/conversations'),
        api.get('/notifications'),
      ])

      const attendances = attendanceRes.data.attendances || []
      const presentCount = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length

      setStats({
        attendanceThisMonth: attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 0,
        activeProjects: projectsRes.data.projects?.filter(p => p.status === 'IN_PROGRESS').length || 0,
        unreadMessages: messagesRes.data.conversations?.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || 0,
        leaveBalance: 12,
      })
      setRecentNotifications(notificationsRes.data.notifications?.slice(0, 3) || [])
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
        <h1 className="text-3xl font-bold text-offwhite">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}!
        </h1>
        <p className="text-muted mt-1">Here's what's happening with your projects today.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Attendance This Month', value: `${stats.attendanceThisMonth}%`, icon: Calendar, color: 'text-teal' },
          { label: 'Active Projects', value: stats.activeProjects, icon: FolderOpen, color: 'text-teal' },
          { label: 'Unread Messages', value: stats.unreadMessages, icon: MessageSquare, color: 'text-orange' },
          { label: 'Leave Balance', value: `${stats.leaveBalance} days`, icon: Clock, color: 'text-teal' },
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="p-3 rounded-lg bg-offwhite/5 border border-border">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-xs text-muted mt-1">{notification.message}</p>
                <p className="text-xs text-muted mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => router.push('/dashboard/attendance')} className="btn-secondary">Mark Attendance</button>
            <button onClick={() => router.push('/dashboard/projects')} className="btn-secondary">View Projects</button>
            <button onClick={() => router.push('/dashboard/messages')} className="btn-secondary">Messages</button>
            <button onClick={() => router.push('/dashboard/leave')} className="btn-secondary">Leave Requests</button>
          </div>
        </div>
      </div>
    </div>
  )
}
