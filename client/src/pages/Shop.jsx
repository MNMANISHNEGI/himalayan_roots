import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X, SlidersHorizontal, Search } from 'lucide-react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

const SORT_OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const categoryParam = searchParams.get('category') || ''
  const sortParam = searchParams.get('sort') || ''
  const searchParam = searchParams.get('search') || ''
  const pageParam = parseInt(searchParams.get('page') || '1')

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (categoryParam) params.set('category', categoryParam)
    if (sortParam) params.set('sort', sortParam)
    if (searchParam) params.set('search', searchParam)
    params.set('page', pageParam)
    params.set('limit', '12')

    api.get(`/products?${params.toString()}`)
      .then(res => {
        setProducts(res.data.products)
        setPagination(res.data.pagination)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [categoryParam, sortParam, searchParam, pageParam])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.categories)).catch(() => {})
  }, [])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParam('search', searchInput.trim())
  }

  const clearFilters = () => {
    setSearchParams({})
    setSearchInput('')
  }

  const hasFilters = categoryParam || sortParam || searchParam

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <div className="bg-forest-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Our Products</h1>
          <p className="text-forest-200">
            {pagination.total ? `${pagination.total} products` : 'Authentic Himalayan products, sourced with care'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + controls bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary !px-4 !py-2.5">Search</button>
          </form>

          <div className="flex gap-3">
            <select
              value={sortParam}
              onChange={e => updateParam('sort', e.target.value)}
              className="input-field !w-auto"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-colors ${filterOpen ? 'bg-forest-700 text-white border-forest-700' : 'border-gray-300 text-gray-600 hover:border-forest-500'}`}
            >
              <SlidersHorizontal size={16} /> Filters
              {hasFilters && <span className="w-2 h-2 rounded-full bg-earth-500" />}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-forest-900">Filter by Category</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-earth-500 hover:text-earth-700 text-sm font-medium flex items-center gap-1">
                  <X size={14} /> Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateParam('category', '')}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${!categoryParam ? 'bg-forest-700 text-white border-forest-700' : 'border-gray-300 text-gray-600 hover:border-forest-500'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${categoryParam === cat.slug ? 'bg-forest-700 text-white border-forest-700' : 'border-gray-300 text-gray-600 hover:border-forest-500'}`}
                >
                  {cat.name}
                  {cat.product_count > 0 && <span className="ml-1.5 text-xs opacity-70">({cat.product_count})</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filters */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchParam && (
              <span className="flex items-center gap-1.5 bg-forest-100 text-forest-800 px-3 py-1.5 rounded-full text-sm">
                Search: "{searchParam}"
                <button onClick={() => { updateParam('search', ''); setSearchInput('') }}><X size={14} /></button>
              </span>
            )}
            {categoryParam && (
              <span className="flex items-center gap-1.5 bg-forest-100 text-forest-800 px-3 py-1.5 rounded-full text-sm">
                {categories.find(c => c.slug === categoryParam)?.name || categoryParam}
                <button onClick={() => updateParam('category', '')}><X size={14} /></button>
              </span>
            )}
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl animate-pulse bg-gray-200" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏔️</div>
            <h3 className="text-xl font-semibold text-forest-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => updateParam('page', i + 1)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${pageParam === i + 1 ? 'bg-forest-700 text-white' : 'bg-white text-gray-600 hover:bg-forest-50 border border-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
