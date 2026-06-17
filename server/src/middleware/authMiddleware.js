import { supabase } from '../lib/supabaseClient.js'

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return res.status(401).json({ error: 'Invalid token' })

    req.user = user
    next()
  } catch (err) {
    res.status(500).json({ error: 'Server error in auth middleware' })
  }
}

export const requireRole = (role) => {
  return async (req, res, next) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single()

    if (error || !data) return res.status(403).json({ error: 'Profile not found' })
    if (data.role !== role) return res.status(403).json({ error: `Only ${role}s can do this` })

    req.userRole = data.role
    next()
  }
}