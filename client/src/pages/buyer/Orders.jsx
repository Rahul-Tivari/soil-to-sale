import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:   { color: 'bg-yellow-100 text-yellow-700', icon: '⏳', label: 'Pending' },
  confirmed: { color: 'bg-blue-100 text-blue-700',    icon: '✅', label: 'Confirmed' },
  dispatched:{ color: 'bg-purple-100 text-purple-700',icon: '🚚', label: 'Dispatched' },
  delivered: { color: 'bg-green-100 text-green-700',  icon: '🎉', label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-700',      icon: '❌', label: 'Cancelled' },
}

const STEPS = ['pending', 'confirmed', 'dispatched', 'delivered']

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="font-semibold text-gray-700 mb-1">No orders yet</h3>
            <p className="text-gray-400 text-sm">Visit the marketplace to buy fresh produce directly from farmers.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const stepIndex = STEPS.indexOf(order.status)

              return (
                <div key={order.id} className="card p-6">
                  {/* Order header */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Order ID</div>
                      <div className="font-mono text-sm font-medium text-gray-700">#{order.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">₹{order.total_amount}</div>
                      <span className={`badge ${config.color} mt-1 inline-flex items-center gap-1`}>
                        {config.icon} {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Order timeline */}
                  {order.status !== 'cancelled' && (
                    <div className="mb-5">
                      <div className="flex items-center gap-0">
                        {STEPS.map((step, idx) => (
                          <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              idx <= stepIndex
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {idx < stepIndex ? '✓' : idx + 1}
                            </div>
                            {idx < STEPS.length - 1 && (
                              <div className={`h-1 flex-1 mx-1 rounded ${idx < stepIndex ? 'bg-green-600' : 'bg-gray-100'}`} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1.5">
                        {STEPS.map((step) => (
                          <div key={step} className="text-xs text-gray-400 capitalize flex-1 text-center first:text-left last:text-right">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order items */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Items</div>
                    <div className="space-y-2">
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-sm">🌿</div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">{item.products?.name}</div>
                              <div className="text-xs text-gray-400">{item.quantity} {item.products?.unit} × ₹{item.price_at_purchase}</div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-green-600">
                            ₹{item.quantity * item.price_at_purchase}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}