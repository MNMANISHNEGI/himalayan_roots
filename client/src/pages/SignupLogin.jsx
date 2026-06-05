import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Lock, Mail, Phone, MapPin, Mountain } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
]

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Other']

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const res = await api.post('/customers/login', form)
      localStorage.setItem('hr_customer_token', res.data.token)
      localStorage.setItem('hr_customer_user', JSON.stringify(res.data.customer))
      toast.success(`Welcome back, ${res.data.customer.name.split(' ')[0]}!`)
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          E-mail <span className="text-earth-500">*</span>
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            className="input-field pl-9"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Password <span className="text-earth-500">*</span>
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showPass ? 'text' : 'password'}
            className="input-field pl-9 pr-10"
            placeholder="Your password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-earth-500 hover:bg-earth-600 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm tracking-wide uppercase"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
        ) : (
          'Log In ▸'
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        Forgot your password?{' '}
        <a href="mailto:hello@himalayanroots.com" className="text-earth-600 hover:underline font-medium">
          Contact support
        </a>
      </p>
    </form>
  )
}

// ─── Signup Form ──────────────────────────────────────────────────────────────
function SignupForm({ onSuccess }) {
  const [form, setForm] = useState({
    email: '', password: '', confirm_password: '',
    first_name: '', last_name: '',
    ship_first_name: '', ship_last_name: '', ship_email: '', ship_phone: '',
    address_line1: '', address_line2: '', city: '',
    country: 'India', state: '', pincode: '',
    same_billing_shipping: 'yes',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.first_name || !form.last_name) {
      toast.error('Please fill all required fields')
      return
    }
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/customers/signup', form)
      localStorage.setItem('hr_customer_token', res.data.token)
      localStorage.setItem('hr_customer_user', JSON.stringify(res.data.customer))
      toast.success('Account created successfully! Welcome to Himalayan Roots.')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7 py-2">

      {/* ── User account information ── */}
      <div>
        <h3 className="text-earth-500 font-semibold text-base mb-4 pb-1 border-b border-earth-200">
          User account information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">
              E-mail <span className="text-earth-500">*</span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className="input-field pl-9"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => upd('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">
              Password <span className="text-earth-500">*</span>
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pl-9 pr-10"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => upd('password', e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">
              Confirm password <span className="text-earth-500">*</span>
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                className={`input-field pl-9 pr-10 ${form.confirm_password && form.password !== form.confirm_password ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="Repeat your password"
                value={form.confirm_password}
                onChange={e => upd('confirm_password', e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.confirm_password && form.password !== form.confirm_password && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Contact information ── */}
      <div>
        <h3 className="text-earth-500 font-semibold text-base mb-4 pb-1 border-b border-earth-200">
          Contact information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">First name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-9"
                placeholder="First name"
                value={form.first_name}
                onChange={e => upd('first_name', e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Last name</label>
            <input
              className="input-field"
              placeholder="Last name"
              value={form.last_name}
              onChange={e => upd('last_name', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* ── Shipping address ── */}
      <div>
        <h3 className="text-earth-500 font-semibold text-base mb-4 pb-1 border-b border-earth-200">
          Shipping address
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">First name</label>
              <input
                className="input-field"
                placeholder="First name"
                value={form.ship_first_name}
                onChange={e => upd('ship_first_name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">Last name</label>
              <input
                className="input-field"
                placeholder="Last name"
                value={form.ship_last_name}
                onChange={e => upd('ship_last_name', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">
              E-mail <span className="text-earth-500">*</span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className="input-field pl-9"
                placeholder="Shipping email"
                value={form.ship_email}
                onChange={e => upd('ship_email', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Phone</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm text-gray-600 whitespace-nowrap shrink-0">
                🇮🇳 +91
              </div>
              <div className="relative flex-1">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  className="input-field pl-9"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={form.ship_phone}
                  onChange={e => upd('ship_phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Address</label>
            <div className="relative mb-2">
              <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                className="input-field pl-9"
                placeholder="House / Flat no., Street, Area"
                value={form.address_line1}
                onChange={e => upd('address_line1', e.target.value)}
              />
            </div>
            <input
              className="input-field"
              placeholder="Landmark (optional)"
              value={form.address_line2}
              onChange={e => upd('address_line2', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">City</label>
            <input
              className="input-field"
              placeholder="City"
              value={form.city}
              onChange={e => upd('city', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">Country</label>
              <select className="input-field" value={form.country} onChange={e => upd('country', e.target.value)}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">State / Province</label>
              <select className="input-field" value={form.state} onChange={e => upd('state', e.target.value)}>
                <option value="">— Select state —</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Zip / Postal code</label>
            <input
              className="input-field max-w-xs"
              placeholder="248001"
              maxLength={6}
              value={form.pincode}
              onChange={e => upd('pincode', e.target.value)}
            />
          </div>

          {/* Same billing/shipping radio */}
          <div className="flex items-center gap-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-gray-700">
            <span className="font-medium">Billing and shipping addresses are the same</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="same_billing"
                value="yes"
                checked={form.same_billing_shipping === 'yes'}
                onChange={() => upd('same_billing_shipping', 'yes')}
                className="accent-earth-500"
              />
              Yes
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="same_billing"
                value="no"
                checked={form.same_billing_shipping === 'no'}
                onChange={() => upd('same_billing_shipping', 'no')}
                className="accent-earth-500"
              />
              No
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-earth-500 hover:bg-earth-600 disabled:opacity-60 text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm tracking-wide uppercase shadow-md"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
        ) : (
          'Sign Up ▸'
        )}
      </button>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SignupLogin() {
  const [activeTab, setActiveTab] = useState('signup')
  const navigate = useNavigate()

  const onSuccess = () => navigate('/')

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-forest-800 text-white py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Mountain size={22} className="text-earth-300" />
          <span className="text-earth-300 font-medium tracking-widest uppercase text-sm">Himalayan Roots</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
          Start your digital journey with us.
        </h1>
        <p className="text-forest-300 mt-2 text-sm">
          <a href="#" className="underline underline-offset-2 hover:text-white">Let's get started!</a>
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-sm font-semibold uppercase tracking-widest transition-all duration-200 ${
                activeTab === 'login'
                  ? 'text-earth-600 border-b-2 border-earth-500 -mb-px bg-white'
                  : 'text-gray-400 hover:text-gray-600 bg-gray-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 text-sm font-semibold uppercase tracking-widest transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'text-earth-600 border-b-2 border-earth-500 -mb-px bg-white'
                  : 'text-gray-400 hover:text-gray-600 bg-gray-50'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form content */}
          <div className="px-7 py-6 max-h-[75vh] overflow-y-auto">
            {activeTab === 'login' ? (
              <LoginForm onSuccess={onSuccess} />
            ) : (
              <SignupForm onSuccess={onSuccess} />
            )}
          </div>
        </div>

        {/* Quick links */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By signing up you agree to our{' '}
          <Link to="#" className="text-earth-600 hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link to="#" className="text-earth-600 hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
