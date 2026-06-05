const express = require('express');
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const [products, orders, revenue, messages, recentOrders, topProducts] = await Promise.all([
      db.query('SELECT COUNT(*) FROM products WHERE is_active=true'),
      db.query('SELECT COUNT(*) FROM orders'),
      db.query('SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE payment_status=$1', ['paid']),
      db.query('SELECT COUNT(*) FROM contact_messages WHERE is_read=false'),
      db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'),
      db.query(`
        SELECT p.name, SUM(oi.quantity) as units_sold, SUM(oi.total_price) as revenue
        FROM order_items oi JOIN products p ON oi.product_id = p.id
        GROUP BY p.id, p.name ORDER BY units_sold DESC LIMIT 5
      `),
    ]);

    const ordersByStatus = await db.query(`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `);

    const salesByMonth = await db.query(`
      SELECT DATE_TRUNC('month', created_at) as month, SUM(total_amount) as revenue, COUNT(*) as orders
      FROM orders WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month ORDER BY month
    `);

    res.json({
      stats: {
        total_products: parseInt(products.rows[0].count),
        total_orders: parseInt(orders.rows[0].count),
        total_revenue: parseFloat(revenue.rows[0].total),
        unread_messages: parseInt(messages.rows[0].count),
      },
      recent_orders: recentOrders.rows,
      top_products: topProducts.rows,
      orders_by_status: ordersByStatus.rows,
      sales_by_month: salesByMonth.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
