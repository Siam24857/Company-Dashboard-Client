'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { setToken } from '@/lib/auth'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) router.push('/admin')
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/admin/login', { email, password })
      setToken(res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.admin))
      toast.success('Admin login successful')
      router.push('/admin')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Lock size={48} className="mx-auto text-orange mb-4" />
          <h1 className="text-3xl font-bold text-offwhite mb-2">IDEON</h1>
          <p className="text-muted">Admin Access Only</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input w-full" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Admin Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
