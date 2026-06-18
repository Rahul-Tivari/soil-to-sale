import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Others']

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
            <p className="text-gray-500 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''} listed</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Product
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Fresh Tomatoes"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category" value={form.category} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (₹) *</label>
                <input
                  name="price_per_unit" value={form.price_per_unit} onChange={handleChange}
                  type="number" min="0" step="0.01" placeholder="25.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  name="unit" value={form.unit} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {['kg', 'g', 'litre', 'piece', 'dozen', 'quintal'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available *</label>
                <input
                  name="quantity_available" value={form.quantity_available} onChange={handleChange}
                  type="number" min="0" placeholder="100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <input
                  name="image_url" value={form.image_url} onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description" value={form.description} onChange={handleChange}
                  rows={3} placeholder="Describe your product..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit" disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-2 rounded-lg text-sm font-medium"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button" onClick={handleCancel}
                  className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">🌾</div>
            <p className="text-gray-500">No products yet. Click "Add Product" to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-lg">🌿</div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800">{p.name}</div>
                          <div className="text-gray-400 text-xs">{p.description?.slice(0, 40)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{p.category || '—'}</td>
                    <td className="px-6 py-4 font-medium text-green-600">₹{p.price_per_unit}/{p.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.quantity_available > 10
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {p.quantity_available} {p.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}