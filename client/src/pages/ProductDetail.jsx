import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, ArrowLeft, Star, MapPin, Package, Leaf, ChevronDown, ChevronUp, Heart, Flame } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useCart } from '../context/CartContext'

const API_BASE = import.meta.env.VITE_API_URL || ''

const PRODUCT_IMAGES = {
  'rajma-chakrata': 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=800&q=80',
  'rajma-harshil': 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=800&q=80',
  'rajma-osla': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'red-rice-lal-chawal': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80',
  'bhatt-ki-daal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  'apple-harshil': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80',
  'apple-himachal': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80',
  'pure-himalayan-ghee': 'https://images.unsplash.com/photo-1631241364741-ae4b55efd2d6?w=800&q=80',
  'wild-himalayan-honey': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',
}

function getImageSrc(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

function Accordion({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-forest-900 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex items-center gap-2">{icon}{title}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${slug}`)
      .then(res => {
        setProduct(res.data.product)
        setReviews(res.data.reviews)
        // Auto-select first weight option if available
        const opts = typeof res.data.product.weight_options === 'string'
          ? JSON.parse(res.data.product.weight_options)
          : (res.data.product.weight_options || [])
        if (opts.length > 0) setSelectedWeight(opts[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="h-96 rounded-2xl animate-pulse bg-gray-200" />
      <div className="space-y-4">
        <div className="h-6 w-24 rounded animate-pulse bg-gray-200" />
        <div className="h-10 rounded animate-pulse bg-gray-200" />
        <div className="h-4 w-2/3 rounded animate-pulse bg-gray-200" />
        <div className="h-20 rounded animate-pulse bg-gray-200" />
      </div>
    </div>
  )

  if (!product) return (
    <div className="text-center py-32">
      <div className="text-6xl mb-4">🏔️</div>
      <h2 className="text-2xl font-bold text-forest-900 mb-2">Product not found</h2>
      <Link to="/shop" className="btn-primary inline-flex items-center gap-2 mt-4"><ArrowLeft size={18} /> Back to Shop</Link>
    </div>
  )

  const weightOptions = typeof product.weight_options === 'string'
    ? JSON.parse(product.weight_options)
    : (product.weight_options || [])

  const baseDiscountedPrice = product.price * (1 - (product.discount_percentage || 0) / 100)
  const displayPrice = selectedWeight ? parseFloat(selectedWeight.price) : baseDiscountedPrice
  const hasDiscount = !selectedWeight && product.discount_percentage > 0

  const rawImageUrl = product.image_url ? getImageSrc(product.image_url) : (PRODUCT_IMAGES[product.slug] || null)
  const fallbackImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
  const imageUrl = rawImageUrl || fallbackImage

  const handleAddToCart = () => {
    const cartProduct = selectedWeight
      ? { ...product, price: parseFloat(selectedWeight.price), discount_percentage: 0, unit: selectedWeight.label, id: `${product.id}-${selectedWeight.label}` }
      : product
    addItem(cartProduct, quantity)
    const label = selectedWeight ? `${product.name} (${selectedWeight.label})` : product.name
    toast.success(`${quantity}× ${label} added to cart`)
  }

  const tags = typeof product.tags === 'string' ? JSON.parse(product.tags) : (product.tags || [])
  const healthBenefits = product.health_benefits ? product.health_benefits.split('\n').filter(Boolean) : []
  const cookingTips = product.cooking_tips ? product.cooking_tips.split('\n').filter(Boolean) : []

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-forest-700">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-forest-700">Shop</Link>
          <span>/</span>
          <span className="text-forest-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="sticky top-24 self-start">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-[450px] object-cover"
                onError={e => { e.target.src = fallbackImage }}
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-earth-500 text-white font-bold px-3 py-1.5 rounded-full text-sm">
                  {product.discount_percentage}% OFF
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map(tag => (
                  <span key={tag} className="bg-forest-100 text-forest-700 text-xs px-3 py-1 rounded-full capitalize flex items-center gap-1">
                    <Leaf size={11} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-forest-600 font-semibold uppercase tracking-wider">{product.category_name}</span>
              {product.is_featured && <span className="bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full">Featured</span>}
            </div>

            <h1 className="text-4xl font-bold text-forest-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              {product.name}
            </h1>

            <p className="text-gray-600 text-lg mb-4 leading-relaxed">{product.short_description}</p>

            {/* Rating */}
            {product.avg_rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(product.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
                <span className="text-sm font-medium text-forest-700">{parseFloat(product.avg_rating).toFixed(1)}</span>
                <span className="text-sm text-gray-400">({product.review_count} reviews)</span>
              </div>
            )}

            {/* Weight Options */}
            {weightOptions.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">Select Size:</p>
                <div className="flex flex-wrap gap-2">
                  {weightOptions.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedWeight(opt)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedWeight?.label === opt.label
                          ? 'border-forest-700 bg-forest-700 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-forest-400'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-xs mt-0.5 font-bold">₹{parseFloat(opt.price).toFixed(0)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-forest-800">₹{displayPrice.toFixed(0)}</span>
              <span className="text-lg text-gray-400">/{selectedWeight ? selectedWeight.label : product.unit}</span>
              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                  <span className="bg-green-100 text-green-700 text-sm font-medium px-2 py-0.5 rounded">
                    Save ₹{(product.price - baseDiscountedPrice).toFixed(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Origin & Stock */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              {product.origin && (
                <div className="flex items-center gap-1.5 text-earth-600">
                  <MapPin size={14} /> {product.origin}
                </div>
              )}
              {product.weight && !weightOptions.length && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Package size={14} /> {product.weight}
                </div>
              )}
              <div className={`flex items-center gap-1.5 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : '✗ Out of Stock'}
              </div>
            </div>

            {/* Quantity + Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-0 border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold text-forest-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Total */}
            {quantity > 1 && (
              <p className="text-sm text-gray-500 mb-6">
                Total: <span className="font-bold text-forest-800">₹{(displayPrice * quantity).toFixed(0)}</span>
              </p>
            )}

            {/* Free shipping notice */}
            <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mb-6 text-sm text-forest-700">
              🚚 Free delivery on orders above ₹999 · Usually ships in 2–4 business days
            </div>

            {/* Accordions */}
            <Accordion title="Product Description" defaultOpen={true} icon={<Leaf size={16} className="text-forest-600" />}>
              <p className="whitespace-pre-line">{product.description}</p>
            </Accordion>

            {healthBenefits.length > 0 && (
              <Accordion title="Health Benefits" icon={<Heart size={16} className="text-rose-500" />}>
                <ul className="space-y-2">
                  {healthBenefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Accordion>
            )}

            {cookingTips.length > 0 && (
              <Accordion title="Cooking Tips" icon={<Flame size={16} className="text-orange-500" />}>
                <ol className="space-y-2 list-none">
                  {cookingTips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="bg-earth-100 text-earth-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>
              </Accordion>
            )}

            {product.nutritional_info && (
              <Accordion title="Nutritional Information" icon={<Package size={16} className="text-blue-500" />}>
                <p className="whitespace-pre-line">{product.nutritional_info}</p>
              </Accordion>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-forest-900 mb-8">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map(r => (
                <div key={r.id} className="card p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  {r.title && <h4 className="font-semibold text-forest-900 mb-2">{r.title}</h4>}
                  <p className="text-gray-500 text-sm">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-3">{r.customer_name} · {new Date(r.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
