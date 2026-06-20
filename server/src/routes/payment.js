import express from 'express'
import { supabase } from '../lib/supabaseClient.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// Simulate payment order creation
router.post('/create-order', protect, requireRole('buyer'), async (req, res) => {
  try {
    const { amount, items } = req.body

    if (!amount || !items || items.length === 0) {
      return res.status(400).json({ error: 'Amount and items are required' })
    }

    // Generate a fake Razorpay-like order ID
    const fakeOrderId = 'order_' + Date.now() + Math.random().toString(36).slice(2, 9)

    res.json({
      id: fakeOrderId,
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      status: 'created'
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment order' })
  }
})

// Verify payment and create order
router.post('/verify', protect, requireRole('buyer'), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, items } = req.body

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Payment details missing' })
    }

    // Fetch product prices from DB
    const productIds = items.map(i => i.product_id)
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, price_per_unit, quantity_available, name')
      .in('id', productIds)

    if (productError) return res.status(400).json({ error: productError.message })

    // Calculate total
    let total = 0
    for (const item of items) {
      const product = products.find(p => p.id === item.product_id)
      if (!product) return res.status(404).json({ error: 'Product not found' })
      if (item.quantity > product.quantity_available) {
        return res.status(400).json({ error: `Not enough stock for ${product.name}` })
      }
      total += product.price_per_unit * item.quantity
    }

    // Create order in DB
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: req.user.id,
        total_amount: total,
        status: 'confirmed',
        payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id
      })
      .select()
      .single()

    if (orderError) return res.status(400).json({ error: orderError.message })

    // Create order items
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.product_id)
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: product.price_per_unit
      }
    })

    await supabase.from('order_items').insert(orderItems)

    // Reduce stock
    for (const item of items) {
      const product = products.find(p => p.id === item.product_id)
      await supabase
        .from('products')
        .update({ quantity_available: product.quantity_available - item.quantity })
        .eq('id', item.product_id)
    }

    res.json({ message: 'Payment verified and order created', order })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router