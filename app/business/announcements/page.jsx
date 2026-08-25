'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Bell, Check } from 'lucide-react'

export default function BusinessAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

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

  const markAsRead = async (id) => {
    try {
      await api.patch(`/announcements/${id}/read`)
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, isRead: true } : a))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">Announcements</h1>
      <div className="card">
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className={`p-4 rounded-lg border transition-colors ${announcement.isRead ? 'border-border bg-offwhite/[0.03]' : 'border-teal/30 bg-teal/5'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Bell size={20} className="text-teal mt-0.5" />
                  <div>
                    <h3 className="font-medium text-offwhite">{announcement.title}</h3>
                    <p className="text-sm text-muted mt-1">{announcement.content}</p>
                    <p className="text-xs text-muted mt-2">{new Date(announcement.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!announcement.isRead && (
                  <button onClick={() => markAsRead(announcement.id)} className="text-teal hover:text-teal/80">
                    <Check size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
