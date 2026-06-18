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
    try {
      // Use service role client — bypasses RLS entirely on server side
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .maybeSingle()

      if (error) {
        console.error('requireRole error:', error)
        return res.status(403).json({ error: 'Could not verify role' })
      }

      if (!data) {
        // Profile missing — auto-create it from user metadata
        const meta = req.user.user_metadata
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: req.user.id,
            role: meta?.role || 'buyer',
            name: meta?.name || 'User'
          })
          .select()
          .single()

        if (insertError) {
          console.error('Profile creation error:', insertError)
          return res.status(403).json({ error: 'Profile not found' })
        }

        req.userRole = newProfile.role
        if (newProfile.role !== role) {
          return res.status(403).json({ error: `Only ${role}s can do this` })
        }
        return next()
      }

      if (data.role !== role) {
        return res.status(403).json({ error: `Only ${role}s can do this` })
      }

      req.userRole = data.role
      next()
    } catch (err) {
      console.error('requireRole catch:', err)
      res.status(500).json({ error: 'Server error in role check' })
    }
  }
}