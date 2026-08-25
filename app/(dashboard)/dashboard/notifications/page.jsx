'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Bell, Check } from 'lucide-react'

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-offwhite">Notifications</h1>
      </div>
      <div className="card">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-muted mb-4" />
            <p className="text-muted">No notifications yet</p>
            <p className="text-sm text-muted mt-1">You'll see notifications here when there are updates</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-4 rounded-lg border transition-colors ${notification.isRead ? 'border-border bg-offwhite/[0.03]' : 'border-teal/30 bg-teal/5'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Bell size={20} className="text-teal mt-0.5" />
                    <div>
                      <h3 className="font-medium text-offwhite">{notification.title}</h3>
                      <p className="text-sm text-muted mt-1">{notification.message}</p>
                      <p className="text-xs text-muted mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <button onClick={() => markAsRead(notification.id)} className="text-teal hover:text-teal/80">
                      <Check size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
