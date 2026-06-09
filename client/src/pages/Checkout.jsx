import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Truck, CreditCard, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'

const STATES = ['Uttarakhand', 'Himachal Pradesh', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'West Bengal', 'Punjab', 'Haryana', 'Bihar', 'Other']

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const { freeShippingAbove, shippingCharge } = useSettings()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    shipping_address: '', city: '', state: '', pincode: '',
    payment_method: 'online', notes: '',
  })

  const shipping = totalPrice >= freeShippingAbove ? 0 : shippingCharge
  const grandTotal = totalPrice + shipping

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validateForm = () => {
    if (!form.customer_name.trim()) { toast.error('Please enter your full name'); return false }
    if (!form.customer_email.trim()) { toast.error('Please enter your email'); return false }
    if (!form.shipping_address.trim()) { toast.error('Please enter your shipping address'); return false }
    if (!form.city.trim()) { toast.error('Please enter your city'); return false }
    if (!form.pincode.trim() || form.pincode.length < 6) { toast.error('Please enter a valid 6-digit pincode'); return false }
    return true
  }

  const placeOrderInDB = async (paymentMethod, paymentStatus, razorpayPaymentId = null) => {
    const payload = {
      ...form,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      items: items.map(i => ({ product_id: parseInt(i.id), quantity: i.quantity })),
    }
    if (razorpayPaymentId) payload.notes = `${form.notes || ''}${form.notes ? ' | ' : ''}RZP:${razorpayPaymentId}`.trim()
    const res = await api.post('/orders', payload)
    return res.data.order
  }

  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      toast.error('Payment SDK not loaded. Please refresh and try again.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/orders/create-payment', {
        items: items.map(i => ({ product_id: parseInt(i.id), quantity: i.quantity })),
      })

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Himalayan Roots',
        description: 'Pure products from the Himalayas',
        image: '/favicon.svg',
        order_id: data.razorpay_order_id,
        prefill: {
          name: form.customer_name,
          email: form.customer_email,
          contact: form.customer_phone,
        },
        notes: {
          address: `${form.shipping_address}, ${form.city} - ${form.pincode}`,
        },
        theme: { color: '#2d5a3d' },
        handler: async (response) => {
          try {
            await api.post('/orders/verify-payment', response)
            const order = await placeOrderInDB('razorpay', 'paid', response.razorpay_payment_id)
            clearCart()
            navigate(`/order-success/${order.order_number}`)
          } catch (err) {
            toast.error('Payment received but order confirmation failed. Please contact us with your payment ID: ' + response.razorpay_payment_id)
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast('Payment cancelled', { icon: 'ℹ️' })
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        setLoading(false)
        toast.error(`Payment failed: ${response.error.description}`)
      })
      rzp.open()
    } catch (err) {
      setLoading(false)
      toast.error(err.response?.data?.error || 'Could not initiate payment. Please try again.')
    }
  }

  const handleCOD = async () => {
    setLoading(true)
    try {
      const order = await placeOrderInDB('cod', 'pending')
      clearCart()
      navigate(`/order-success/${order.order_number}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order. Please try again.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    if (form.payment_method === 'cod') {
      await handleCOD()
    } else {
      await handleRazorpayPayment()
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
            {/* Left column — form */}
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
                      <input className="input-field" placeholder="248001" maxLength={6} value={form.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g, ''))} required />
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
                    {
                      value: 'online',
                      label: 'Pay Online',
                      desc: 'UPI, Credit/Debit Card, Net Banking, Wallets — powered by Razorpay',
                      icon: '💳',
                      badge: 'Recommended',
                    },
                    {
                      value: 'cod',
                      label: 'Cash on Delivery',
                      desc: 'Pay when your order arrives at your doorstep',
                      icon: '💵',
                      badge: null,
                    },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        form.payment_method === opt.value
                          ? 'border-forest-600 bg-forest-50'
                          : 'border-gray-200 hover:border-forest-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.value}
                        checked={form.payment_method === opt.value}
                        onChange={() => update('payment_method', opt.value)}
                        className="accent-forest-700"
                      />
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-forest-900">{opt.label}</span>
                          {opt.badge && (
                            <span className="bg-forest-700 text-white text-xs px-2 py-0.5 rounded-full">{opt.badge}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {form.payment_method === 'online' && (
                  <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                    <Shield size={16} className="shrink-0 mt-0.5" />
                    <span>Your payment is secured by Razorpay. We never store your card details. Supports UPI, Paytm, PhonePe, Google Pay and all major cards.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right column — order summary */}
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
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-400">Add ₹{(freeShippingAbove - totalPrice).toFixed(0)} more for free shipping</p>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-forest-900 text-base">
                    <span>Total</span><span>₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-60 text-base py-3"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {form.payment_method === 'cod' ? 'Placing Order...' : 'Opening Payment...'}
                    </>
                  ) : form.payment_method === 'cod' ? (
                    `Place Order · ₹${grandTotal.toFixed(0)}`
                  ) : (
                    `Pay ₹${grandTotal.toFixed(0)} Securely`
                  )}
                </button>

                <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <Shield size={12} /> Your information is safe with us
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
