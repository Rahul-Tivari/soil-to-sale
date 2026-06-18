import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌱</span>
        <span className="text-lg font-bold text-green-700">Soil-to-Sale</span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6">
        {profile?.role === 'farmer' && (
          <>
            <Link to="/farmer/dashboard" className="text-sm text-gray-600 hover:text-green-600 font-medium">
              Dashboard
            </Link>
            <Link to="/farmer/products" className="text-sm text-gray-600 hover:text-green-600 font-medium">
              My Products
            </Link>
            <Link to="/farmer/orders" className="text-sm text-gray-600 hover:text-green-600 font-medium">
              Orders
            </Link>
          </>
        )}

        {profile?.role === 'buyer' && (
          <>
            <Link to="/buyer/marketplace" className="text-sm text-gray-600 hover:text-green-600 font-medium">
              Marketplace
            </Link>
            <Link to="/buyer/orders" className="text-sm text-gray-600 hover:text-green-600 font-medium">
              My Orders
            </Link>
          </>
        )}
      </div>

      {/* User info + logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          👤 {profile?.name}
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
            profile?.role === 'farmer' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {profile?.role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}