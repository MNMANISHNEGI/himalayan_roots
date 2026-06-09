import React, { useEffect, useState } from 'react'
import { Search, Eye, X, Truck, Package, CheckCircle, Clock, XCircle, CreditCard, MapPin, Phone, Mail, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'failed', 'refunded']
const COURIERS = ['Delhivery', 'Bluedart', 'DTDC', 'India Post', 'Ekart', 'Xpressbees', 'Amazon Shipping', 'Other']

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
}

const PAYMENT_COLORS = {
  pending:  'bg-gray-100 text-gray-600',
  paid:     'bg-green-100 text-green-700',
  failed:   'bg-red-100 text-red-600',
  refunded: 'bg-orange-100 text-orange-700',
}

const STATUS_ICONS = {
  pending:    <Clock size={14} />,
  confirmed:  <CheckCircle size={14} />,
  processing: <Package size={14} />,
  shipped:    <Truck size={14} />,
  delivered:  <CheckCircle size={14} />,
  cancelled:  <XCircle size={14} />,
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [viewOrder, setViewOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [trackingHistory, setTrackingHistory] = useState([])
  const [updatingId, setUpdatingId] = useState(null)
  const [trackingForm, setTrackingForm] = useState({ tracking_number: '', courier_partner: '', note: '' })

  const fetchOrders = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (search) params.set('search', search)
    api.get(`/orders?${params}`)
      .then(res => setOrders(res.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [filterStatus, search])

  const openOrder = async (order) => {
    setViewOrder(order)
    setTrackingForm({
      tracking_number: order.tracking_number || '',
      courier_partner: order.courier_partner || '',
      note: '',
    })
    const [itemsRes, trackRes] = await Promise.all([
      api.get(`/orders/${order.id}`),
      api.get(`/orders/${order.id}/tracking`).catch(() => ({ data: { tracking: [] } })),
    ])
    setOrderItems(itemsRes.data.items)
    setTrackingHistory(trackRes.data.tracking)
  }

  const updateStatus = async (id, status, paymentStatus) => {
    setUpdatingId(id)
    try {
      const res = await api.patch(`/orders/${id}/status`, { status, payment_status: paymentStatus })
      setOrders(prev => prev.map(o => o.id === id ? res.data.order : o))
      if (viewOrder?.id === id) setViewOrder(res.data.order)
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update')
    } finally {
      setUpdatingId(null)
    }
  }

  const saveTracking = async () => {
    if (!trackingForm.tracking_number && !trackingForm.courier_partner) {
      toast.error('Enter at least a tracking number or courier')
      return
    }
    setUpdatingId(viewOrder.id)
    try {
      const res = await api.patch(`/orders/${viewOrder.id}/status`, {
        status: viewOrder.status === 'confirmed' || viewOrder.status === 'processing' ? 'shipped' : viewOrder.status,
        tracking_number: trackingForm.tracking_number,
        courier_partner: trackingForm.courier_partner,
        note: trackingForm.note || 'Tracking info added',
      })
      setViewOrder(res.data.order)
      setOrders(prev => prev.map(o => o.id === viewOrder.id ? res.data.order : o))
      // Refresh tracking history
      const trackRes = await api.get(`/orders/${viewOrder.id}/tracking`)
      setTrackingHistory(trackRes.data.tracking)
      toast.success('Tracking info saved')
    } catch {
      toast.error('Failed to save tracking')
    } finally {
      setUpdatingId(null)
    }
  }

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} orders</p>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9 bg-white w-64 text-sm"
            placeholder="Search order # or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterStatus('')} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!filterStatus ? 'bg-forest-700 text-white border-forest-700' : 'border-gray-300 text-gray-600 hover:border-forest-500'}`}>
          All
        </button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border capitalize transition-colors flex items-center gap-1.5 ${filterStatus === s ? 'bg-forest-700 text-white border-forest-700' : 'border-gray-300 text-gray-600 hover:border-forest-500'}`}>
            {STATUS_ICONS[s]} {s}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Order #', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-5 py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                  <Package size={40} className="mx-auto mb-3 text-gray-200" />
                  No orders found
                </td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openOrder(o)}>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-forest-800">{o.order_number}</div>
                      <div className="text-xs text-gray-400">{fmt(o.created_at)}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900">{o.customer_name}</div>
                      <div className="text-xs text-gray-400">{o.customer_email}</div>
                      {o.customer_phone && <div className="text-xs text-gray-400">{o.customer_phone}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{o.item_count || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-forest-800">₹{parseFloat(o.total_amount).toFixed(0)}</div>
                      {parseFloat(o.shipping_amount) === 0 && <div className="text-xs text-green-600">Free shipping</div>}
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize w-fit ${PAYMENT_COLORS[o.payment_status]}`}>
                          {o.payment_status}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">{o.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={e => updateStatus(o.id, e.target.value, null)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer capitalize appearance-none ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{fmt(o.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <ChevronRight size={16} className="text-gray-300" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail drawer/modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={() => setViewOrder(null)}>
          <div
            className="bg-white h-full w-full max-w-2xl overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-bold text-xl text-gray-900">{viewOrder.order_number}</h2>
                <p className="text-sm text-gray-400">{fmtTime(viewOrder.created_at)}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status + Payment row */}
              <div className="flex flex-wrap gap-3 items-center">
                <select
                  value={viewOrder.status}
                  disabled={updatingId === viewOrder.id}
                  onChange={e => updateStatus(viewOrder.id, e.target.value, null)}
                  className={`text-sm font-semibold px-4 py-2 rounded-full border-0 cursor-pointer capitalize appearance-none ${STATUS_COLORS[viewOrder.status]}`}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={viewOrder.payment_status}
                  disabled={updatingId === viewOrder.id}
                  onChange={e => updateStatus(viewOrder.id, null, e.target.value)}
                  className={`text-sm font-semibold px-4 py-2 rounded-full border-0 cursor-pointer capitalize appearance-none ${PAYMENT_COLORS[viewOrder.payment_status]}`}
                >
                  {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="text-sm text-gray-400 capitalize">via {viewOrder.payment_method}</span>
              </div>

              {/* Customer + Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer</p>
                  <p className="font-semibold text-gray-900 mb-1">{viewOrder.customer_name}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5"><Mail size={13} className="text-gray-400" />{viewOrder.customer_email}</p>
                    {viewOrder.customer_phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1.5"><Phone size={13} className="text-gray-400" />{viewOrder.customer_phone}</p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ship To</p>
                  <p className="text-sm text-gray-700 flex items-start gap-1.5">
                    <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0" />
                    <span>
                      {viewOrder.shipping_address}<br />
                      {viewOrder.city}{viewOrder.state && `, ${viewOrder.state}`} — {viewOrder.pincode}
                    </span>
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {orderItems.map((item, i) => (
                    <div key={item.id} className={`flex items-center justify-between px-4 py-3 text-sm ${i !== orderItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div>
                        <span className="font-medium text-gray-800">{item.product_name}</span>
                        <span className="text-gray-400 ml-2">× {item.quantity}</span>
                        {item.discount_percentage > 0 && (
                          <span className="text-xs text-earth-500 ml-2">{item.discount_percentage}% off</span>
                        )}
                      </div>
                      <span className="font-semibold text-forest-800">₹{parseFloat(item.total_price).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-forest-50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{parseFloat(viewOrder.subtotal).toFixed(0)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={parseFloat(viewOrder.shipping_amount) === 0 ? 'text-green-600 font-medium' : ''}>
                    {parseFloat(viewOrder.shipping_amount) === 0 ? 'FREE' : `₹${parseFloat(viewOrder.shipping_amount).toFixed(0)}`}
                  </span>
                </div>
                {viewOrder.coupon_code && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({viewOrder.coupon_code})</span>
                    <span>-₹{parseFloat(viewOrder.coupon_discount || 0).toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-forest-100 pt-2">
                  <span>Total</span><span>₹{parseFloat(viewOrder.total_amount).toFixed(0)}</span>
                </div>
              </div>

              {/* Shipping / Tracking */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Truck size={14} /> Shipping & Tracking
                </p>
                {viewOrder.tracking_number && (
                  <div className="mb-3 bg-indigo-50 rounded-lg px-4 py-2 text-sm">
                    <span className="text-indigo-600 font-medium">{viewOrder.courier_partner || 'Courier'}</span>
                    <span className="text-indigo-400 mx-2">·</span>
                    <span className="font-mono text-indigo-800">{viewOrder.tracking_number}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Courier Partner</label>
                    <select
                      className="input-field text-sm"
                      value={trackingForm.courier_partner}
                      onChange={e => setTrackingForm(f => ({ ...f, courier_partner: e.target.value }))}
                    >
                      <option value="">Select courier</option>
                      {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tracking Number</label>
                    <input
                      className="input-field text-sm font-mono"
                      placeholder="e.g. 1234567890"
                      value={trackingForm.tracking_number}
                      onChange={e => setTrackingForm(f => ({ ...f, tracking_number: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Note (optional)</label>
                  <input
                    className="input-field text-sm"
                    placeholder="e.g. Dispatched from Dehradun warehouse"
                    value={trackingForm.note}
                    onChange={e => setTrackingForm(f => ({ ...f, note: e.target.value }))}
                  />
                </div>
                <button
                  onClick={saveTracking}
                  disabled={updatingId === viewOrder.id}
                  className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  <Truck size={15} />
                  {viewOrder.status === 'pending' || viewOrder.status === 'confirmed' || viewOrder.status === 'processing'
                    ? 'Save & Mark Shipped'
                    : 'Update Tracking'}
                </button>
              </div>

              {/* Order timeline */}
              {trackingHistory.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Order Timeline</p>
                  <div className="space-y-3">
                    {trackingHistory.map((t, i) => (
                      <div key={t.id} className="flex gap-3 items-start">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                          t.status === 'delivered' ? 'bg-green-500' :
                          t.status === 'shipped' ? 'bg-indigo-500' :
                          t.status === 'cancelled' ? 'bg-red-400' : 'bg-forest-600'
                        }`}>
                          {STATUS_ICONS[t.status]}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-sm font-medium text-gray-800 capitalize">{t.status}</p>
                          {t.note && <p className="text-xs text-gray-500">{t.note}</p>}
                          {t.tracking_number && <p className="text-xs text-indigo-600 font-mono">{t.tracking_number}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">{fmtTime(t.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                {viewOrder.processing_at && <div>Confirmed: {fmtTime(viewOrder.processing_at)}</div>}
                {viewOrder.shipped_at && <div>Shipped: {fmtTime(viewOrder.shipped_at)}</div>}
                {viewOrder.delivered_at && <div>Delivered: {fmtTime(viewOrder.delivered_at)}</div>}
                {viewOrder.cancelled_at && <div className="text-red-400">Cancelled: {fmtTime(viewOrder.cancelled_at)}</div>}
              </div>

              {viewOrder.notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                  <span className="font-semibold">Customer Note: </span>{viewOrder.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
