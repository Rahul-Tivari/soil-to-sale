import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [alertPrice, setAlertPrice] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [alerting, setAlerting] = useState(false)

  useEffect(() => { fetchProduct() }, [id])

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`)
      setProduct(res.data.product)
    } catch (err) {
      toast.error('Product not found')
      navigate('/buyer/marketplace')
    } finally {
      setLoading(false)
    }
  }

  const handleOrder = async () => {
    setOrdering(true)
    try {
      await api.post('/orders', {
        items: [{ product_id: product.id, quantity }]
      })
      toast.success('Order placed!')
      navigate('/buyer/orders')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setOrdering(false)
    }
  }

  const handleAlert = async () => {
    if (!alertPrice) return toast.error('Enter a target price')
    setAlerting(true)
    try {
      await api.post('/alerts', {
        product_id: product.id,
        target_price: parseFloat(alertPrice)
      })
      toast.success('Price alert set!')
      setAlertPrice('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to set alert')
    } finally {
      setAlerting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-400">Loading...</div>
    </div>
  )

  if (!product) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate('/buyer/marketplace')}
          className="text-sm text-gray-500 hover:text-green-600 mb-6 flex items-center gap-1"
        >
          ← Back to Marketplace
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name}
                className="w-full h-72 object-cover rounded-xl" />
            ) : (
              <div className="w-full h-72 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center text-7xl">
                🌿
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="text-sm text-gray-400 mb-1">{product.category}</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <div className="text-sm text-gray-500 mb-4">
              Sold by <span className="font-medium text-gray-700">{product.profiles?.name}</span>
              {product.profiles?.location && ` · ${product.profiles.location}`}
            </div>

            <div className="text-3xl font-bold text-green-600 mb-1">
              ₹{product.price_per_unit}/{product.unit}
            </div>
            <div className="text-sm text-gray-500 mb-6">
              {product.quantity_available} {product.unit} available
            </div>

            {product.description && (
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">{product.description}</p>
            )}

            {/* Order section */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="text-sm font-medium text-gray-700 mb-3">Place Order</div>
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm text-gray-600">Quantity ({product.unit})</label>
                <input
                  type="number" min="1" max={product.quantity_available}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Total: <span className="font-bold text-green-600">₹{product.price_per_unit * quantity}</span>
              </div>
              <button
                onClick={handleOrder}
                disabled={ordering || product.quantity_available === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white py-2.5 rounded-lg text-sm font-medium"
              >
                {ordering ? 'Placing order...' : 'Buy Now'}
              </button>
            </div>

            {/* Price alert section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">🔔 Set Price Alert</div>
              <div className="text-xs text-gray-500 mb-3">
                Get notified when price drops below your target
              </div>
              <div className="flex gap-2">
                <input
                  type="number" min="0" step="0.01"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  placeholder={`Below ₹${product.price_per_unit}`}
                  className="border border-yellow-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  onClick={handleAlert}
                  disabled={alerting}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                >
                  {alerting ? '...' : 'Set Alert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}