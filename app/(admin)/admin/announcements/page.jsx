'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Plus, Bell } from 'lucide-react'

export default function AdminAnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'NORMAL', targetRole: '' })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements')
      setAnnouncements(res.data.announcements)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const createAnnouncement = async (e) => {
    e.preventDefault()
    try {
      await api.post('/announcements', formData)
      toast.success('Announcement created successfully')
      setShowForm(false)
      setFormData({ title: '', content: '', priority: 'NORMAL', targetRole: '' })
      fetchAnnouncements()
    } catch (error) {
      toast.error('Failed to create announcement')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-offwhite">Announcements</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Announcement
        </button>
      </div>
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Create Announcement</h3>
          <form onSubmit={createAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input w-full">
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Role</label>
              <select value={formData.targetRole} onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })} className="input w-full">
                <option value="">All Users</option>
                <option value="BUSINESS_MANAGEMENT">Business Management</option>
                <option value="SALES_MANAGEMENT">Sales Management</option>
                <option value="OPERATIONS_DEVELOPER">Operations Developer</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Create Announcement</button>
          </form>
        </div>
      )}
      <div className="card">
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 rounded-lg bg-offwhite/5 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{announcement.title}</h3>
                  <p className="text-sm text-muted mt-1">{announcement.content}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`badge ${announcement.priority === 'URGENT' ? 'badge-orange' : 'badge-teal'}`}>{announcement.priority}</span>
                    <span className="badge badge-muted">{announcement.targetRole || 'All'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
