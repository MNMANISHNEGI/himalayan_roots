import React, { useEffect, useState } from 'react'
import { Mail, MailOpen, MessageSquare, X } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchMessages = () => {
    setLoading(true)
    api.get('/contact').then(res => setMessages(res.data.messages)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchMessages() }, [])

  const markRead = async (id) => {
    await api.patch(`/contact/${id}/read`)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
  }

  const openMessage = (msg) => {
    setSelected(msg)
    if (!msg.is_read) markRead(msg.id)
  }

  const unread = messages.filter(m => !m.is_read).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          Messages
          {unread > 0 && <span className="text-base bg-earth-500 text-white px-2.5 py-0.5 rounded-full font-medium">{unread} unread</span>}
        </h1>
        <p className="text-gray-500 text-sm">{messages.length} messages total</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 text-gray-200" />
            No messages yet
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${!msg.is_read ? 'bg-forest-50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!msg.is_read ? 'bg-forest-100 text-forest-700' : 'bg-gray-100 text-gray-400'}`}>
                  {msg.is_read ? <MailOpen size={18} /> : <Mail size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${!msg.is_read ? 'text-forest-900' : 'text-gray-700'}`}>{msg.name}</span>
                    {!msg.is_read && <span className="w-2 h-2 rounded-full bg-earth-500" />}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{msg.subject || msg.message}</div>
                </div>
                <div className="text-xs text-gray-400 shrink-0">
                  {new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-xl text-gray-900">{selected.subject || 'Message'}</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">From</p>
                  <p className="font-medium text-gray-900">{selected.name}</p>
                  <p className="text-gray-500">{selected.email}</p>
                  {selected.phone && <p className="text-gray-500">{selected.phone}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Received</p>
                  <p className="text-gray-600">{new Date(selected.created_at).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Message</p>
                <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your message to Himalayan Roots'}`}
                className="btn-primary flex items-center gap-2 justify-center"
              >
                <Mail size={16} /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
