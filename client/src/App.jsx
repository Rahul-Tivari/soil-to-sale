import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Pages (we'll create these next)
import Login from './pages/Login'
import Register from './pages/Register'
import FarmerDashboard from './pages/farmer/Dashboard'
import FarmerProducts from './pages/farmer/Products'
import FarmerOrders from './pages/farmer/Orders'
import Marketplace from './pages/buyer/Marketplace'
import BuyerOrders from './pages/buyer/Orders'
import ProductDetail from './pages/buyer/ProductDetail'

const ProtectedRoute = ({ children, role }) => {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-gray-600">Loading...</div>
    </div>
  )

  if (!user) return <Navigate to="/login" />
  
  // Wait for profile to load before checking role
  if (role && !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-gray-600">Loading...</div>
    </div>
  )
  
  if (role && profile?.role !== role) return <Navigate to="/login" />

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Farmer routes */}
        <Route path="/farmer/dashboard" element={
          <ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>
        } />
        <Route path="/farmer/products" element={
          <ProtectedRoute role="farmer"><FarmerProducts /></ProtectedRoute>
        } />
        <Route path="/farmer/orders" element={
          <ProtectedRoute role="farmer"><FarmerOrders /></ProtectedRoute>
        } />

        {/* Buyer routes */}
        <Route path="/buyer/marketplace" element={
          <ProtectedRoute role="buyer"><Marketplace /></ProtectedRoute>
        } />
        <Route path="/buyer/orders" element={
          <ProtectedRoute role="buyer"><BuyerOrders /></ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute role="buyer"><ProductDetail /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}