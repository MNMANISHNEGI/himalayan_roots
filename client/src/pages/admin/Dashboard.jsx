import React, { useEffect, useState } from 'react'
import { Package, ShoppingCart, IndianRupee, MessageSquare, TrendingUp, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../api/axios'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Products', value: data?.stats.total_products || 0, icon: <Package size={22} />, color: 'bg-forest-100 text-forest-700', change: 'Active listings' },
    { label: 'Total Orders', value: data?.stats.total_orders || 0, icon: <ShoppingCart size={22} />, color: 'bg-blue-100 text-blue-700', change: 'All time' },
    { label: 'Total Revenue', value: `₹${(data?.stats.total_revenue || 0).toLocaleString('en-IN')}`, icon: <IndianRupee size={22} />, color: 'bg-green-100 text-green-700', change: 'From paid orders' },
    { label: 'Unread Messages', value: data?.stats.unread_messages || 0, icon: <MessageSquare size={22} />, color: 'bg-orange-100 text-orange-700', change: 'Pending reply' },
  ]

  const salesData = (data?.sales_by_month || []).map(m => ({
    month: new Date(m.month).toLocaleDateString('en-IN', { month: 'short' }),
    revenue: parseFloat(m.revenue).toFixed(0),
    orders: parseInt(m.orders),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back — here's what's happening</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, color, change }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
            <div className="text-sm font-medium text-gray-700">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Revenue (Last 6 Months)</h2>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  formatter={(v) => [`₹${parseInt(v).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#25562a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-3">
            {(data?.orders_by_status || []).length === 0 ? (
              <p className="text-gray-400 text-sm">No orders yet</p>
            ) : (
              (data?.orders_by_status || []).map(s => (
                <div key={s.status} className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-700'}`}>
                    {s.status}
                  </span>
                  <span className="font-bold text-gray-900">{s.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock size={18} />Recent Orders</h2>
          {(data?.recent_orders || []).length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {(data?.recent_orders || []).map(o => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{o.order_number}</div>
                    <div className="text-xs text-gray-400">{o.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-forest-800 text-sm">₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={18} />Top Products</h2>
          {(data?.top_products || []).length === 0 ? (
            <p className="text-gray-400 text-sm">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {(data?.top_products || []).map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-700 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.units_sold} units sold</div>
                  </div>
                  <div className="font-bold text-forest-800 text-sm">₹{parseFloat(p.revenue).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
