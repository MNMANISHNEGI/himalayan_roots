import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hr_admin_user') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('hr_admin_token', res.data.token)
      localStorage.setItem('hr_admin_user', JSON.stringify(res.data.admin))
      setAdmin(res.data.admin)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('hr_admin_token')
    localStorage.removeItem('hr_admin_user')
    setAdmin(null)
  }

  const isAuthenticated = !!admin

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}
