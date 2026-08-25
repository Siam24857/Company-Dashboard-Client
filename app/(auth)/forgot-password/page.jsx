'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotSchema) })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setSubmitted(true)
      toast.success('OTP sent to your email')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-offwhite mb-2">IDEON</h1>
          <p className="text-muted">Reset your password</p>
        </div>
        <div className="card">
          {submitted ? (
            <div className="text-center">
              <p className="text-offwhite mb-4">Check your email for the OTP code.</p>
              <Link href="/login" className="text-teal hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input {...register('email')} type="email" className="input w-full" placeholder="you@ideon.com" />
                  {errors.email && <p className="text-orange text-sm mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
              <p className="mt-4 text-center text-muted text-sm">
                Remember your password?{' '}
                <Link href="/login" className="text-teal hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
