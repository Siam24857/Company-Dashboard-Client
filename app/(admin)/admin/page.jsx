'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Users, User, Calendar, FolderOpen, MessageSquare } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3B8E93', '#FF8A3D', '#F2F7F7', 'rgba(242,247,247,0.5)']

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const usersRes = await api.get('/users?limit=1')
      const attendanceRes = await api.get('/attendance/summary')
      const projectsRes = await api.get('/projects')

      const totalUsers = usersRes.data.pagination?.total || 0
      const attendanceSummary = attendanceRes.data.summary || []
      const projects = projectsRes.data.projects || []

      setStats({
        totalUsers,
        activeUsers: totalUsers,
        pendingApprovals: 0,
        projectsInProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
        todayAttendance: attendanceSummary.reduce((acc, s) => acc + s._count.status, 0),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-offwhite">Dashboard Overview</h1>
          <p className="text-muted mt-1">Welcome to the IDEON Admin Dashboard</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-teal' },
          { label: "Today's Attendance", value: stats?.todayAttendance || 0, icon: Calendar, color: 'text-orange' },
          { label: 'Projects In Progress', value: stats?.projectsInProgress || 0, icon: FolderOpen, color: 'text-teal' },
          { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: User, color: 'text-orange' },
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
          <h3 className="text-lg font-semibold mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(242,247,247,0.1)" />
              <XAxis dataKey="name" stroke="#F2F7F7" />
              <YAxis stroke="#F2F7F7" />
              <Tooltip contentStyle={{ backgroundColor: '#0c0c18', border: '1px solid rgba(242,247,247,0.08)' }} />
              <Bar dataKey="value" fill="#3B8E93" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Projects by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={[]} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                {[]?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0c0c18', border: '1px solid rgba(242,247,247,0.08)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
