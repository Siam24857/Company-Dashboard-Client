'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Plus, ChevronRight } from 'lucide-react'

export default function BdHubPage() {
  const router = useRouter()
  const [leads, setLeads] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadForm, setLeadForm] = useState({ company: '', contact: '', email: '', value: '', status: 'LEAD' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [leadsRes, proposalsRes] = await Promise.all([
        api.get('/bd/leads'),
        api.get('/bd/proposals'),
      ])
      setLeads(leadsRes.data.leads)
      setProposals(proposalsRes.data.proposals)
    } catch (error) {
      console.error('Error fetching BD data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addLead = async (e) => {
    e.preventDefault()
    try {
      await api.post('/bd/leads', leadForm)
      toast.success('Lead added successfully')
      setShowLeadForm(false)
      setLeadForm({ company: '', contact: '', email: '', value: '', status: 'LEAD' })
      fetchData()
    } catch (error) {
      toast.error('Failed to add lead')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-offwhite">BD Hub</h1>
        <button onClick={() => setShowLeadForm(!showLeadForm)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Lead
        </button>
      </div>
      {showLeadForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Add New Lead</h3>
          <form onSubmit={addLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Company" value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} className="input" required />
            <input placeholder="Contact" value={leadForm.contact} onChange={(e) => setLeadForm({ ...leadForm, contact: e.target.value })} className="input" required />
            <input placeholder="Email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} className="input" required />
            <input placeholder="Value" type="number" value={leadForm.value} onChange={(e) => setLeadForm({ ...leadForm, value: e.target.value })} className="input" />
            <button type="submit" className="btn-primary">Add Lead</button>
          </form>
        </div>
      )}
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Client Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <div key={lead.id} className="p-4 rounded-lg bg-offwhite/5 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{lead.company}</h4>
                  <span className={`badge ${lead.status === 'CLOSED' ? 'badge-teal' : 'badge-orange'}`}>{lead.status}</span>
                </div>
                <p className="text-sm text-muted">{lead.contact}</p>
                <p className="text-sm text-muted">{lead.email}</p>
                {lead.value && <p className="text-sm text-teal mt-2">${lead.value}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Proposals</h3>
          <div className="space-y-3">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="p-4 rounded-lg bg-offwhite/5 border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{proposal.company}</h4>
                  <p className="text-sm text-muted">{new Date(proposal.sentDate).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${proposal.status === 'ACCEPTED' ? 'badge-teal' : 'badge-orange'}`}>{proposal.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
