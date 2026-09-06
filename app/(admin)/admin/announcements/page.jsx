'use client'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/utils'
import Pill from '@/components/ui/Pill'
import { Plus, Megaphone, Loader2, X } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'

const PRIORITY_TONE = { NORMAL: 'info', IMPORTANT: 'warn', URGENT: 'critical' }
const TARGET_TONE = { BUSINESS_MANAGEMENT: 'info', SALES_MANAGEMENT: 'info', OPERATIONS_DEVELOPER: 'info' }

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'NORMAL', targetRole: '' })

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/announcements')
      setAnnouncements(res.data.announcements)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  const createAnnouncement = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/announcements', formData)
      toast.success('Announcement published')
      setShowForm(false)
      setFormData({ title: '', content: '', priority: 'NORMAL', targetRole: '' })
      fetchAnnouncements()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create announcement')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="space-y-6"><div className="skeleton h-8 w-56 rounded-lg" />{[0, 1, 2].map((i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Could not load announcements" onRetry={fetchAnnouncements} />
      </div>
    )
  }

  const inputCls = 'h-10 w-full rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] px-3 text-sm text-[var(--text-0)] outline-none transition-colors focus:border-[var(--cyan)]'
  const labelCls = 'mb-1.5 block text-xs font-medium text-[var(--text-1)]'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono text-xs uppercase tracking-[0.22em] text-[var(--text-2)]">Broadcast</p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[var(--text-0)] md:text-3xl">Announcements</h1>
          <p className="mt-1 text-sm text-[var(--text-1)]">Publish and manage company-wide communications.</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className="btn-primary">
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Close composer' : 'New announcement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createAnnouncement} className="rounded-2xl border border-[var(--cyan)]/30 bg-[var(--cyan-soft)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-0)]">Create announcement</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} placeholder="e.g. New project kickoff" />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Content</label>
              <textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={3} className={`${inputCls} h-auto py-2`} placeholder="What does the team need to know?" />
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputCls}>
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Target</label>
              <select value={formData.targetRole} onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })} className={inputCls}>
                <option value="">All users</option>
                <option value="BUSINESS_MANAGEMENT">Business Management</option>
                <option value="SALES_MANAGEMENT">Sales Management</option>
                <option value="OPERATIONS_DEVELOPER">Operations Developer</option>
              </select>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating && <Loader2 size={15} className="animate-spin" />}
              Publish
            </button>
          </div>
        </form>
      )}

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-10">
          <EmptyState icon={Megaphone} title="No announcements yet" description="Publish your first announcement to the team." />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {announcements.map((a) => (
            <article key={a.id} className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                  <Megaphone size={15} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-0)]">{a.title}</h3>
                  <p className="text-[11px] text-[var(--text-2)]">{timeAgo(a.createdAt)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-1)]">{a.content}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--stroke)] pt-3">
                <Pill tone={PRIORITY_TONE[a.priority] || 'info'}>{a.priority || 'NORMAL'}</Pill>
                <Pill tone={TARGET_TONE[a.targetRole] || 'info'}>{a.targetRole?.replace(/_/g, ' ') || 'All users'}</Pill>
                <Pill tone={a.isRead ? 'success' : 'warn'}>{a.isRead ? 'read' : 'unread'}</Pill>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}