import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import ImageUpload from '../../components/ImageUpload'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Others']
const UNITS = ['kg', 'g', 'litre', 'piece', 'dozen', 'quintal']

const emptyForm = {
  name: '', category: 'Vegetables', price_per_unit: '',
  unit: 'kg', quantity_available: '', description: '', image_url: ''
}

export default function FarmerProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/farmer/my-products')
      setProducts(res.data.products || [])
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price_per_unit || !form.quantity_available) {
      return toast.error('Name, price and quantity are required')
    }
    setSubmitting(true)
    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, form)
        toast.success('Product updated!')
      } else {
        await api.post('/products', form)
        toast.success('Product added!')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category || 'Vegetables',
      price_per_unit: product.price_per_unit,
      unit: product.unit,
      quantity_available: product.quantity_available,
      description: product.description || '',
      image_url: product.image_url || ''
    })
    setEditingId(product.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted')
      fetchProducts()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-400 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''} listed</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}
            className="btn-primary flex items-center gap-2">
            <span>+</span> Add Product
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="md:col-span-2">
                  <label className="label">Product Image</label>
                  <ImageUpload
                    value={form.image_url}
                    onChange={(url) => setForm({ ...form, image_url: url })}
                  />
                </div>

                <div>
                  <label className="label">Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Fresh Tomatoes" className="input" />
                </div>

                <div>
                  <label className="label">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="input">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Price per Unit (₹) *</label>
                  <input name="price_per_unit" value={form.price_per_unit} onChange={handleChange}
                    type="number" min="0" step="0.01" placeholder="25.00" className="input" />
                </div>

                <div>
                  <label className="label">Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange} className="input">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Quantity Available *</label>
                  <input name="quantity_available" value={form.quantity_available} onChange={handleChange}
                    type="number" min="0" placeholder="100" className="input" />
                </div>

                <div>
                  <label className="label">Description</label>
                  <input name="description" value={form.description} onChange={handleChange}
                    placeholder="Short description..." className="input" />
                </div>

                <div className="md:col-span-2 flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
                    className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : products.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🌾</div>
            <h3 className="font-semibold text-gray-700 mb-1">No products yet</h3>
            <p className="text-gray-400 text-sm">Click "Add Product" to list your first product</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="card overflow-hidden hover:shadow-md transition-shadow">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-5xl">
                    🌿
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-800">{p.name}</h3>
                    <span className="badge bg-green-50 text-green-700 text-xs ml-2 flex-shrink-0">{p.category}</span>
                  </div>
                  <div className="text-green-600 font-bold text-lg mb-1">₹{p.price_per_unit}/{p.unit}</div>
                  <div className={`text-xs font-medium mb-3 ${p.quantity_available > 10 ? 'text-gray-400' : 'text-red-400'}`}>
                    {p.quantity_available} {p.unit} in stock
                  </div>
                  {p.description && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button onClick={() => handleEdit(p)}
                      className="flex-1 text-center text-xs font-medium text-blue-600 hover:text-blue-800 py-1.5 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="flex-1 text-center text-xs font-medium text-red-500 hover:text-red-700 py-1.5 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}