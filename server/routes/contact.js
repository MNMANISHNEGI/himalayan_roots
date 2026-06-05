const express = require('express');
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/contact — submit message (public)
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  try {
    await db.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)',
      [name, email, phone, subject, message]
    );
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/contact — list messages (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ messages: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/contact/:id/read
router.patch('/:id/read', authenticateAdmin, async (req, res) => {
  try {
    await db.query('UPDATE contact_messages SET is_read=true WHERE id=$1', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
