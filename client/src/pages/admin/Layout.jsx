import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, FolderOpen, MessageSquare, Settings, LogOut, Mountain, Menu, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/admin/products', icon: <Package size={20} />, label: 'Products' },
  { to: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
  { to: '/admin/categories', icon: <FolderOpen size={20} />, label: 'Categories' },
  { to: '/admin/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
  { to: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
]

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/admin/login')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-forest-800">
        <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center">
          <Mountain size={18} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>Himalayan Roots</div>
          <div className="text-forest-400 text-xs">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'text-forest-300 hover:bg-forest-800 hover:text-white'
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-4 border-t border-forest-800 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-9 h-9 bg-earth-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
            {admin?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{admin?.name}</div>
            <div className="text-forest-400 text-xs truncate">{admin?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-forest-300 hover:bg-red-900/30 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-forest-950 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-forest-950 flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="font-medium text-forest-800">Himalayan Roots</span>
          </div>
          <a href="/" target="_blank" className="text-xs text-forest-600 hover:text-forest-800 font-medium hidden sm:block">
            ↗ View Store
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
