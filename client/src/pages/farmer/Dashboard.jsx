import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../lib/api'
import { Link } from 'react-router-dom'


export default function FarmerDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

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

  const stats = [
    { 
      label: 'Total Products', 
      value: products.length, 
      icon: '🌾', 
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700'
    },
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: '📦', 
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700'
    },
    { 
      label: 'Pending Orders', 
      value: orders.filter(o => o.orders?.status === 'pending').length, 
      icon: '⏳', 
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-700'
    },
    { 
      label: 'Delivered Orders', 
      value: orders.filter(o => o.orders?.status === 'delivered').length, 
      icon: '✅', 
      color: 'bg-emerald-50 border-emerald-200',
      textColor: 'text-emerald-700'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Farmer Dashboard</h1>
        <p className="text-gray-500 text-sm mb-8">Overview of your farm store</p>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {stats.map((stat) => (
                <div key={stat.label} className={`border rounded-xl p-5 ${stat.color}`}>
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Products</h2>
                <Link to="/farmer/products" className="text-sm text-green-600 hover:underline">View all →</Link>
                  View all →
              </div>
              {products.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">
                  No products yet. <Link to="/farmer/products" className="text-green-600 hover:underline">Add your first product</Link>
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-3 font-medium">Product</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((p) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 font-medium text-gray-800">{p.name}</td>
                          <td className="py-3 text-gray-500">{p.category || '—'}</td>
                          <td className="py-3 text-green-600 font-medium">₹{p.price_per_unit}/{p.unit}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              p.quantity_available > 10 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {p.quantity_available} {p.unit}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                <Link to="/farmer/orders" className="text-sm text-green-600 hover:underline">View all →</Link>
                  View all →
              </div>
              {orders.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-3 font-medium">Product</th>
                        <th className="pb-3 font-medium">Qty</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((item) => (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 font-medium text-gray-800">{item.products?.name}</td>
                          <td className="py-3 text-gray-500">{item.quantity} {item.products?.unit}</td>
                          <td className="py-3 text-green-600 font-medium">₹{item.orders?.total_amount}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.orders?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              item.orders?.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                              item.orders?.status === 'dispatched' ? 'bg-purple-100 text-purple-700' :
                              item.orders?.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {item.orders?.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}