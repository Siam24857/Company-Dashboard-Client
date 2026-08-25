'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { User, Search, Plus, MoreVertical, Check, X, Trash2 } from 'lucide-react'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [page, statusFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' })
      if (statusFilter) params.append('status', statusFilter)
      if (search) params.append('search', search)

      const res = await api.get(`/users?${params.toString()}`)
      setUsers(res.data.users)
      setTotalPages(res.data.pagination.pages)
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId, status) => {
    try {
      await api.patch(`/users/${userId}/status`, { status })
      toast.success(`User ${status.toLowerCase()} successfully`)
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/users/${userId}`)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'badge-teal',
      PENDING: 'badge-orange',
      SUSPENDED: 'badge-muted',
    }
    return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading users...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-offwhite">User Management</h1>
        <button onClick={() => router.push('/admin/users/new')} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add User
        </button>
      </div>
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full pl-10"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-full sm:w-48">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted font-medium">Name</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Email</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Role</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Department</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Joined</th>
                <th className="text-right py-3 px-4 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-offwhite/[0.03] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-teal text-sm font-semibold">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted">{user.email}</td>
                  <td className="py-3 px-4 text-muted">{user.role?.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 text-muted">{user.department?.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                  <td className="py-3 px-4 text-muted">{new Date(user.joinedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="relative">
                      <button onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)} className="p-2 hover:bg-offwhite/5 rounded-lg">
                        <MoreVertical size={16} />
                      </button>
                      {actionMenuOpen === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[#0c0c18] border border-border rounded-lg shadow-lg py-2 z-10">
                          {user.status === 'PENDING' && (
                            <button onClick={() => { updateUserStatus(user.id, 'ACTIVE'); setActionMenuOpen(null) }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-teal hover:bg-offwhite/5">
                              <Check size={16} /> Approve
                            </button>
                          )}
                          {user.status === 'ACTIVE' && (
                            <button onClick={() => { updateUserStatus(user.id, 'SUSPENDED'); setActionMenuOpen(null) }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange hover:bg-offwhite/5">
                              <X size={16} /> Suspend
                            </button>
                          )}
                          {user.status === 'SUSPENDED' && (
                            <button onClick={() => { updateUserStatus(user.id, 'ACTIVE'); setActionMenuOpen(null) }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-teal hover:bg-offwhite/5">
                              <Check size={16} /> Reactivate
                            </button>
                          )}
                          <button onClick={() => { setSelectedUser(user); setActionMenuOpen(null) }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-offwhite hover:bg-offwhite/5">
                            <User size={16} /> View Profile
                          </button>
                          <button onClick={() => { deleteUser(user.id); setActionMenuOpen(null) }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange hover:bg-offwhite/5">
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50">
              Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
