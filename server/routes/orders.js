const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/orders/create-payment — create Razorpay order
router.post('/create-payment', async (req, res) => {
  if (!razorpay) return res.status(503).json({ error: 'Payment gateway not configured' });
  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'No items provided' });

    const settingsRes = await db.query(
      "SELECT key, value FROM site_settings WHERE key IN ('free_shipping_above','shipping_charge')"
    );
    const sm = {};
    settingsRes.rows.forEach(r => { sm[r.key] = r.value; });
    const FREE_ABOVE = parseFloat(sm['free_shipping_above'] || 999);
    const SHIP_CHARGE = parseFloat(sm['shipping_charge'] || 99);

    let subtotal = 0;
    for (const item of items) {
      const pid = parseInt(item.product_id);
      const pr = await db.query('SELECT price, discount_percentage FROM products WHERE id=$1 AND is_active=true', [pid]);
      if (!pr.rows.length) throw new Error(`Product ${pid} not found`);
      const p = pr.rows[0];
      subtotal += p.price * (1 - p.discount_percentage / 100) * item.quantity;
    }

    const shipping = subtotal >= FREE_ABOVE ? 0 : SHIP_CHARGE;
    const total = Math.round((subtotal + shipping) * 100); // paise

    const rzpOrder = await razorpay.orders.create({
      amount: total,
      currency: 'INR',
      receipt: `hr_${Date.now()}`,
    });

    res.json({ razorpay_order_id: rzpOrder.id, amount: rzpOrder.amount, currency: 'INR' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Payment initiation failed' });
  }
});

// POST /api/orders/verify-payment — verify Razorpay signature
router.post('/verify-payment', (req, res) => {
  if (!razorpay) return res.status(503).json({ error: 'Payment gateway not configured' });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment fields' });
  }
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (expected === razorpay_signature) {
    res.json({ verified: true });
  } else {
    res.status(400).json({ error: 'Payment verification failed — invalid signature' });
  }
});

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

// PATCH /api/orders/:id/status — update order status + tracking (admin)
router.patch('/:id/status', authenticateAdmin, async (req, res) => {
  const { status, payment_status, tracking_number, courier_partner, note } = req.body;
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE orders SET
         status            = COALESCE($1, status),
         payment_status    = COALESCE($2, payment_status),
         tracking_number   = COALESCE($3, tracking_number),
         courier_partner   = COALESCE($4, courier_partner),
         processing_at     = CASE WHEN $1 = 'confirmed'  AND processing_at IS NULL THEN NOW() ELSE processing_at END,
         shipped_at        = CASE WHEN $1 = 'shipped'    AND shipped_at    IS NULL THEN NOW() ELSE shipped_at    END,
         delivered_at      = CASE WHEN $1 = 'delivered'  AND delivered_at  IS NULL THEN NOW() ELSE delivered_at  END,
         cancelled_at      = CASE WHEN $1 = 'cancelled'  AND cancelled_at  IS NULL THEN NOW() ELSE cancelled_at  END,
         updated_at        = NOW()
       WHERE id = $5 RETURNING *`,
      [status || null, payment_status || null, tracking_number || null, courier_partner || null, req.params.id]
    );

    if (result.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Order not found' }); }

    // Log status change to tracking history
    if (status) {
      await client.query(
        `INSERT INTO order_tracking (order_id, status, note, tracking_number) VALUES ($1,$2,$3,$4)`,
        [req.params.id, status, note || null, tracking_number || null]
      );
    }

    await client.query('COMMIT');
    res.json({ order: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// GET /api/orders/:id/tracking — get status history (admin)
router.get('/:id/tracking', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM order_tracking WHERE order_id=$1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json({ tracking: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
