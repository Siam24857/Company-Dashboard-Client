'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Send, Search } from 'lucide-react'

export default function AdminEmailPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [emailLogs, setEmailLogs] = useState([])
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('compose')

  useEffect(() => {
    fetchUsers()
    fetchEmailLogs()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users?limit=100')
      setUsers(res.data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchEmailLogs = async () => {
    try {
      const res = await api.get('/email/logs')
      setEmailLogs(res.data.logs)
    } catch (error) {
      console.error('Error fetching email logs:', error)
    }
  }

  const sendEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/email/send', { to, subject, body })
      toast.success('Email sent successfully')
      setTo('')
      setSubject('')
      setBody('')
      fetchEmailLogs()
    } catch (error) {
      toast.error('Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">Email Center</h1>
      <div className="flex gap-4 border-b border-border">
        <button onClick={() => setActiveTab('compose')} className={`pb-3 px-1 font-medium ${activeTab === 'compose' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}>
          Compose
        </button>
        <button onClick={() => setActiveTab('logs')} className={`pb-3 px-1 font-medium ${activeTab === 'logs' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}>
          Email Logs
        </button>
      </div>
      {activeTab === 'compose' ? (
        <div className="card">
          <form onSubmit={sendEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="input w-full">
                <option value="">Select recipient</option>
                {users.map((user) => (
                  <option key={user.id} value={user.email}>{user.fullName} ({user.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="input w-full" placeholder="Email subject" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Body</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="input w-full" placeholder="Email content..." required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Send size={20} />
              {loading ? 'Sending...' : 'Send Email'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted font-medium">To</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Subject</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {emailLogs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-offwhite/[0.03]">
                  <td className="py-3 px-4">{log.to}</td>
                  <td className="py-3 px-4">{log.subject}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${log.status === 'SENT' ? 'badge-teal' : 'badge-orange'}`}>{log.status}</span>
                  </td>
                  <td className="py-3 px-4 text-muted">{new Date(log.sentAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
