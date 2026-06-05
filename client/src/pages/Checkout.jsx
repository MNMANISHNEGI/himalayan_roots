import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Truck, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'

const STATES = ['Uttarakhand', 'Himachal Pradesh', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'West Bengal', 'Other']

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const { freeShippingAbove, shippingCharge } = useSettings()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    shipping_address: '', city: '', state: '', pincode: '',
    payment_method: 'cod', notes: '',
  })

  const shipping = totalPrice >= freeShippingAbove ? 0 : shippingCharge
  const grandTotal = totalPrice + shipping

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer_name || !form.customer_email || !form.shipping_address || !form.city || !form.pincode) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/orders', {
        ...form,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
      })
      clearCart()
      navigate(`/order-success/${res.data.order.order_number}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact */}
              <div className="card p-6">
                <h2 className="font-bold text-forest-900 text-lg mb-5 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-forest-600" /> Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input className="input-field" placeholder="Your full name" value={form.customer_name} onChange={e => update('customer_name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                    <input type="email" className="input-field" placeholder="email@example.com" value={form.customer_email} onChange={e => update('customer_email', e.target.value)} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.customer_phone} onChange={e => update('customer_phone', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="card p-6">
                <h2 className="font-bold text-forest-900 text-lg mb-5 flex items-center gap-2">
                  <Truck size={20} className="text-forest-600" /> Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
                    <textarea className="input-field" rows={3} placeholder="House/Flat no., Street, Area" value={form.shipping_address} onChange={e => update('shipping_address', e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                      <input className="input-field" placeholder="City" value={form.city} onChange={e => update('city', e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                      <select className="input-field" value={form.state} onChange={e => update('state', e.target.value)}>
                        <option value="">Select state</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                      <input className="input-field" placeholder="248001" maxLength={6} value={form.pincode} onChange={e => update('pincode', e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Notes (optional)</label>
                    <textarea className="input-field" rows={2} placeholder="Any special instructions..." value={form.notes} onChange={e => update('notes', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="card p-6">
                <h2 className="font-bold text-forest-900 text-lg mb-5 flex items-center gap-2">
                  <CreditCard size={20} className="text-forest-600" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {[
                    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                    { value: 'upi', label: 'UPI / Online Payment', desc: 'Pay securely via UPI, cards, netbanking', icon: '📱' },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.payment_method === opt.value ? 'border-forest-600 bg-forest-50' : 'border-gray-200 hover:border-forest-300'}`}>
                      <input type="radio" name="payment" value={opt.value} checked={form.payment_method === opt.value} onChange={() => update('payment_method', opt.value)} className="accent-forest-700" />
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="font-medium text-forest-900">{opt.label}</div>
                        <div className="text-sm text-gray-500">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="font-bold text-forest-900 text-lg mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  {items.map(item => {
                    const effectivePrice = item.price * (1 - (item.discount_percentage || 0) / 100)
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 flex-1 pr-2 line-clamp-1">{item.name} × {item.quantity}</span>
                        <span className="font-medium text-forest-900 whitespace-nowrap">₹{(effectivePrice * item.quantity).toFixed(0)}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2 text-sm mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>₹{totalPrice.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-forest-900 text-base">
                    <span>Total</span><span>₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-60">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order · ₹${grandTotal.toFixed(0)}`
                  )}
                </button>

                <p className="text-xs text-center text-gray-400 mt-3">
                  🔒 Your information is safe with us
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
