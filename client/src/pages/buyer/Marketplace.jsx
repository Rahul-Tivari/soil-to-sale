import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Others']

export default function Marketplace() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchProducts() }, [])

  useEffect(() => {
    let result = products
    if (category !== 'All') result = result.filter(p => p.category === category)
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    setFiltered(result)
  }, [search, category, products])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products || [])
      setFiltered(res.data.products || [])
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    const existing = cart.find(i => i.product_id === product.id)
    if (existing) {
      if (existing.quantity >= product.quantity_available) {
        return toast.error('Not enough stock')
      }
      setCart(cart.map(i => i.product_id === product.id
        ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.price_per_unit,
        unit: product.unit,
        quantity: 1,
        max: product.quantity_available
      }])
    }
    toast.success(`${product.name} added to cart`)
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(i => i.product_id !== productId))
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const placeOrder = async () => {
    if (cart.length === 0) return toast.error('Cart is empty')
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
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Marketplace</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} products available</p>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            🛒 Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Cart Panel */}
        {showCart && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Cart</h2>
            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Cart is empty</p>
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  {cart.map(item => (
                    <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">₹{item.price}/{item.unit} × {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-green-600">₹{item.price * item.quantity}</span>
                        <button onClick={() => removeFromCart(item.product_id)}
                          className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="font-bold text-gray-800">Total: ₹{cartTotal}</div>
                  <button onClick={placeOrder}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === c
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/products/${product.id}`}>
  {product.image_url ? (
    <img src={product.image_url} alt={product.name}
      className="w-full h-40 object-cover" />
  ) : (
    <div className="w-full h-40 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-4xl">
      🌿
    </div>
  )}
</Link>
                <div className="p-4">
                  <div className="font-semibold text-gray-800 mb-1">{product.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{product.category} · by {product.profiles?.name}</div>
                  <div className="text-green-600 font-bold mb-1">₹{product.price_per_unit}/{product.unit}</div>
                  <div className="text-xs text-gray-400 mb-3">
                    {product.quantity_available > 0
                      ? `${product.quantity_available} ${product.unit} available`
                      : 'Out of stock'}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.quantity_available === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {product.quantity_available === 0 ? 'Out of Stock' : 'Add to Cart'}
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