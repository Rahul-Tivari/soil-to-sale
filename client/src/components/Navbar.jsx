import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const farmerLinks = [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/farmer/products', label: 'My Products', icon: '🌾' },
    { to: '/farmer/orders', label: 'Orders', icon: '📦' },
  ]

  const buyerLinks = [
    { to: '/buyer/marketplace', label: 'Marketplace', icon: '🛍️' },
    { to: '/buyer/orders', label: 'My Orders', icon: '📋' },
  ]

  const links = profile?.role === 'farmer' ? farmerLinks : buyerLinks

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={profile?.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace'}
            className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm">
              🌱
            </div>
            <span className="text-lg font-bold text-gray-900">Soil<span className="text-green-600">2</span>Sale</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}>
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-800">{profile?.name}</div>
                <div className={`text-xs ${profile?.role === 'farmer' ? 'text-green-600' : 'text-blue-600'}`}>
                  {profile?.role}
                </div>
              </div>
            </div>

            <button onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50">
              <span>→</span> Logout
            </button>

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(link.to) ? 'bg-green-50 text-green-700' : 'text-gray-600'
                }`}>
                {link.icon} {link.label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 font-medium">
              → Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}