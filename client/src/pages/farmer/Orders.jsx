import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

export default function FarmerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/farmer-orders')
      setOrders(res.data.orders || [])
    } catch (err) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      toast.success(`Order marked as ${status}`)
      fetchOrders()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Incoming Orders</h1>
        <p className="text-gray-500 text-sm mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''} received</p>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-500">No orders yet. Orders will appear here when buyers purchase your products.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl">
                      🌿
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{item.products?.name}</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        Qty: {item.quantity} {item.products?.unit} · ₹{item.price_at_purchase}/{item.products?.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        Buyer: {item.orders?.profiles?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.orders?.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">₹{item.orders?.total_amount}</div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[item.orders?.status]}`}>
                        {item.orders?.status}
                      </span>
                    </div>

                    {/* Status update dropdown */}
                    {item.orders?.status !== 'delivered' && item.orders?.status !== 'cancelled' && (
                      <select
                        onChange={(e) => updateStatus(item.orders?.id, e.target.value)}
                        defaultValue=""
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="" disabled>Update status</option>
                        <option value="confirmed">Confirm</option>
                        <option value="dispatched">Dispatch</option>
                        <option value="delivered">Deliver</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    )}
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