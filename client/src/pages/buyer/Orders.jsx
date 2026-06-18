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

export default function BuyerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders')
      setOrders(res.data.orders || [])
    } catch (err) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Orders</h1>
        <p className="text-gray-500 text-sm mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-gray-500">No orders yet. Visit the marketplace to buy products.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-400">Order ID</div>
                    <div className="font-mono text-sm text-gray-600">{order.id.slice(0, 8)}...</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">₹{order.total_amount}</div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-xs font-medium text-gray-500 mb-2">ITEMS</div>
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700">{item.products?.name}</span>
                      <span className="text-gray-500">
                        {item.quantity} {item.products?.unit} × ₹{item.price_at_purchase}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-400 mt-3">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}