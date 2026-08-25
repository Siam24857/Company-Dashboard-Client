'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Plus, Check } from 'lucide-react'

export default function SalesHubPage() {
  const router = useRouter()
  const [calls, setCalls] = useState([])
  const [pipeline, setPipeline] = useState([])
  const [followups, setFollowups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCallForm, setShowCallForm] = useState(false)
  const [callForm, setCallForm] = useState({ company: '', contact: '', duration: '', outcome: '', notes: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [callsRes, pipelineRes, followupsRes] = await Promise.all([
        api.get('/sales/calls'),
        api.get('/sales/pipeline'),
        api.get('/sales/followups'),
      ])
      setCalls(callsRes.data.calls)
      setPipeline(pipelineRes.data.pipeline)
      setFollowups(followupsRes.data.followups)
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCallLog = async (e) => {
    e.preventDefault()
    try {
      await api.post('/sales/calls', callForm)
      toast.success('Call log added')
      setShowCallForm(false)
      setCallForm({ company: '', contact: '', duration: '', outcome: '', notes: '' })
      fetchData()
    } catch (error) {
      toast.error('Failed to add call log')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-offwhite">Sales Hub</h1>
        <button onClick={() => setShowCallForm(!showCallForm)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Call Log
        </button>
      </div>
      {showCallForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Daily Call Log</h3>
          <form onSubmit={addCallLog} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Company" value={callForm.company} onChange={(e) => setCallForm({ ...callForm, company: e.target.value })} className="input" required />
            <input placeholder="Contact" value={callForm.contact} onChange={(e) => setCallForm({ ...callForm, contact: e.target.value })} className="input" required />
            <input placeholder="Duration (min)" type="number" value={callForm.duration} onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })} className="input" />
            <input placeholder="Outcome" value={callForm.outcome} onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })} className="input" />
            <textarea placeholder="Notes" value={callForm.notes} onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })} className="input col-span-2" />
            <button type="submit" className="btn-primary">Add Call Log</button>
          </form>
        </div>
      )}
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Sales Pipeline</h3>
          <div className="space-y-3">
            {pipeline.map((item) => (
              <div key={item.id} className="p-4 rounded-lg bg-offwhite/5 border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{item.company}</h4>
                  <p className="text-sm text-muted">{item.contact}</p>
                </div>
                <span className={`badge ${item.stage === 'CLOSED_WON' ? 'badge-teal' : 'badge-orange'}`}>{item.stage}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Call Logs</h3>
          <div className="space-y-3">
            {calls.map((call) => (
              <div key={call.id} className="p-4 rounded-lg bg-offwhite/5 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{call.company}</h4>
                    <p className="text-sm text-muted">{call.contact}</p>
                  </div>
                  <p className="text-sm text-muted">{new Date(call.callDate).toLocaleDateString()}</p>
                </div>
                {call.outcome && <p className="text-sm text-muted mt-2">Outcome: {call.outcome}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Follow-ups</h3>
          <div className="space-y-3">
            {followups.map((followup) => (
              <div key={followup.id} className="p-4 rounded-lg bg-offwhite/5 border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{followup.contact}</h4>
                  <p className="text-sm text-muted">{followup.company}</p>
                  <p className="text-sm text-muted">{new Date(followup.dueDate).toLocaleDateString()}</p>
                </div>
                {!followup.done && (
                  <button className="btn-secondary text-sm">Mark Done</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
