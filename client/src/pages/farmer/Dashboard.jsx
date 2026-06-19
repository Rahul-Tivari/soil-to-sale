import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../lib/api'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

export default function FarmerDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products/farmer/my-products'),
        api.get('/orders/farmer-orders')
      ])
      setProducts(productsRes.data.products || [])
      setOrders(ordersRes.data.orders || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = orders
    .filter(o => o.orders?.status === 'delivered')
    .reduce((sum, o) => sum + (o.orders?.total_amount || 0), 0)

  const stats = [
    { label: 'Total Products', value: products.length, icon: '🌾', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
    { label: 'Total Orders', value: orders.length, icon: '📦', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
    { label: 'Pending Orders', value: orders.filter(o => o.orders?.status === 'pending').length, icon: '⏳', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100' },
    { label: 'Revenue Earned', value: `₹${totalRevenue}`, icon: '💰', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Here's what's happening with your farm store today</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Loading your dashboard...</div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className={`card p-5 border ${stat.border}`}>
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>
                    {stat.icon}
                  </div>
                  <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Products */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-gray-800">Recent Products</h2>
                  <Link to="/farmer/products" className="text-xs text-green-600 font-medium hover:underline">
                    View all →
                  </Link>
                </div>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">🌾</div>
                    <p className="text-gray-400 text-sm">No products yet.</p>
                    <Link to="/farmer/products" className="text-green-600 text-sm font-medium hover:underline">
                      Add your first product
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-lg flex-shrink-0">
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                            : '🌿'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 text-sm truncate">{p.name}</div>
                          <div className="text-xs text-gray-400">{p.category}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-semibold text-green-600">₹{p.price_per_unit}</div>
                          <div className="text-xs text-gray-400">{p.quantity_available} {p.unit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-gray-800">Recent Orders</h2>
                  <Link to="/farmer/orders" className="text-xs text-green-600 font-medium hover:underline">
                    View all →
                  </Link>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="text-gray-400 text-sm">No orders received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
                          📦
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 text-sm truncate">{item.products?.name}</div>
                          <div className="text-xs text-gray-400">{item.quantity} {item.products?.unit}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-semibold text-green-600">₹{item.orders?.total_amount}</div>
                          <span className={`badge text-xs ${STATUS_COLORS[item.orders?.status]}`}>
                            {item.orders?.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}