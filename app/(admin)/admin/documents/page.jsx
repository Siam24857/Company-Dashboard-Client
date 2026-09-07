'use client'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import Pill from '@/components/ui/Pill'
import ErrorState from '@/components/ui/ErrorState'
import { FileText, Search, Upload, Loader2, X, FolderOpen } from 'lucide-react'

const CATEGORIES = ['ALL', 'GENERAL', 'PROJECT', 'TEAM', 'COMPANY', 'REPORT']
const CATEGORY_TONE = { GENERAL: 'info', PROJECT: 'ai', TEAM: 'info', COMPANY: 'warn', REPORT: 'success' }

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', category: 'GENERAL' })

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/documents?limit=50')
      setDocuments(res.data.documents || res.data.docs || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const createDocument = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      await api.post('/documents', formData)
      toast.success('Document uploaded')
      setShowUpload(false)
      setFormData({ title: '', description: '', category: 'GENERAL' })
      fetchDocuments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      </div>
    )
  }

  if (error) {
    return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Could not load documents" onRetry={fetchDocuments} /></div>
  }

  const filtered = documents.filter((d) => {
    const matchesCategory = category === 'ALL' || d.category === category
    const q = search.toLowerCase()
    const matchesSearch = !q || (d.title || '').toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q) || (d.fileName || '').toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  const fileSize = (bytes) => {
    if (bytes == null) return null
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const inputCls = 'h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors'
  const labelCls = 'mb-1.5 block text-xs font-medium'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Files</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Document Center</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>Store and organize company documents.</p>
        </div>
        <button type="button" onClick={() => setShowUpload((s) => !s)} className="btn-primary">
          {showUpload ? <X size={15} /> : <Upload size={15} />}
          {showUpload ? 'Close' : 'Upload document'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Documents" value={documents.length} icon={FileText} tone="cyan" />
        <StatCard label="General" value={documents.filter((d) => d.category === 'GENERAL').length} icon={FolderOpen} tone="blue" />
        <StatCard label="Projects" value={documents.filter((d) => d.category === 'PROJECT').length} icon={FolderOpen} tone="purple" />
        <StatCard label="Reports" value={documents.filter((d) => d.category === 'REPORT').length} icon={FolderOpen} tone="green" />
      </div>

      {showUpload && (
        <form onSubmit={createDocument} className="rounded-2xl border p-5" style={{ borderColor: 'var(--cyan)', background: 'var(--cyan-soft)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Upload a document</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls} style={{ color: 'var(--text-1)' }}>Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }} placeholder="e.g. Annual Budget Report" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--text-1)' }}>Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputCls} style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }}>
                {CATEGORIES.filter((c) => c !== 'ALL').map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls} style={{ color: 'var(--text-1)' }}>Description</label>
              <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="h-auto w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors" style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }} placeholder="What does this document contain?" />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setShowUpload(false)} className="btn">Cancel</button>
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading && <Loader2 size={15} className="animate-spin" />}
              Upload
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn('rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors')}
              style={category === c ? { background: 'var(--cyan)', color: 'var(--bg)' } : { background: 'var(--glass-soft)', color: 'var(--text-2)', border: '1px solid var(--stroke)' }}
            >
              {c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-2)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="h-9 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-colors md:w-64"
            style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <FolderOpen size={36} className="mx-auto" style={{ color: 'var(--text-2)' }} />
          <h3 className="mt-4 text-sm font-semibold" style={{ color: 'var(--text-0)' }}>No documents found</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>Upload your first document to get started.</p>
          <button type="button" onClick={() => setShowUpload(true)} className="btn-primary mt-5">
            <Upload size={15} /> Upload document
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <article key={doc.id} className="rounded-2xl border p-5 transition-colors hover:border-[var(--cyan)]/40" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                  <FileText size={16} strokeWidth={1.75} />
                </span>
                <Pill tone={CATEGORY_TONE[doc.category] || 'info'}>{doc.category || 'GENERAL'}</Pill>
              </div>
              <h3 className="mt-3 text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{doc.title}</h3>
              {doc.description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{doc.description}</p>}
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-[11px]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}>
                <span className="truncate pr-2">{doc.fileName || '—'}</span>
                <span className="shrink-0 pl-2">
                  {doc.fileSize ? fileSize(doc.fileSize) : ''}
                  {doc.fileSize && doc.createdAt ? ' · ' : ''}
                  {doc.createdAt ? timeAgo(doc.createdAt) : ''}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
