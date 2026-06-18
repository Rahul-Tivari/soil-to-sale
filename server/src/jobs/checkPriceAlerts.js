import { supabase } from '../lib/supabaseClient.js'

export const checkPriceAlerts = async () => {
  try {
    // Get all untriggered alerts with product info
    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select(`
        *,
        products (name, price_per_unit),
        profiles (email:id)
      `)
      .eq('is_triggered', false)

    if (error || !alerts.length) return

    for (const alert of alerts) {
      const currentPrice = alert.products?.price_per_unit
      if (currentPrice <= alert.target_price) {
        // Mark alert as triggered
        await supabase
          .from('price_alerts')
          .update({ is_triggered: true })
          .eq('id', alert.id)

        console.log(`🔔 Alert triggered: ${alert.products?.name} dropped to ₹${currentPrice}`)
        // Email notification will be added in Day 3 with Nodemailer
      }
    }
  } catch (err) {
    console.error('Price alert check error:', err)
  }
}