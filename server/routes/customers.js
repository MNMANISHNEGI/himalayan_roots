const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

const router = express.Router()

// POST /api/customers/signup
router.post('/signup', async (req, res) => {
  const {
    email, password, confirm_password,
    first_name, last_name,
    ship_first_name, ship_last_name, ship_email, ship_phone,
    address_line1, address_line2, city, state, country, pincode,
    same_billing_shipping,
  } = req.body

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Email, password, first name and last name are required' })
  }
  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const existing = await db.query('SELECT id FROM customers WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const name = `${first_name} ${last_name}`.trim()

    const result = await db.query(
      `INSERT INTO customers (name, email, phone, password_hash, address_line1, address_line2, city, state, pincode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, name, email, phone, city, state`,
      [
        name, email,
        ship_phone || null,
        password_hash,
        address_line1 || null,
        address_line2 || null,
        city || null,
        state || null,
        pincode || null,
      ]
    )

    const customer = result.rows[0]
    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.status(201).json({
      message: 'Account created successfully',
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/customers/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  try {
    const result = await db.query('SELECT * FROM customers WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const customer = result.rows[0]
    if (!customer.password_hash) {
      return res.status(401).json({ error: 'Please sign up with a password first' })
    }
    const valid = await bcrypt.compare(password, customer.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )
    res.json({
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/customers/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token required' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const result = await db.query(
      'SELECT id, name, email, phone, address_line1, city, state, pincode FROM customers WHERE id = $1',
      [decoded.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' })
    res.json({ customer: result.rows[0] })
  } catch {
    res.status(403).json({ error: 'Invalid token' })
  }
})

module.exports = router
