const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — place new order (public)
router.post('/', async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { customer_name, customer_email, customer_phone, shipping_address, city, state, pincode, items, payment_method = 'cod', notes } = req.body;

    if (!customer_name || !customer_email || !items?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch dynamic settings (free shipping threshold, shipping charge)
    const settingsRes = await client.query(
      "SELECT key, value FROM site_settings WHERE key IN ('free_shipping_above','shipping_charge')"
    );
    const settingsMap = {};
    settingsRes.rows.forEach(r => { settingsMap[r.key] = r.value; });
    const FREE_SHIPPING_ABOVE = parseFloat(settingsMap['free_shipping_above'] || 999);
    const SHIPPING_CHARGE = parseFloat(settingsMap['shipping_charge'] || 99);

    const order_number = 'HR-' + Date.now().toString().slice(-8);
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const productResult = await client.query('SELECT * FROM products WHERE id=$1 AND is_active=true', [item.product_id]);
      if (productResult.rows.length === 0) throw new Error(`Product ${item.product_id} not found`);
      const product = productResult.rows[0];
      const effectivePrice = product.price * (1 - product.discount_percentage / 100);
      const totalPrice = effectivePrice * item.quantity;
      subtotal += totalPrice;
      orderItems.push({ product, quantity: item.quantity, unit_price: effectivePrice, total_price: totalPrice });
    }

    const shipping_amount = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_CHARGE;
    const total_amount = subtotal + shipping_amount;

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, city, state, pincode, subtotal, shipping_amount, total_amount, payment_method, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [order_number, customer_name, customer_email, customer_phone, shipping_address, city, state, pincode, subtotal, shipping_amount, total_amount, payment_method, notes]
    );

    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, discount_percentage, total_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [order.id, item.product.id, item.product.name, item.quantity, item.unit_price, item.product.discount_percentage, item.total_price]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product.id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ order: { ...order, items: orderItems } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// GET /api/orders — list all orders (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM orders`;
    const params = [];
    if (status) { query += ` WHERE status = $1`; params.push(status); }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);
    const count = await db.query('SELECT COUNT(*) FROM orders');
    res.json({ orders: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/:id — single order (admin)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const order = await db.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
    if (order.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const items = await db.query('SELECT * FROM order_items WHERE order_id=$1', [req.params.id]);
    res.json({ order: order.rows[0], items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/orders/:id/status — update order status (admin)
router.patch('/:id/status', authenticateAdmin, async (req, res) => {
  const { status, payment_status } = req.body;
  try {
    const result = await db.query(
      `UPDATE orders SET status=COALESCE($1,status), payment_status=COALESCE($2,payment_status), updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [status, payment_status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
