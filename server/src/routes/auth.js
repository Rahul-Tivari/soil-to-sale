import express from 'express'
import { supabase } from '../lib/supabaseClient.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (!['farmer', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be farmer or buyer' })
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    })

    if (error) return res.status(400).json({ error: error.message })

    res.status(201).json({
      message: 'Registration successful',
      user: data.user
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) return res.status(401).json({ error: error.message })

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' })
  }
})

// Get current user (protected)
router.get('/me', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) return res.status(404).json({ error: 'Profile not found' })

    res.json({ user: data })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router