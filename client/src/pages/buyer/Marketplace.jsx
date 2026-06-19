import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Others']
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

export default function Marketplace() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [placing, setPlacing] = useState(false)
  const navigate = useNavigate()

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products || [])
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => { fetchProducts() }, [])

  useEffect(() => {
    let result = [...products]
    if (category !== 'All') result = result.filter(p => p.category === category)
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'price_asc') result.sort((a, b) => a.price_per_unit - b.price_per_unit)
    if (sort === 'price_desc') result.sort((a, b) => b.price_per_unit - a.price_per_unit)
    setFiltered(result)
  }, [search, category, sort, products])


  const addToCart = (product) => {
    const existing = cart.find(i => i.product_id === product.id)
    if (existing) {
      if (existing.quantity >= product.quantity_available) return toast.error('Not enough stock')
      setCart(cart.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, {
        product_id: product.id, name: product.name,
        price: product.price_per_unit, unit: product.unit,
        quantity: 1, max: product.quantity_available
      }])
    }
    toast.success(`${product.name} added to cart`)
  }

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId)
    setCart(cart.map(i => i.product_id === productId ? { ...i, quantity: qty } : i))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(i => i.product_id !== productId))
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  const placeOrder = async () => {
    if (cart.length === 0) return toast.error('Cart is empty')
    setPlacing(true)
    try {
      await api.post('/orders', {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
      })
      toast.success('Order placed successfully!')
      setCart([])
      setShowCart(false)
      navigate('/buyer/orders')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-400 text-sm mt-1">{filtered.length} fresh products available</p>
          </div>
          <button onClick={() => setShowCart(!showCart)}
            className="relative btn-primary flex items-center gap-2">
            🛒 Cart
            {cartCount > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Cart panel */}
        {showCart && (
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🛒 Your Cart
              <span className="text-xs text-gray-400 font-normal">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
            </h2>
            {cart.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🛒</div>
                <p className="text-gray-400 text-sm">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item.product_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm">{item.name}</div>
                        <div className="text-xs text-gray-400">₹{item.price}/{item.unit}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">−</button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">+</button>
                      </div>
                      <div className="font-semibold text-green-600 w-16 text-right text-sm">
                        ₹{item.price * item.quantity}
                      </div>
                      <button onClick={() => removeFromCart(item.product_id)}
                        className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-400">Total amount</div>
                    <div className="text-xl font-bold text-gray-800">₹{cartTotal}</div>
                  </div>
                  <button onClick={placeOrder} disabled={placing} className="btn-primary">
                    {placing ? 'Placing order...' : '✓ Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Search + Filter + Sort */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="input pl-9" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-auto">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  category === c
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-400">No products found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="card overflow-hidden hover:shadow-md transition-all group">
                <Link to={`/products/${product.id}`}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                      🌿
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <div className="text-xs text-gray-400 mb-1">{product.category} · {product.profiles?.name}</div>
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-800 hover:text-green-600 transition-colors mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="text-green-600 font-bold text-lg mb-1">
                    ₹{product.price_per_unit}<span className="text-xs font-normal text-gray-400">/{product.unit}</span>
                  </div>
                  <div className={`text-xs mb-3 ${product.quantity_available > 10 ? 'text-gray-400' : 'text-red-400 font-medium'}`}>
                    {product.quantity_available > 0 ? `${product.quantity_available} ${product.unit} left` : 'Out of stock'}
                  </div>
                  <button onClick={() => addToCart(product)}
                    disabled={product.quantity_available === 0}
                    className="w-full btn-primary disabled:bg-gray-100 disabled:text-gray-400 py-2 text-center">
                    {product.quantity_available === 0 ? 'Out of Stock' : '+ Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}