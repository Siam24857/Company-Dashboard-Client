'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { User, Phone, Mail, Calendar, ExternalLink, Camera, Loader2 } from 'lucide-react'

export default function UserProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile')
      setUser(res.data.user)
      setFormData(res.data.user)
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    try {
      await api.patch('/profile', formData)
      toast.success('Profile updated successfully')
      setEditing(false)
      fetchProfile()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      const res = await api.post('/upload/avatar', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser(res.data.user)
      setFormData(res.data.user)
      toast.success('Avatar updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingCover(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      const res = await api.post('/upload/cover', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser(res.data.user)
      setFormData(res.data.user)
      toast.success('Cover image updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload cover image')
    } finally {
      setUploadingCover(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">My Profile</h1>
      <div className="card">
        <div className="relative">
          {user?.coverImageUrl ? (
            <div className="h-32 rounded-lg overflow-hidden mb-4">
              <img src={user.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-32 rounded-lg bg-teal/10 mb-4 flex items-center justify-center">
              <span className="text-muted text-sm">No cover image</span>
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute top-2 right-2 p-2 bg-primary/80 rounded-lg text-muted hover:text-offwhite transition-colors"
          >
            {uploadingCover ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          </button>
        </div>
        <div className="flex items-start gap-6 -mt-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-teal/20 flex items-center justify-center text-teal text-3xl font-bold overflow-hidden border-4 border-primary">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0)?.toUpperCase()
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 p-1.5 bg-teal rounded-full text-primary hover:bg-teal/80 transition-colors"
            >
              {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
          </div>
          <div className="flex-1 pt-4">
            <h2 className="text-2xl font-semibold">{user?.fullName}</h2>
            <p className="text-muted">{user?.email}</p>
            <div className="flex gap-2 mt-3">
              <span className="badge badge-teal">{user?.department?.replace(/_/g, ' ')}</span>
              <span className="badge badge-orange">{user?.role?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input type="text" value={formData.fullName || ''} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} disabled={!editing} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" value={user?.email || ''} disabled className="input w-full opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!editing} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} disabled={!editing} rows={3} className="input w-full" />
          </div>
          {editing && <button type="submit" className="btn-primary">Save Changes</button>}
        </form>
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-muted">
            <Calendar size={20} />
            <span>Member since: {new Date(user?.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 text-muted">
            <User size={20} />
            <span>Account Status: <span className="text-teal">{user?.status}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
