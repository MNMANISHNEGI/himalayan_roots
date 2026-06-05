import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const EMPTY = { name: '', description: '', image_url: '' }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchCategories = () => {
    setLoading(true)
    api.get('/categories').then(res => setCategories(res.data.categories)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form)
        toast.success('Category updated')
      } else {
        await api.post('/categories', form)
        toast.success('Category created')
      }
      setModal(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted')
      setDeleteConfirm(null)
      fetchCategories()
    } catch {
      toast.error('Cannot delete category with products')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)
        ) : categories.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <FolderOpen size={40} className="mx-auto mb-3 text-gray-200" />
            No categories yet
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 bg-forest-100 rounded-xl flex items-center justify-center text-forest-700">
                  <FolderOpen size={22} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-forest-700">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteConfirm(cat.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{cat.description || 'No description'}</p>
              <div className="text-xs text-forest-600 font-medium">{cat.product_count} products</div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-xl text-gray-900">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                <input className="input-field" placeholder="e.g. Rajma & Pulses" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea className="input-field" rows={3} placeholder="Brief description of this category..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : (editing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Category?</h3>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone. Products in this category will become uncategorized.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
