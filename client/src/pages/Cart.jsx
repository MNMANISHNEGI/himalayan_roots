import React from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'

const PRODUCT_IMAGES = {
  'rajma-chakrata': 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=200&q=80',
  'rajma-harshil': 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=200&q=80',
  'rajma-osla': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80',
  'red-rice-lal-chawal': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=200&q=80',
  'bhatt-ki-daal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80',
  'apple-harshil': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80',
  'apple-himachal': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80',
  'pure-himalayan-ghee': 'https://images.unsplash.com/photo-1631241364741-ae4b55efd2d6?w=200&q=80',
  'wild-himalayan-honey': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&q=80',
}

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()
  const { freeShippingAbove, shippingCharge, minOrderAmount } = useSettings()

  const shipping = totalPrice >= freeShippingAbove ? 0 : shippingCharge
  const grandTotal = totalPrice + shipping
  const belowMinOrder = minOrderAmount > 0 && totalPrice < minOrderAmount

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={80} className="mx-auto text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-forest-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Discover authentic Himalayan products and fill your cart with the mountains' best.</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const effectivePrice = item.price * (1 - (item.discount_percentage || 0) / 100)
              const imageUrl = item.image_url || PRODUCT_IMAGES[item.slug] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80'

              return (
                <div key={item.id} className="card p-5 flex gap-4">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80'}
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/shop/${item.slug}`} className="font-semibold text-forest-900 hover:text-forest-700 line-clamp-2">
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-forest-800">₹{effectivePrice.toFixed(0)}</span>
                      <span className="text-gray-400 text-sm">/{item.unit}</span>
                      {item.discount_percentage > 0 && (
                        <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100">
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-forest-800">₹{(effectivePrice * item.quantity).toFixed(0)}</span>
                        <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <Link to="/shop" className="flex items-center gap-2 text-forest-700 hover:text-forest-900 font-medium text-sm mt-2">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-forest-900 text-lg mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-forest-900">₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-forest-900'}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-earth-500 bg-earth-50 rounded-lg px-3 py-2">
                    Add ₹{(freeShippingAbove - totalPrice).toFixed(0)} more for free shipping
                  </p>
                )}
                {belowMinOrder && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 font-medium">
                    Minimum order amount is ₹{minOrderAmount.toFixed(0)}
                  </p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-forest-900 text-base">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              <Link
                to={belowMinOrder ? '#' : '/checkout'}
                onClick={e => { if (belowMinOrder) e.preventDefault() }}
                className={`btn-primary w-full flex items-center justify-center gap-2 ${belowMinOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              <div className="mt-4 text-xs text-center text-gray-400">
                🔒 Secure checkout · 🌿 100% Organic
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
