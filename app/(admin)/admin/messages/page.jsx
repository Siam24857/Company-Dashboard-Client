'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { Send, Search, Mail, Users } from 'lucide-react'

export default function AdminMessagesPage() {
  const router = useRouter()
  const currentUserId = getUser()?.id
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations')
      setConversations(res.data.conversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`)
      setMessages(res.data.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return
    try {
      await api.post('/messages', { receiverId: selectedConversation.user.id, content: newMessage })
      setNewMessage('')
      fetchMessages(selectedConversation.user.id)
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const filteredConversations = conversations.filter(c => c.user.fullName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="h-[calc(100vh-8rem)] flex card">
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-muted" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="input w-full pl-10" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button key={conv.user.id} onClick={() => setSelectedConversation(conv)} className={`w-full text-left p-4 hover:bg-offwhite/5 transition-colors border-b border-border ${selectedConversation?.user.id === conv.user.id ? 'bg-teal/10 border-l-4 border-teal' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center text-teal font-semibold">
                  {conv.user.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{conv.user.fullName}</p>
                  <p className="text-xs text-muted truncate">{conv.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center text-teal font-semibold">
                  {selectedConversation.user.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{selectedConversation.user.fullName}</p>
                  <p className="text-xs text-muted">{selectedConversation.user.email}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isMine ? 'bg-teal text-primary' : 'bg-offwhite/10 text-offwhite'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-primary/70' : 'text-muted'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="input flex-1" />
                <button type="submit" className="btn-primary"><Send size={20} /></button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted">
            <div className="text-center">
              <Mail size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
