import { useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function PaymentModal({ cart, total, onClose }) {
  const [step, setStep] = useState('details') // details → processing → success
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const formatCard = (val) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val) => {
    return val.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/')
  }

  const handlePay = async () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      return toast.error('Please fill in all card details')
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      return toast.error('Enter a valid 16-digit card number')
    }

    setStep('processing')

    try {
      // Step 1: Create payment order
      const orderRes = await api.post('/payment/create-order', {
        amount: total,
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
      })

      const { id: razorpay_order_id } = orderRes.data

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 2: Verify payment and create order
      const paymentId = 'pay_' + Date.now()
      await api.post('/payment/verify', {
        razorpay_order_id,
        razorpay_payment_id: paymentId,
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
      })

      setStep('success')

      setTimeout(() => {
        navigate('/buyer/orders')
      }, 2500)

    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed')
      setStep('details')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#072654] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-white font-bold text-xl">razorpay</div>
          </div>
          {step === 'details' && (
            <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
          )}
        </div>

        {/* Amount bar */}
        <div className="bg-[#0d3b80] px-6 py-3">
          <div className="text-white/70 text-xs">Total Amount</div>
          <div className="text-white text-2xl font-bold">₹{total}</div>
        </div>

        {step === 'details' && (
          <div className="p-6">
            <div className="flex gap-3 mb-5 border-b border-gray-100 pb-4">
              <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-2">💳 Card</button>
              <button className="text-sm font-medium text-gray-400 pb-2">🏦 Netbanking</button>
              <button className="text-sm font-medium text-gray-400 pb-2">📱 UPI</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Card Number</label>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  placeholder="4111 1111 1111 1111"
                  className="input font-mono"
                  maxLength={19}
                />
              </div>

              <div>
                <label className="label">Name on Card</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Expiry</label>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="input font-mono"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="label">CVV</label>
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="•••"
                    type="password"
                    className="input font-mono"
                    maxLength={3}
                  />
                </div>
              </div>

              <button
                onClick={handlePay}
                className="w-full bg-[#072654] hover:bg-[#0d3b80] text-white font-medium py-3 rounded-xl transition-colors mt-2"
              >
                Pay ₹{total} Securely
              </button>

              <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                🔒 Secured by Razorpay
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="font-semibold text-gray-800 mb-1">Processing Payment</div>
            <div className="text-gray-400 text-sm">Please wait, do not close this window...</div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <div className="font-bold text-gray-800 text-lg mb-1">Payment Successful!</div>
            <div className="text-gray-400 text-sm mb-2">₹{total} paid successfully</div>
            <div className="text-green-600 text-sm font-medium">Redirecting to your orders...</div>
          </div>
        )}
      </div>
    </div>
  )
}