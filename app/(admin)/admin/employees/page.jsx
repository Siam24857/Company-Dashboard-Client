'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  RefreshCw, Plus, Users, Briefcase, Target, Clock,
  AlertTriangle, Search, Filter, Loader2, Shield,
  Calendar, Award, MapPin, Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useDashboardStore from '@/store/dashboard.store'
import StatCard from '@/components/ui/StatCard'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [q, setQ] = useState('')

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.get('/employees')
      setEmployees(res.data.employees || [])
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Failed to load employees" message="Could not reach the employees server." onRetry={fetchEmployees} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Employee Directory</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--text-0)' }}>Employees</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Manage employee profiles, departments, and workload.</p>
        </div>
        <div className="flex items-center gap-2">
          <Search size={14} style={{ color: 'var(--text-2)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search employees..."
            className="rounded-lg border bg-transparent px-3 py-1.5 text-xs outline-none focus:border-[var(--cyan)]"
            style={{ borderColor: 'var(--stroke)', color: 'var(--text-0)', width: 200 }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Employees', value: employees.length, icon: Users, tone: 'cyan' },
          { label: 'Active', value: employees.filter(e => e.status === 'ACTIVE').length, icon: Shield, tone: 'green' },
          { label: 'Pending', value: employees.filter(e => e.status === 'PENDING').length, icon: Clock, tone: 'amber' },
          { label: 'Avg Capacity', value: Math.round(employees.reduce((s, e) => s + (e.workload?.capacity || 0), 0) / Math.max(employees.length, 1)), icon: Target, tone: 'purple' },
        ].map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: 'var(--text-0)' }}>Employee Directory</h2>
        <div className="space-y-2">
          {employees.length === 0 ? (
            <EmptyState title="No employees found" description="Add employees to the directory." icon={Users} />
          ) : (
            employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-[var(--cyan)]/30" style={{ borderColor: 'var(--stroke)' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                  {(emp.fullName || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{emp.fullName}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', emp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : emp.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400')}>
                      {emp.status}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                    {emp.employeeProfile?.jobTitle || emp.role} · {emp.department} · {emp.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-2)' }}>
                  <span className="flex items-center gap-1"><Target size={12} />{emp._count?.taskSubmissions || 0} tasks</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} />{emp.projects?.length || 0} projects</span>
                </div>
                <a href={`/admin/employees/${emp.id}`} className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--cyan)' }}>
                  View
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}