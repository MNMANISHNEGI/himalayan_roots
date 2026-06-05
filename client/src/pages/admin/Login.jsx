import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mountain, Eye, EyeOff, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) { navigate('/admin/dashboard', { replace: true }); return null }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/admin/dashboard', { replace: true })
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-forest-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mountain size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Himalayan Roots</h1>
          <p className="text-forest-400 text-sm mt-1">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={18} className="text-forest-600" />
            <h2 className="font-bold text-forest-900 text-lg">Sign in to continue</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@himalayanroots.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-60">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
            <p className="font-medium mb-1">Default credentials:</p>
            <p>Email: admin@himalayanroots.com</p>
            <p>Password: Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
