import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Mountain, Search, User } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { totalItems } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'Our Story' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-forest-700 rounded-full flex items-center justify-center shadow group-hover:bg-forest-800 transition-colors">
              <Mountain size={18} className="text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-forest-900 text-lg leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>
                Himalayan
              </span>
              <span className="text-earth-500 text-xs font-semibold tracking-widest uppercase leading-none">Roots</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-forest-50 text-forest-800'
                      : 'text-gray-600 hover:text-forest-700 hover:bg-forest-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hidden md:flex">
                <Search size={20} />
              </button>
            )}

            <Link to="/account" className="p-2 rounded-lg hover:bg-forest-50 text-gray-600 hover:text-forest-700 transition-colors hidden md:flex" title="Sign In / Sign Up">
              <User size={20} />
            </Link>

            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-forest-50 text-forest-700 transition-colors">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-earth-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg font-medium text-sm mb-1 ${
                  isActive ? 'bg-forest-50 text-forest-800' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <form onSubmit={handleSearch} className="flex items-center gap-2 mt-2">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
            <button type="submit" className="btn-primary !px-3 !py-2 text-sm">
              <Search size={16} />
            </button>
          </form>
        </div>
      )}
    </header>
  )
}
