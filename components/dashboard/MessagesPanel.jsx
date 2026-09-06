'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'
import { Search, Send, MessageSquare, Loader2 } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'

export default function MessagesPanel() {
  const [currentUserId, setCurrentUserId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const [msgError, setMsgError] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setCurrentUserId(JSON.parse(raw).id)
    } catch { /* ignore */ }
  }, [])

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/messages/conversations')
      setConversations(res.data.conversations)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  const fetchMessages = useCallback(async (userId) => {
    setMsgLoading(true)
    setMsgError(false)
    try {
      const res = await api.get(`/messages/${userId}`)
      setMessages(res.data.messages)
    } catch (err) {
      setMsgError(true)
    } finally {
      setMsgLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selected) fetchMessages(selected.user.id)
  }, [selected, fetchMessages])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) => c.user?.fullName?.toLowerCase().includes(q) || c.lastMessage?.toLowerCase().includes(q))
  }, [conversations, search])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selected) return
    setSending(true)
    try {
      await api.post('/messages', { receiverId: selected.user.id, content: newMessage })
      setNewMessage('')
      fetchMessages(selected.user.id)
      fetchConversations()
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-44 rounded-lg" />
        <div className="grid h-[calc(100vh-12rem)] gap-4 lg:grid-cols-[320px_1fr]">
          <div className="skeleton rounded-2xl" />
          <div className="skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState title="Could not load conversations" message="Messages are unreachable right now." onRetry={fetchConversations} />
      </div>
    )
  }

  const selUser = selected?.user

  return (
    <div className="space-y-6">
      <div>
        <p className="mono text-xs uppercase tracking-[0.22em] text-[var(--text-2)]">Comms</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[var(--text-0)] md:text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-[var(--text-1)]">Direct conversations with your team.</p>
      </div>

      <div className="flex h-[calc(100vh-13rem)] min-h-[480px] overflow-hidden rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)]">
        <div className="hidden w-80 flex-col border-r border-[var(--stroke)] lg:flex">
          <div className="border-b border-[var(--stroke)] p-4">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-2)]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] pl-8 pr-3 text-xs text-[var(--text-0)] outline-none transition-colors focus:border-[var(--cyan)]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <EmptyState className="border-0" icon={MessageSquare} title="No conversations" description="Start a chat with a teammate." />
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => setSelected(conv)}
                  className={cn(
                    'flex w-full items-center gap-3 border-b border-[var(--stroke)] px-4 py-3 text-left transition-colors',
                    selected?.user.id === conv.user.id ? 'bg-[var(--cyan-soft)]' : 'hover:bg-[var(--glass-soft)]'
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                    {conv.user.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-0)]">{conv.user.fullName}</p>
                    <p className="truncate text-xs text-[var(--text-2)]">{conv.lastMessage || 'No messages yet'}</p>
                  </div>
                  {conv.lastMessageAt && <span className="shrink-0 text-[10px] text-[var(--text-2)]">{timeAgo(conv.lastMessageAt)}</span>}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {selUser ? (
            <>
              <div className="flex items-center gap-3 border-b border-[var(--stroke)] px-5 py-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                  {selUser.fullName?.charAt(0)?.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-0)]">{selUser.fullName}</p>
                  <p className="truncate text-xs text-[var(--text-2)]">{selUser.email}</p>
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {msgLoading ? (
                  <div className="flex h-full items-center justify-center"><Loader2 size={18} className="animate-spin text-[var(--text-2)]" /></div>
                ) : msgError ? (
                  <ErrorState onRetry={() => fetchMessages(selected.user.id)} message="Could not load this conversation." />
                ) : messages.length === 0 ? (
                  <EmptyState className="border-0" icon={MessageSquare} title="Say hello" description="Start the conversation." />
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === currentUserId
                    return (
                      <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn('max-w-[70%] rounded-xl px-3.5 py-2 text-sm', isMine ? 'text-white' : 'bg-[var(--glass-soft)] text-[var(--text-0)]')}
                          style={isMine ? { background: 'linear-gradient(135deg, var(--cyan), var(--blue))' } : { border: '1px solid var(--stroke)' }}
                        >
                          <p className="leading-relaxed">{msg.content}</p>
                          <p className={cn('mt-1 text-[10px]', isMine ? 'text-white/70' : 'text-[var(--text-2)]')}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <form onSubmit={sendMessage} className="border-t border-[var(--stroke)] p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="h-10 flex-1 rounded-lg border border-[var(--stroke)] bg-[var(--glass-soft)] px-3 text-sm text-[var(--text-0)] outline-none transition-colors focus:border-[var(--cyan)]"
                  />
                  <button type="submit" disabled={sending || !newMessage.trim()} className="btn-primary !px-3 disabled:opacity-40" aria-label="Send">
                    {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a person on the left to start messaging." />
            </div>
          )}
        </div>
      </div>

      {/* Mobile conversation picker */}
      <div className="grid gap-2 lg:hidden">
        {filtered.map((conv) => (
          <button
            key={conv.user.id}
            onClick={() => setSelected(conv)}
            className={cn('flex items-center gap-3 rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] px-4 py-3 text-left', selected?.user.id === conv.user.id && 'border-[var(--cyan)]/40')}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
              {conv.user.fullName?.charAt(0)?.toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-[var(--text-0)]">{conv.user.fullName}</span>
              <span className="block truncate text-xs text-[var(--text-2)]">{conv.lastMessage || 'No messages yet'}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}