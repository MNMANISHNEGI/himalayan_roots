import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Public pages
import Home from './pages/Home'
import SignupLogin from './pages/SignupLogin'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import OrderSuccess from './pages/OrderSuccess'

// Admin pages
import AdminLogin from './pages/admin/Login'
import AdminLayout from './pages/admin/Layout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminCategories from './pages/admin/Categories'
import AdminMessages from './pages/admin/Messages'
import AdminSettings from './pages/admin/Settings'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />
}

const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
      <Route path="/shop/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
      <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/order-success/:orderNumber" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
      <Route path="/account" element={<PublicLayout><SignupLogin /></PublicLayout>} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  )
}
