'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import Pill from '@/components/ui/Pill'
import { User, Phone, Mail, Calendar, ExternalLink, Upload, Camera, Pencil, Check, X, Loader2, Save } from 'lucide-react'

const ROLES_TONE = { ADMIN: 'critical' }
const DEPT_TONE = { BUSSINESS: 'info', SALES: 'info', OPERATIONS: 'info' }

export default function ProfilePanel() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/profile')
      setUser(res.data.user)
      setFormData(res.data.user)
    } catch (err) {
      if (err.response?.status === 401) {
        router.push('/login')
      } else {
        setError(true)
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      await api.patch('/profile', formData)
      toast.success('Profile updated')
      setEditing(false)
      fetchProfile()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const form = new FormData()
      form.append('file', file)
      form.append('upload_preset', 'ideon_uploads')
      form.append('folder', type === 'avatar' ? 'idon/profiles' : 'idon/covers')
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form })
      const data = await res.json()
      if (data.secure_url) {
        await api.post(type === 'avatar' ? '/upload/avatar' : '/upload/cover', { url: data.secure_url, publicId: data.public_id })
        toast.success(`${type === 'avatar' ? 'Avatar' : 'Cover image'} updated`)
        fetchProfile()
      }
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !user) {
    return <div className="flex h-[70vh] items-center justify-center">Could not load your profile.</div>
  }

  const inputCls = 'h-10 w-full rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] px-3 text-sm text-[var(--text-0)] outline-none transition-colors focus:border-[var(--cyan)] disabled:opacity-60'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono text-xs uppercase tracking-[0.22em] text-[var(--text-2)]">Identity</p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[var(--text-0)] md:text-3xl">My profile</h1>
          <p className="mt-1 text-sm text-[var(--text-1)]">Your public profile, credentials and résumé.</p>
        </div>
        <button type="button" onClick={() => setEditing(!editing)} className="btn">
          {editing ? <X size={15} /> : <Pencil size={15} />}
          <span>{editing ? 'Cancel editing' : 'Edit profile'}</span>
        </button>
      </div>

      {user?.coverImageUrl && (
        <div className="h-44 w-full overflow-hidden rounded-2xl border border-[var(--stroke)]">
          <img src={user.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[var(--stroke)]" style={{ background: 'var(--cyan-soft)' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[var(--cyan)]" suppressHydrationWarning>
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--bg-2)] text-[var(--text-0)] transition-opacity hover:opacity-80" title="Change avatar">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={uploading} />
            </label>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-xl font-bold text-[var(--text-0)] md:text-2xl" suppressHydrationWarning>{user?.fullName}</h2>
            <p className="mt-0.5 text-sm text-[var(--text-1)]">{user?.profession || 'Team member'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {user?.department && <Pill tone={DEPT_TONE[user.department] || 'neutral'}>{user.department.replace(/_/g, ' ')}</Pill>}
              {user?.role && <Pill tone={ROLES_TONE[user.role] || 'neutral'}>{user.role.replace(/_/g, ' ')}</Pill>}
              <Pill tone={user?.isActive ? 'success' : 'warn'}>{user?.isActive ? 'ACTIVE' : 'INACTIVE'}</Pill>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={updateProfile} className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-0)]">Personal information</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-1)]"><User size={13} /> Full name</label>
              <input type="text" value={formData.fullName || ''} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} disabled={!editing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-1)]"><Mail size={13} /> Email</label>
              <input type="email" value={formData.email || ''} disabled className={cn(inputCls, 'opacity-60')} />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-1)]"><Phone size={13} /> Phone</label>
              <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!editing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-1)]"><Calendar size={13} /> Profession</label>
              <input type="text" value={formData.profession || ''} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} disabled={!editing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-1)]">Bio</label>
              <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} disabled={!editing} rows={3} className={cn(inputCls, 'h-auto py-2')} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-0)]">Professional information</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-1)]">Skills (comma-separated)</label>
              <input type="text" value={formData.skills?.join(', ') || ''} onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} disabled={!editing} placeholder="React, Node.js, PostgreSQL" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-1)]">Best project</label>
              <input type="text" value={formData.bestProject || ''} onChange={(e) => setFormData({ ...formData, bestProject: e.target.value })} disabled={!editing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-1)]">GitHub URL</label>
              <input type="url" value={formData.githubUrl || ''} onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })} disabled={!editing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-1)]">LinkedIn URL</label>
              <input type="url" value={formData.linkedinUrl || ''} onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })} disabled={!editing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-1)]">Portfolio URL</label>
              <input type="url" value={formData.portfolioUrl || ''} onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })} disabled={!editing} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-0)]">Résumé</h3>
            <button type="button" onClick={() => setEditing(true)} className="btn text-xs">
              <Upload size={13} />
              <span>Upload resume</span>
            </button>
          </div>
          {user?.resumeUrl && (
            <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] px-3 py-2 text-sm text-[var(--cyan)] transition-colors hover:bg-[var(--glass)]">
              <ExternalLink size={15} />
              View résumé
            </a>
          )}
        </div>

        {editing && (
          <div className="flex justify-end gap-3 lg:col-span-2">
            <button type="button" onClick={() => setEditing(false)} className="btn">
              <X size={15} /> Cancel
            </button>
            <button type="submit" disabled={updating} className="btn-primary">
              {updating ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save changes
            </button>
          </div>
        )}
      </form>
    </div>
  )
}