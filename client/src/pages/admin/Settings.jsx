import React, { useEffect, useState } from 'react'
import { Save, Settings as SettingsIcon, Truck, MessageCircle, Store, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const Section = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h2 className="font-bold text-gray-900 text-base mb-5 flex items-center gap-2.5">
      <span className="text-forest-600">{icon}</span>
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
)

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
)

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    site_name: '',
    tagline: '',
    contact_email: '',
    contact_phone: '',
    free_shipping_above: '999',
    shipping_charge: '99',
    min_order_amount: '0',
    whatsapp_number: '919910426826',
    whatsapp_message: 'Hello! I have a question about Himalayan Roots products.',
    instagram_url: '',
    facebook_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(prev => ({ ...prev, ...res.data.settings })))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const upd = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', { settings })
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const whatsappPreview = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(settings.whatsapp_message)}`

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Changes apply immediately across the store</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {saving
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            : <><Save size={16} /> Save All Settings</>
          }
        </button>
      </div>

      {/* Shipping & Minimum Order */}
      <Section icon={<Truck size={18} />} title="Delivery & Order Settings">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>These values control how delivery charges are calculated at checkout for every customer.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            label="Free Shipping Above (₹)"
            hint="Orders above this amount get free delivery"
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                className="input-field pl-7"
                value={settings.free_shipping_above}
                onChange={e => upd('free_shipping_above', e.target.value)}
              />
            </div>
          </Field>

          <Field
            label="Shipping Charge (₹)"
            hint="Charged on orders below the free threshold"
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                className="input-field pl-7"
                value={settings.shipping_charge}
                onChange={e => upd('shipping_charge', e.target.value)}
              />
            </div>
          </Field>

          <Field
            label="Minimum Order Amount (₹)"
            hint="Set 0 to disable minimum order requirement"
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                className="input-field pl-7"
                value={settings.min_order_amount}
                onChange={e => upd('min_order_amount', e.target.value)}
              />
            </div>
          </Field>
        </div>

        {/* Live preview */}
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 text-sm text-forest-800 space-y-1">
          <p className="font-semibold mb-1">Preview (how it appears in cart):</p>
          {parseFloat(settings.min_order_amount) > 0 && (
            <p>⚠️ Minimum order amount: ₹{settings.min_order_amount}</p>
          )}
          <p>🚚 Free delivery on orders above <strong>₹{settings.free_shipping_above}</strong></p>
          <p>📦 Delivery charge: <strong>₹{settings.shipping_charge}</strong> for orders below that</p>
        </div>
      </Section>

      {/* WhatsApp */}
      <Section icon={<MessageCircle size={18} />} title="WhatsApp Contact">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="WhatsApp Number"
            hint="Country code + number, no spaces or +. E.g. 919910426826"
          >
            <input
              type="text"
              className="input-field"
              placeholder="919910426826"
              value={settings.whatsapp_number}
              onChange={e => upd('whatsapp_number', e.target.value.replace(/\D/g, ''))}
            />
          </Field>

          <Field label="Pre-filled Message" hint="Customers see this when they click WhatsApp">
            <input
              type="text"
              className="input-field"
              placeholder="Hello! I have a question..."
              value={settings.whatsapp_message}
              onChange={e => upd('whatsapp_message', e.target.value)}
            />
          </Field>
        </div>

        {settings.whatsapp_number && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
            <span className="text-green-700 font-medium">Preview link:</span>
            <a
              href={whatsappPreview}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline underline-offset-2 break-all"
            >
              {whatsappPreview}
            </a>
          </div>
        )}
      </Section>

      {/* Store Info */}
      <Section icon={<Store size={18} />} title="Store Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Site Name">
            <input className="input-field" value={settings.site_name} onChange={e => upd('site_name', e.target.value)} />
          </Field>
          <Field label="Tagline">
            <input className="input-field" value={settings.tagline} onChange={e => upd('tagline', e.target.value)} />
          </Field>
          <Field label="Contact Email">
            <input type="email" className="input-field" value={settings.contact_email} onChange={e => upd('contact_email', e.target.value)} />
          </Field>
          <Field label="Contact Phone">
            <input type="tel" className="input-field" value={settings.contact_phone} onChange={e => upd('contact_phone', e.target.value)} />
          </Field>
          <Field label="Instagram URL">
            <input className="input-field" placeholder="https://instagram.com/..." value={settings.instagram_url} onChange={e => upd('instagram_url', e.target.value)} />
          </Field>
          <Field label="Facebook URL">
            <input className="input-field" placeholder="https://facebook.com/..." value={settings.facebook_url} onChange={e => upd('facebook_url', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* Save button at bottom too */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {saving
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            : <><Save size={16} /> Save All Settings</>
          }
        </button>
      </div>
    </div>
  )
}
