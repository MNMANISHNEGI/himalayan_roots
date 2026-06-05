const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [admin.id]);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current admin profile
router.get('/me', authenticateAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

// Create new admin (superadmin only)
router.post('/register', authenticateAdmin, async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only superadmin can create admins' });
  }

  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await db.query(
      'INSERT INTO admin_users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'admin']
    );
    res.status(201).json({ admin: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
