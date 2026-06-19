import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'buyer'
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, email, password, confirmPassword, role } = formData
    if (!name || !email || !password || !confirmPassword) return toast.error('All fields required')
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      await register(email, password, name, role)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
            🌱
          </div>
          <h1 className="text-3xl font-bold text-white">Soil2Sale</h1>
          <p className="text-green-200 mt-1 text-sm">Join thousands of farmers and buyers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Create account</h2>
          <p className="text-gray-400 text-sm mb-6">It's free and takes less than a minute</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { role: 'farmer', icon: '🌾', label: 'I\'m a Farmer', desc: 'Sell my produce' },
              { role: 'buyer', icon: '🛒', label: 'I\'m a Buyer', desc: 'Buy fresh produce' }
            ].map(({ role, icon, label, desc }) => (
              <button key={role} type="button"
                onClick={() => setFormData({ ...formData, role })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.role === role
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-sm font-semibold text-gray-800">{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange}
                placeholder="John Doe" className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Password</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange}
                  placeholder="••••••••" className="input" />
              </div>
              <div>
                <label className="label">Confirm</label>
                <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange}
                  placeholder="••••••••" className="input" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}