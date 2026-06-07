import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search, X, Upload, Package, PlusCircle, MinusCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const EMPTY_FORM = {
  name: '', short_description: '', description: '', price: '', discount_percentage: '0',
  stock: '', unit: 'kg', category_id: '', is_featured: 'false', is_active: 'true',
  weight: '', origin: '', nutritional_info: '', health_benefits: '', cooking_tips: '',
}

const API_BASE = import.meta.env.VITE_API_URL || ''

function getImageSrc(preview) {
  if (!preview) return ''
  if (preview.startsWith('blob:') || preview.startsWith('http')) return preview
  return `${API_BASE}${preview}`
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [weightOptions, setWeightOptions] = useState([])
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchProducts = () => {
    setLoading(true)
    api.get(`/products/admin/all${search ? `?search=${search}` : ''}`)
      .then(res => setProducts(res.data.products))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [search])

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.categories)).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview('')
    setWeightOptions([])
    setModal(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name || '',
      short_description: product.short_description || '',
      description: product.description || '',
      price: product.price || '',
      discount_percentage: product.discount_percentage || '0',
      stock: product.stock || '',
      unit: product.unit || 'kg',
      category_id: product.category_id || '',
      is_featured: product.is_featured ? 'true' : 'false',
      is_active: product.is_active ? 'true' : 'false',
      weight: product.weight || '',
      origin: product.origin || '',
      nutritional_info: product.nutritional_info || '',
      health_benefits: product.health_benefits || '',
      cooking_tips: product.cooking_tips || '',
    })
    const opts = typeof product.weight_options === 'string'
      ? JSON.parse(product.weight_options)
      : (product.weight_options || [])
    setWeightOptions(opts)
    setImagePreview(product.image_url || '')
    setImageFile(null)
    setModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const addWeightOpt = () => setWeightOptions(w => [...w, { label: '', price: '' }])
  const removeWeightOpt = (i) => setWeightOptions(w => w.filter((_, idx) => idx !== i))
  const updateWeightOpt = (i, field, val) =>
    setWeightOptions(w => w.map((o, idx) => idx === i ? { ...o, [field]: val } : o))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('weight_options', JSON.stringify(weightOptions))
      if (imageFile) fd.append('image', imageFile)

      if (editing) {
        await api.put(`/products/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product updated')
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product created')
      }
      setModal(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deactivated')
      setDeleteConfirm(null)
      fetchProducts()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 bg-white max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Product</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Category</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Price</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Stock</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-3">
                      <div className="h-8 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Package size={40} className="mx-auto mb-3 text-gray-200" />
                    No products found
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.image_url && (
                          <img
                            src={getImageSrc(p.image_url)}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1">{p.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{p.category_name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-forest-800">₹{parseFloat(p.price).toFixed(0)}</div>
                      {p.discount_percentage > 0 && (
                        <div className="text-xs text-earth-500">{p.discount_percentage}% off</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-medium ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        {p.is_active ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">Active</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full font-medium">Inactive</span>
                        )}
                        {p.is_featured && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-forest-50 text-gray-500 hover:text-forest-700 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-xl text-gray-900">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="flex gap-4 items-start">
                  <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                    {imagePreview ? (
                      <img src={getImageSrc(imagePreview)} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <Upload size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="product-image" />
                    <label htmlFor="product-image" className="btn-outline cursor-pointer inline-flex items-center gap-2 text-sm">
                      <Upload size={16} /> {imagePreview ? 'Change Image' : 'Upload Image'}
                    </label>
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP up to 5MB</p>
                    {editing && !imageFile && imagePreview && (
                      <p className="text-xs text-forest-600 mt-1">Current image shown above</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                  <input className="input-field" placeholder="e.g. Rajma Chakrata" value={form.name} onChange={e => upd('name', e.target.value)} required />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description</label>
                  <input className="input-field" placeholder="Brief tagline shown in listings" value={form.short_description} onChange={e => upd('short_description', e.target.value)} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description</label>
                  <textarea className="input-field" rows={4} placeholder="Detailed product description..." value={form.description} onChange={e => upd('description', e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
                  <input type="number" step="0.01" min="0" className="input-field" placeholder="299" value={form.price} onChange={e => upd('price', e.target.value)} required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount (%)</label>
                  <input type="number" step="0.01" min="0" max="100" className="input-field" placeholder="0" value={form.discount_percentage} onChange={e => upd('discount_percentage', e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
                  <input type="number" min="0" className="input-field" placeholder="50" value={form.stock} onChange={e => upd('stock', e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
                  <select className="input-field" value={form.unit} onChange={e => upd('unit', e.target.value)}>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="500g">500g</option>
                    <option value="1kg">1kg</option>
                    <option value="ml">ml</option>
                    <option value="litre">litre</option>
                    <option value="piece">piece</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select className="input-field" value={form.category_id} onChange={e => upd('category_id', e.target.value)}>
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight/Pack size</label>
                  <input className="input-field" placeholder="500g, 1kg..." value={form.weight} onChange={e => upd('weight', e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Origin</label>
                  <input className="input-field" placeholder="Chakrata, Uttarakhand" value={form.origin} onChange={e => upd('origin', e.target.value)} />
                </div>

                {/* Weight/Size Options */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size Options (Optional)</label>
                  <p className="text-xs text-gray-400 mb-2">Add multiple pack sizes with different prices. If left empty, base price above is used.</p>
                  <div className="space-y-2">
                    {weightOptions.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          className="input-field flex-1"
                          placeholder="Label (e.g. 250g, 500g, 1kg)"
                          value={opt.label}
                          onChange={e => updateWeightOpt(idx, 'label', e.target.value)}
                        />
                        <span className="text-gray-400 text-sm shrink-0">₹</span>
                        <input
                          type="number"
                          className="input-field w-28"
                          placeholder="Price"
                          value={opt.price}
                          onChange={e => updateWeightOpt(idx, 'price', e.target.value)}
                        />
                        <button type="button" onClick={() => removeWeightOpt(idx)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                          <MinusCircle size={20} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addWeightOpt} className="flex items-center gap-1.5 text-sm text-forest-700 hover:text-forest-900 transition-colors font-medium">
                      <PlusCircle size={16} /> Add size option
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nutritional Information</label>
                  <textarea className="input-field" rows={2} placeholder="Protein: 20g, Calories: 320kcal, Iron: 4mg..." value={form.nutritional_info} onChange={e => upd('nutritional_info', e.target.value)} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Health Benefits</label>
                  <textarea className="input-field" rows={3} placeholder="One benefit per line, e.g.&#10;High in plant protein&#10;Rich in iron and calcium&#10;Good source of dietary fibre" value={form.health_benefits} onChange={e => upd('health_benefits', e.target.value)} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cooking Tips</label>
                  <textarea className="input-field" rows={3} placeholder="e.g.&#10;Soak overnight for best results&#10;Pressure cook for 3–4 whistles&#10;Pairs well with basmati rice" value={form.cooking_tips} onChange={e => upd('cooking_tips', e.target.value)} />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-forest-700 rounded" checked={form.is_featured === 'true'} onChange={e => upd('is_featured', e.target.checked ? 'true' : 'false')} />
                    <span className="text-sm font-medium text-gray-700">Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-forest-700 rounded" checked={form.is_active !== 'false'} onChange={e => upd('is_active', e.target.checked ? 'true' : 'false')} />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : (editing ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Deactivate Product?</h3>
            <p className="text-gray-500 text-sm mb-6">The product will be hidden from the store but order history will be preserved.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
