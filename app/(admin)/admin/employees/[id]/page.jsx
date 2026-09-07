'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, Search, Filter,
  Loader2, ChevronDown, Clock,
  CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, User, Briefcase,
  Target, Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminEmployeeDetailPage() {
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const empId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : ''

  const fetchEmployee = useCallback(async () => {
    try {
      const res = await api.get(`/employees/${empId}`)
      setEmployee(res.data.employee)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [empId])

  useEffect(() => { fetchEmployee() }, [fetchEmployee])

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Employee not found" message="Could not load employee details." onRetry={fetchEmployee} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <a href="/admin/employees" className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--cyan)' }}>
            Employees <ArrowRight size={14} />
          </a>
          <span className="text-xs" style={{ color: 'var(--text-2)' }}>/</span>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>{employee.fullName}</h1>
        </div>
        <button onClick={() => toast.info('Edit employee coming soon')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-1)' }}>
          <Plus size={14} /> Edit
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Role', value: employee.employeeProfile?.jobTitle || employee.role || 'N/A', icon: Briefcase, tone: 'cyan' },
          { label: 'Department', value: employee.department?.replace(/_/g, ' ') || 'N/A', icon: Target, tone: 'green' },
          { label: 'Tasks', value: employee._count?.taskSubmissions || 0, icon: Target, tone: 'blue' },
          { label: 'Projects', value: employee.projects?.length || 0, icon: Calendar, tone: 'purple' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{s.label}</span>
              <s.icon size={14} style={{ color: 'var(--text-2)' }} />
            </div>
            <div className="mt-2 text-lg font-bold" style={{ color: 'var(--text-0)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Employee Profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stroke)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>Email</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-0)' }}>{employee.email}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stroke)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>Status</p>
            <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', employee.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : employee.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400')}>
              {employee.status}
            </span>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stroke)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>Hire Date</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-0)' }}>{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stroke)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>Workload</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-0)' }}>{employee.workload?.capacity || 0}% capacity</p>
          </div>
        </div>
      </div>
    </div>
  )
}