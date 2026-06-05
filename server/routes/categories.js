const express = require('express');
const slugify = require('slugify');
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// GET all categories (public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
      GROUP BY c.id ORDER BY c.name
    `);
    res.json({ categories: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create category (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  const { name, description, image_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const slug = slugify(name, { lower: true, strict: true });
    const result = await db.query(
      'INSERT INTO categories (name, slug, description, image_url) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, slug, description, image_url]
    );
    res.status(201).json({ category: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Category already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update category (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  const { name, description, image_url } = req.body;
  try {
    const slug = name ? slugify(name, { lower: true, strict: true }) : undefined;
    const result = await db.query(
      `UPDATE categories SET name=COALESCE($1,name), slug=COALESCE($2,slug), description=$3, image_url=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, slug, description, image_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ category: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE category (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
