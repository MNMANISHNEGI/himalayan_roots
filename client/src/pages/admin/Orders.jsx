import React, { useEffect, useState } from 'react'
import { Search, Eye, X, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'failed', 'refunded']

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const PAYMENT_COLORS = {
  pending: 'bg-gray-100 text-gray-600',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
  refunded: 'bg-orange-100 text-orange-700',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [viewOrder, setViewOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    api.get(`/orders${filterStatus ? `?status=${filterStatus}` : ''}`)
      .then(res => setOrders(res.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [filterStatus])

  const openOrder = async (order) => {
    setViewOrder(order)
    const res = await api.get(`/orders/${order.id}`)
    setOrderItems(res.data.items)
  }

  const updateStatus = async (id, status, paymentStatus) => {
    setUpdatingId(id)
    try {
      const res = await api.patch(`/orders/${id}/status`, { status, payment_status: paymentStatus })
      setOrders(prev => prev.map(o => o.id === id ? res.data.order : o))
      if (viewOrder?.id === id) setViewOrder(res.data.order)
      toast.success('Order updated')
    } catch {
      toast.error('Failed to update order')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm">{orders.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterStatus('')} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${!filterStatus ? 'bg-forest-700 text-white border-forest-700' : 'border-gray-300 text-gray-600 hover:border-forest-500'}`}>All</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-full text-sm font-medium border capitalize transition-colors ${filterStatus === s ? 'bg-forest-700 text-white border-forest-700' : 'border-gray-300 text-gray-600 hover:border-forest-500'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Order', 'Customer', 'Amount', 'Status', 'Payment', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-forest-800">{o.order_number}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-gray-900">{o.customer_name}</div>
                      <div className="text-xs text-gray-400">{o.customer_email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-forest-800">₹{parseFloat(o.total_amount).toFixed(0)}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={e => updateStatus(o.id, e.target.value, null)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer capitalize appearance-none ${STATUS_COLORS[o.status]}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={o.payment_status}
                        disabled={updatingId === o.id}
                        onChange={e => updateStatus(o.id, null, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer capitalize appearance-none ${PAYMENT_COLORS[o.payment_status]}`}
                      >
                        {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => openOrder(o)} className="p-2 rounded-lg hover:bg-forest-50 text-gray-400 hover:text-forest-700 transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-xl text-gray-900">Order {viewOrder.order_number}</h2>
                <p className="text-sm text-gray-400">{new Date(viewOrder.created_at).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                  <p className="font-medium text-gray-900">{viewOrder.customer_name}</p>
                  <p className="text-sm text-gray-500">{viewOrder.customer_email}</p>
                  <p className="text-sm text-gray-500">{viewOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</p>
                  <p className="text-sm text-gray-600">{viewOrder.shipping_address}</p>
                  <p className="text-sm text-gray-600">{viewOrder.city}{viewOrder.state && `, ${viewOrder.state}`} - {viewOrder.pincode}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
                <div className="space-y-2">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-50">
                      <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                      <span className="font-medium text-gray-900">₹{parseFloat(item.total_price).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{parseFloat(viewOrder.subtotal).toFixed(0)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{parseFloat(viewOrder.shipping_amount) === 0 ? 'Free' : `₹${parseFloat(viewOrder.shipping_amount).toFixed(0)}`}</span></div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2"><span>Total</span><span>₹{parseFloat(viewOrder.total_amount).toFixed(0)}</span></div>
              </div>

              {viewOrder.notes && (
                <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
                  <span className="font-semibold">Note: </span>{viewOrder.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
