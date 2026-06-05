const express = require('express')
const db = require('../db')
const { authenticateAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/settings — public (used by frontend for shipping threshold, whatsapp, etc.)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT key, value FROM site_settings')
    const settings = {}
    result.rows.forEach(row => { settings[row.key] = row.value })
    res.json({ settings })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/settings — admin only, bulk upsert
router.put('/', authenticateAdmin, async (req, res) => {
  const { settings } = req.body
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'settings object required' })
  }
  try {
    const client = await db.getClient()
    await client.query('BEGIN')
    for (const [key, value] of Object.entries(settings)) {
      await client.query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value)]
      )
    }
    await client.query('COMMIT')
    client.release()

    const result = await db.query('SELECT key, value FROM site_settings')
    const updated = {}
    result.rows.forEach(row => { updated[row.key] = row.value })
    res.json({ settings: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
