import React from 'react'
import { Link } from 'react-router-dom'
import { Mountain, Instagram, Facebook, Mail, Phone, MapPin, Heart } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

export default function Footer() {
  const { freeShippingAbove } = useSettings()
  return (
    <footer className="bg-forest-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-forest-600 rounded-full flex items-center justify-center">
                <Mountain size={18} className="text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-white text-lg leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>Himalayan</span>
                <span className="text-earth-400 text-xs font-semibold tracking-widest uppercase leading-none">Roots</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Bringing the purest, most authentic products from the heart of the Himalayas directly to your table.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-forest-800 flex items-center justify-center hover:bg-earth-600 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-forest-800 flex items-center justify-center hover:bg-earth-600 transition-colors">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Shop</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['All Products', '/shop'],
                ['Rajma & Pulses', '/shop?category=rajma-pulses'],
                ['Rice & Grains', '/shop?category=rice-grains'],
                ['Fruits', '/shop?category=fruits'],
                ['Ghee & Honey', '/shop?category=dairy-ghee'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-gray-400 hover:text-earth-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Company</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Our Story', '/about'],
                ['Contact Us', '/contact'],
                ['Privacy Policy', '#'],
                ['Shipping Policy', '#'],
                ['Return Policy', '#'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-gray-400 hover:text-earth-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-gray-400">
                <MapPin size={15} className="text-earth-400 mt-0.5 shrink-0" />
                <span>Dehradun, Uttarakhand,<br />India – 248001</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <Phone size={15} className="text-earth-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <Mail size={15} className="text-earth-400 shrink-0" />
                <span>hello@himalayanroots.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="border-t border-forest-800 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              ['🌿', '100% Organic'],
              ['🏔️', 'Direct from Farms'],
              ['🚚', `Free Shipping ₹${freeShippingAbove}+`],
              ['↩️', 'Easy Returns'],
            ].map(([icon, text]) => (
              <div key={text} className="flex flex-col items-center gap-1">
                <span className="text-xl">{icon}</span>
                <span className="text-xs text-gray-400 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-forest-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Himalayan Roots. All rights reserved.</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart size={12} className="text-earth-400 fill-earth-400" /> for the mountains
          </p>
        </div>
      </div>
    </footer>
  )
}
