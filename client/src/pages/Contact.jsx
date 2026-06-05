import React, { useState } from 'react'
import { Phone, Mail, MapPin, Instagram, Facebook, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useSettings } from '../context/SettingsContext'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5">
    <path d="M16.004 0C7.164 0 0 7.163 0 16c0 2.825.737 5.47 2.027 7.77L0 32l8.474-2.219A15.93 15.93 0 0 0 16.004 32C24.836 32 32 24.837 32 16S24.836 0 16.004 0Zm0 29.292a13.24 13.24 0 0 1-6.752-1.846l-.483-.287-5.03 1.317 1.341-4.896-.315-.502A13.224 13.224 0 0 1 2.71 16c0-7.33 5.965-13.292 13.294-13.292S29.29 8.67 29.29 16c0 7.33-5.961 13.292-13.286 13.292Zm7.292-9.95c-.4-.2-2.364-1.166-2.73-1.299-.367-.133-.634-.2-.9.2-.267.4-1.034 1.298-1.268 1.565-.233.267-.467.3-.867.1-.4-.2-1.687-.622-3.213-1.983-1.188-1.059-1.99-2.368-2.224-2.768-.233-.4-.025-.616.175-.815.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667.133-.267.067-.5-.033-.7-.1-.2-.9-2.168-1.233-2.968-.325-.78-.655-.674-.9-.687-.233-.012-.5-.015-.767-.015-.267 0-.7.1-1.067.5s-1.4 1.366-1.4 3.332c0 1.967 1.433 3.867 1.633 4.134.2.267 2.82 4.3 6.832 6.032.954.412 1.699.658 2.28.843.958.305 1.83.261 2.519.158.768-.115 2.364-.966 2.697-1.9.333-.933.333-1.732.233-1.9-.1-.166-.366-.266-.766-.466Z"/>
  </svg>
)

export default function Contact() {
  const { settings, whatsappUrl } = useSettings()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill required fields'); return }
    setLoading(true)
    try {
      await api.post('/contact', form)
      toast.success("Message sent! We'll get back to you within 24 hours.")
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-forest-800 text-white py-14 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Get in Touch</h1>
        <p className="text-forest-200 text-lg">We'd love to hear from you — questions, feedback, or just a hello</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left sidebar — info */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold text-forest-900" style={{ fontFamily: 'Playfair Display, serif' }}>Contact Info</h2>

            <div className="space-y-5">
              {[
                { icon: <MapPin size={20} />, label: 'Our Office', value: 'Dehradun, Uttarakhand\nIndia – 248001' },
                { icon: <Phone size={20} />, label: 'Phone', value: settings.contact_phone || '+91 99104 26826' },
                { icon: <Mail size={20} />, label: 'Email', value: settings.contact_email || 'hello@himalayanroots.com' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-11 h-11 bg-forest-100 rounded-xl flex items-center justify-center text-forest-700 shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-forest-900 whitespace-pre-line font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp contact card — matching the design in the screenshot */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-800 text-base mb-2">Contact Us</h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                If you have any questions, we're here to help you.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Email us at —{' '}
                <a href={`mailto:${settings.contact_email || 'hello@himalayanroots.com'}`} className="text-green-700 hover:underline font-medium">
                  {settings.contact_email || 'hello@himalayanroots.com'}
                </a>
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-colors w-full"
              >
                <WhatsAppIcon />
                Whatsapp
              </a>
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium text-gray-600 mb-3">Follow us</p>
              <div className="flex gap-3">
                <a href={settings.instagram_url || '#'} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-forest-700 rounded-xl flex items-center justify-center text-white hover:bg-forest-800 transition-colors">
                  <Instagram size={18} />
                </a>
                <a href={settings.facebook_url || '#'} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-forest-700 rounded-xl flex items-center justify-center text-white hover:bg-forest-800 transition-colors">
                  <Facebook size={18} />
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white hover:bg-[#1ebe5a] transition-colors">
                  <WhatsAppIcon />
                </a>
              </div>
            </div>

            <div className="bg-earth-50 rounded-2xl p-5 border border-earth-100">
              <h3 className="font-semibold text-forest-900 mb-2">Business Hours</h3>
              <div className="text-sm space-y-1 text-gray-600">
                <p>Mon – Sat: 9:00 AM – 6:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Right — contact form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-forest-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                    <input className="input-field" placeholder="Your name" value={form.name} onChange={e => update('name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                    <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input type="tel" className="input-field" placeholder="+91 99104 26826" value={form.phone} onChange={e => update('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <select className="input-field" value={form.subject} onChange={e => update('subject', e.target.value)}>
                      <option value="">Select a subject</option>
                      <option>Order Enquiry</option>
                      <option>Product Question</option>
                      <option>Wholesale / Bulk Order</option>
                      <option>Feedback</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                  <textarea className="input-field" rows={5} placeholder="Tell us how we can help..." value={form.message} onChange={e => update('message', e.target.value)} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={18} /> Send Message</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
