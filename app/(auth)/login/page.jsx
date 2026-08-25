'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import { setToken } from '@/lib/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      if (parsed.role === 'ADMIN') router.push('/admin')
      else if (parsed.role === 'BUSINESS_MANAGEMENT') router.push('/business')
      else if (parsed.role === 'SALES_MANAGEMENT') router.push('/sales')
      else if (parsed.role === 'OPERATIONS_DEVELOPER') router.push('/operations')
      else router.push('/login')
    }
  }, [router])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', data)
      const { user, token } = response.data
      setToken(token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      toast.success('Welcome back!')
      if (user.role === 'ADMIN') router.push('/admin')
      else if (user.role === 'BUSINESS_MANAGEMENT') router.push('/business')
      else if (user.role === 'SALES_MANAGEMENT') router.push('/sales')
      else if (user.role === 'OPERATIONS_DEVELOPER') router.push('/operations')
      else router.push('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-offwhite mb-2">IDEON</h1>
          <p className="text-muted">Dashboard Login</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input {...register('email')} type="email" className="input w-full" placeholder="you@ideon.com" />
              {errors.email && <p className="text-orange text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} className="input w-full" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted hover:text-offwhite">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-orange text-sm mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <Link href="/forgot-password" className="text-teal text-sm hover:underline">
              Forgot password?
            </Link>
            <p className="text-muted text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-teal hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
