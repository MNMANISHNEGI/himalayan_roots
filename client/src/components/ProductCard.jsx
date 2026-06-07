import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Tag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || ''

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'

const PRODUCT_IMAGES = {
  'rajma-chakrata': 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=400&q=80',
  'rajma-harshil': 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=400&q=80',
  'rajma-osla': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  'red-rice-lal-chawal': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&q=80',
  'bhatt-ki-daal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
  'apple-harshil': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80',
  'apple-himachal': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80',
  'pure-himalayan-ghee': 'https://images.unsplash.com/photo-1631241364741-ae4b55efd2d6?w=400&q=80',
  'wild-himalayan-honey': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
}

function getImageSrc(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  const discountedPrice = product.price * (1 - (product.discount_percentage || 0) / 100)
  const hasDiscount = product.discount_percentage > 0
  const imageUrl = getImageSrc(product.image_url) || PRODUCT_IMAGES[product.slug] || PLACEHOLDER

  const handleAddToCart = (e) => {
    e.preventDefault()
    addItem(product, 1)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link to={`/shop/${product.slug}`} className="group card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-56 bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = PRODUCT_IMAGES[product.slug] || PLACEHOLDER }}
        />
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-earth-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Tag size={11} />
            {product.discount_percentage}% OFF
          </div>
        )}
        {product.is_featured && (
          <div className="absolute top-3 right-3 bg-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Featured
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-forest-600 font-medium uppercase tracking-wider mb-1">{product.category_name || 'Himalayan'}</p>
        <h3 className="font-semibold text-forest-900 text-base mb-1.5 group-hover:text-forest-700 transition-colors line-clamp-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-1">{product.short_description}</p>

        {product.origin && (
          <p className="text-xs text-earth-500 mb-3 flex items-center gap-1">
            📍 {product.origin}
          </p>
        )}

        {/* Rating */}
        {product.avg_rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={i < Math.round(product.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.review_count})</span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xl font-bold text-forest-800">₹{discountedPrice.toFixed(0)}</span>
            <span className="text-xs text-gray-400 ml-1">/{product.unit || 'kg'}</span>
            {hasDiscount && (
              <div className="text-xs text-gray-400 line-through">₹{product.price}</div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 bg-forest-700 hover:bg-forest-800 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <ShoppingCart size={15} />
            Add
          </button>
        </div>
      </div>
    </Link>
  )
}
