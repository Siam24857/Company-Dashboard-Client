'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { Plus, AlertTriangle, FileText } from 'lucide-react'

export default function OpsHubPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState([])
  const [incidents, setIncidents] = useState([])
  const [sops, setSops] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tasks')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, incidentsRes, sopsRes, resourcesRes] = await Promise.all([
        api.get('/ops/tasks'),
        api.get('/ops/incidents'),
        api.get('/ops/sops'),
        api.get('/ops/resources'),
      ])
      setTasks(tasksRes.data.tasks)
      setIncidents(incidentsRes.data.incidents)
      setSops(sopsRes.data.sops)
      setResources(resourcesRes.data.resources)
    } catch (error) {
      console.error('Error fetching ops data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-offwhite">Ops Hub</h1>
      <div className="flex gap-4 border-b border-border">
        <button onClick={() => setActiveTab('tasks')} className={`pb-3 px-1 font-medium ${activeTab === 'tasks' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}>Tasks</button>
        <button onClick={() => setActiveTab('sops')} className={`pb-3 px-1 font-medium ${activeTab === 'sops' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}>SOPs</button>
        <button onClick={() => setActiveTab('incidents')} className={`pb-3 px-1 font-medium ${activeTab === 'incidents' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}>Incidents</button>
        <button onClick={() => setActiveTab('resources')} className={`pb-3 px-1 font-medium ${activeTab === 'resources' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}>Resources</button>
      </div>
      {activeTab === 'tasks' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Operational Tasks</h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg bg-offwhite/5 border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted">{task.description}</p>
                </div>
                <span className={`badge ${task.status === 'DONE' ? 'badge-teal' : task.status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-muted'}`}>{task.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'sops' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Standard Operating Procedures</h3>
          <div className="space-y-3">
            {sops.map((sop) => (
              <div key={sop.id} className="p-4 rounded-lg bg-offwhite/5 border border-border flex items-center gap-3">
                <FileText size={20} className="text-teal" />
                <div>
                  <h4 className="font-medium">{sop.title}</h4>
                  <p className="text-sm text-muted">{sop.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'incidents' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Incident Log</h3>
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-4 rounded-lg bg-offwhite/5 border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{incident.title}</h4>
                  <p className="text-sm text-muted">{incident.description}</p>
                </div>
                <span className={`badge ${incident.status === 'RESOLVED' ? 'badge-teal' : incident.status === 'INVESTIGATING' ? 'badge-orange' : 'badge-muted'}`}>{incident.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'resources' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <div className="space-y-3">
            {resources.map((resource) => (
              <div key={resource.id} className="p-4 rounded-lg bg-offwhite/5 border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{resource.name}</h4>
                  <p className="text-sm text-muted">{resource.category}</p>
                </div>
                {resource.renewalDate && <p className="text-sm text-orange">{new Date(resource.renewalDate).toLocaleDateString()}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
