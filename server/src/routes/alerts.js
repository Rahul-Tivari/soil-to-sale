import express from 'express'
import { supabase } from '../lib/supabaseClient.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// POST create alert (buyers only)
router.post('/', protect, requireRole('buyer'), async (req, res) => {
  try {
    const { product_id, target_price } = req.body

    if (!product_id || !target_price) {
      return res.status(400).json({ error: 'Product ID and target price are required' })
    }

    // Check product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price_per_unit')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (target_price >= product.price_per_unit) {
      return res.status(400).json({ 
        error: `Target price must be lower than current price (₹${product.price_per_unit})` 
      })
    }

    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        buyer_id: req.user.id,
        product_id,
        target_price
      })
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })

    res.status(201).json({ message: 'Price alert created', alert: data })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET buyer's own alerts
router.get('/', protect, requireRole('buyer'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('price_alerts')
      .select(`
        *,
        products (name, price_per_unit, unit)
      `)
      .eq('buyer_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ error: error.message })

    res.json({ alerts: data })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE alert
router.delete('/:id', protect, requireRole('buyer'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', req.params.id)
      .eq('buyer_id', req.user.id)

    if (error) return res.status(400).json({ error: error.message })

    res.json({ message: 'Alert deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router