'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.enum(['BUSINESS_MANAGEMENT', 'SALES_MANAGEMENT', 'OPERATIONS_DEVELOPER']),
  department: z.enum(['BUSINESS_MANAGEMENT', 'SALES_MANAGEMENT', 'OPERATIONS_DEVELOPER']),
})

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.post('/auth/register', data)
      toast.success('Registration successful! Awaiting admin approval.')
      router.push('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-offwhite mb-2">IDEON</h1>
          <p className="text-muted">Create your account</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input {...register('fullName')} className="input w-full" placeholder="John Doe" />
              {errors.fullName && <p className="text-orange text-sm mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input {...register('email')} type="email" className="input w-full" placeholder="you@ideon.com" />
              {errors.email && <p className="text-orange text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input {...register('phone')} className="input w-full" placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input {...register('password')} type="password" className="input w-full" placeholder="••••••••" />
              {errors.password && <p className="text-orange text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select {...register('role')} className="input w-full">
                <option value="BUSINESS_MANAGEMENT">Business Management</option>
                <option value="SALES_MANAGEMENT">Sales Management</option>
                <option value="OPERATIONS_DEVELOPER">Operations Developer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <select {...register('department')} className="input w-full">
                <option value="BUSINESS_MANAGEMENT">Business Management</option>
                <option value="SALES_MANAGEMENT">Sales Management</option>
                <option value="OPERATIONS_DEVELOPER">Operations Developer</option>
              </select>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-4 text-center text-muted text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-teal hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
