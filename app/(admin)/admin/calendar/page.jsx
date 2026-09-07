'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import Pill from '@/components/ui/Pill'
import ErrorState from '@/components/ui/ErrorState'
import { Calendar, ChevronLeft, ChevronRight, Plus, Loader2, X, Clock, MapPin } from 'lucide-react'

const EVENT_TONE = {
  MEETING: { color: 'blue', pill: 'info', label: 'Meeting' },
  DEADLINE: { color: 'red', pill: 'critical', label: 'Deadline' },
  EVENT: { color: 'green', pill: 'success', label: 'Event' },
  ANNOUNCEMENT: { color: 'yellow', pill: 'warn', label: 'Announcement' },
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function AdminCalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  })
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({ title: '', type: 'MEETING', date: '', time: '', location: '', description: '' })

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/calendar')
      setEvents(res.data.events || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const createEvent = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/calendar', formData)
      toast.success('Event created')
      setShowCreate(false)
      setFormData({ title: '', type: 'MEETING', date: '', time: '', location: '', description: '' })
      fetchEvents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event')
    } finally {
      setCreating(false)
    }
  }

  const grid = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [viewDate])

  const eventsByDay = useMemo(() => {
    const map = {}
    for (const ev of events) {
      const date = new Date(ev.date || ev.startDate || ev.start)
      if (isNaN(date)) continue
      const key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      if (!map[key]) map[key] = []
      map[key].push(ev)
    }
    return map
  }, [events])

  const selectedEvents = eventsByDay[selectedDate.getTime()] || []
  const selectedKey = selectedDate.toDateString()

  const changeMonth = (delta) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1))
  }

  const isToday = (d) => {
    const today = new Date()
    return d && d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }
  const sameDate = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="skeleton h-[520px] rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return <div className="flex h-[60vh] items-center justify-center"><ErrorState title="Could not load calendar" onRetry={fetchEvents} /></div>
  }

  const inputCls = 'h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:border-[var(--cyan)]'
  const labelCls = 'mb-1.5 block text-xs font-medium'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>Schedule</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Company Calendar</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>View and manage company-wide events.</p>
        </div>
        <button type="button" onClick={() => setShowCreate((s) => !s)} className="btn-primary">
          {showCreate ? <X size={15} /> : <Plus size={15} />}
          {showCreate ? 'Close' : 'Create event'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Events" value={events.length} icon={Calendar} tone="cyan" />
        <StatCard label="Meetings" value={events.filter((e) => e.type === 'MEETING').length} icon={Calendar} tone="blue" />
        <StatCard label="Deadlines" value={events.filter((e) => e.type === 'DEADLINE').length} icon={Calendar} tone="red" />
        <StatCard label="Events" value={events.filter((e) => e.type === 'EVENT').length} icon={Calendar} tone="green" />
      </div>

      {showCreate && (
        <form onSubmit={createEvent} className="rounded-2xl border p-5" style={{ borderColor: 'var(--cyan)', background: 'var(--cyan-soft)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Create an event</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls} style={{ color: 'var(--text-1)' }}>Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }} placeholder="e.g. Weekly standup" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--text-1)' }}>Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputCls} style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }}>
                {Object.entries(EVENT_TONE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--text-1)' }}>Date</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputCls} style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--text-1)' }}>Time</label>
              <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className={inputCls} style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--text-1)' }}>Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputCls} style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }} placeholder="e.g. Conference Room A" />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls} style={{ color: 'var(--text-1)' }}>Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="h-auto w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors" style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)', color: 'var(--text-0)' }} placeholder="Optional details" />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating && <Loader2 size={15} className="animate-spin" />}
              Create
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <div className="flex items-center justify-between pb-4">
            <h3 className="font-display text-lg font-bold" style={{ color: 'var(--text-0)' }}>
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => changeMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}>
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => changeMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--glass-soft)]" style={{ borderColor: 'var(--stroke)', color: 'var(--text-2)' }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>{d}</div>
            ))}
            {grid.map((d, i) => {
              if (!d) return <div key={i} className="min-h-[72px] rounded-lg" />
              const dayEvents = eventsByDay[d.getTime()] || []
              const selected = sameDate(d, selectedDate)
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d)}
                  className={cn('min-h-[72px] rounded-lg border p-1.5 text-left align-top transition-colors', selected && 'border-[var(--cyan)]')}
                  style={selected ? { background: 'var(--cyan-soft)' } : { borderColor: 'var(--stroke)', background: 'var(--glass-soft)' }}
                >
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-semibold', isToday(d) ? 'text-white' : '')} style={isToday(d) ? { background: 'var(--cyan)' } : { color: 'var(--text-1)' }}>
                    {d.getDate()}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayEvents.slice(0, 3).map((ev, j) => (
                      <span key={j} className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--${EVENT_TONE[ev.type]?.color || 'blue'})` }} />
                    ))}
                    {dayEvents.length > 3 && <span className="text-[9px]" style={{ color: 'var(--text-2)' }}>+{dayEvents.length - 3}</span>}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 border-t pt-3" style={{ borderColor: 'var(--stroke)' }}>
            {Object.entries(EVENT_TONE).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-2)' }}>
                <span className="h-2 w-2 rounded-full" style={{ background: `var(--${v.color})` }} /> {v.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>
            {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <div className="mt-4 space-y-3">
            {selectedEvents.length === 0 ? (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--text-2)' }}>No events on this day.</p>
            ) : (
              selectedEvents.map((ev) => (
                <div key={ev.id} className="rounded-xl border p-3" style={{ borderColor: 'var(--stroke)', background: 'var(--glass-soft)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{ev.title}</p>
                    <Pill tone={EVENT_TONE[ev.type]?.pill || 'info'} dot>{EVENT_TONE[ev.type]?.label || ev.type}</Pill>
                  </div>
                  {ev.description && <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-1)' }}>{ev.description}</p>}
                  <div className="mt-2 space-y-1">
                    {ev.time && (
                      <p className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-2)' }}><Clock size={11} /> {ev.time}</p>
                    )}
                    {ev.location && (
                      <p className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-2)' }}><MapPin size={11} /> {ev.location}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
