'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { User, Phone, Mail, Calendar, ExternalLink, Upload } from 'lucide-react'

export default function SalesProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [uploading, setUploading] = useState(false)

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
      toast.error('Failed to update profile')
    }
  }

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'ideon_uploads')

      const folder = type === 'avatar' ? 'idon/profiles' : 'idon/covers'
      formData.append('folder', folder)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.secure_url) {
        const endpoint = type === 'avatar' ? '/upload/avatar' : '/upload/cover'
        await api.post(endpoint, { url: data.secure_url, publicId: data.public_id })
        toast.success(`${type === 'avatar' ? 'Avatar' : 'Cover image'} uploaded successfully`)
        fetchProfile()
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">My Profile</h1>
      {user?.coverImageUrl && (
        <div className="w-full h-48 rounded-xl overflow-hidden">
          <img src={user.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="card">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-teal/20 flex items-center justify-center text-teal text-3xl font-bold overflow-hidden">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <label className="absolute bottom-0 right-0 bg-teal text-primary p-1.5 rounded-full cursor-pointer hover:bg-teal/80 transition-colors">
              <Upload size={16} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={uploading} />
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{user?.fullName}</h2>
            <p className="text-muted">{user?.profession || 'Sales Manager'}</p>
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
            <label className="block text-sm font-medium mb-2">Profession</label>
            <input type="text" value={formData.profession || ''} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} disabled={!editing} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} disabled={!editing} rows={3} className="input w-full" />
          </div>
          {editing && <button type="submit" className="btn-primary">Save Changes</button>}
        </form>
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
            <input type="text" value={formData.skills?.join(', ') || ''} onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} disabled={!editing} className="input w-full" placeholder="Sales, Negotiation, CRM" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Best Project</label>
            <input type="text" value={formData.bestProject || ''} onChange={(e) => setFormData({ ...formData, bestProject: e.target.value })} disabled={!editing} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">GitHub URL</label>
            <input type="url" value={formData.githubUrl || ''} onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })} disabled={!editing} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
            <input type="url" value={formData.linkedinUrl || ''} onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })} disabled={!editing} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Portfolio URL</label>
            <input type="url" value={formData.portfolioUrl || ''} onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })} disabled={!editing} className="input w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
