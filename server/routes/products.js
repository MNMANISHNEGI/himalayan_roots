const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Public Routes ───────────────────────────────────────────────────────────

// GET /api/products — list all active products
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, sort, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND c.slug = $${paramCount++}`;
      params.push(category);
    }
    if (featured === 'true') {
      query += ` AND p.is_featured = true`;
    }
    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    const sortMap = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      newest: 'p.created_at DESC',
      name: 'p.name ASC',
    };
    query += ` ORDER BY ${sortMap[sort] || 'p.is_featured DESC, p.created_at DESC'}`;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    // Count query
    let countQuery = `
      SELECT COUNT(*) FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    const countParams = [];
    let cp = 1;
    if (category) { countQuery += ` AND c.slug = $${cp++}`; countParams.push(category); }
    if (search) { countQuery += ` AND (p.name ILIKE $${cp} OR p.description ILIKE $${cp})`; countParams.push(`%${search}%`); }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      products: result.rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = true
       WHERE p.slug = $1 AND p.is_active = true
       GROUP BY p.id, c.name, c.slug`,
      [req.params.slug]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const reviews = await db.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND is_approved = true ORDER BY created_at DESC LIMIT 10',
      [result.rows[0].id]
    );

    res.json({ product: result.rows[0], reviews: reviews.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/products/admin/all
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    if (search) {
      query += ` WHERE p.name ILIKE $1 OR p.description ILIKE $1`;
      params.push(`%${search}%`);
    }
    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);
    const count = await db.query('SELECT COUNT(*) FROM products');
    res.json({ products: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products — create product
router.post('/', authenticateAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 5 }]), async (req, res) => {
  try {
    const { name, short_description, description, price, discount_percentage, stock, unit, category_id, is_featured, is_active, weight, origin, nutritional_info, health_benefits, cooking_tips, weight_options, tags } = req.body;

    const slug = slugify(name, { lower: true, strict: true });
    const imageUrl = req.files?.image ? `/uploads/products/${req.files.image[0].filename}` : null;
    const additionalImages = req.files?.images ? req.files.images.map(f => `/uploads/products/${f.filename}`) : [];

    const result = await db.query(
      `INSERT INTO products (name, slug, short_description, description, price, discount_percentage, stock, unit, category_id, image_url, images, is_featured, is_active, weight, origin, nutritional_info, health_benefits, cooking_tips, weight_options, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING *`,
      [name, slug, short_description, description, parseFloat(price), parseFloat(discount_percentage || 0), parseInt(stock || 0), unit || 'kg', category_id || null, imageUrl, JSON.stringify(additionalImages), is_featured === 'true', is_active !== 'false', weight, origin, nutritional_info, health_benefits || null, cooking_tips || null, JSON.stringify(weight_options ? JSON.parse(weight_options) : []), JSON.stringify(tags ? JSON.parse(tags) : [])]
    );

    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(400).json({ error: 'Product with this name already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/products/:id — update product
router.put('/:id', authenticateAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 5 }]), async (req, res) => {
  try {
    const { name, short_description, description, price, discount_percentage, stock, unit, category_id, is_featured, is_active, weight, origin, nutritional_info, health_benefits, cooking_tips, weight_options, tags } = req.body;

    const existing = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const slug = name ? slugify(name, { lower: true, strict: true }) : existing.rows[0].slug;
    const imageUrl = req.files?.image ? `/uploads/products/${req.files.image[0].filename}` : existing.rows[0].image_url;

    const result = await db.query(
      `UPDATE products SET name=$1, slug=$2, short_description=$3, description=$4, price=$5, discount_percentage=$6, stock=$7, unit=$8, category_id=$9, image_url=$10, is_featured=$11, is_active=$12, weight=$13, origin=$14, nutritional_info=$15, health_benefits=$16, cooking_tips=$17, weight_options=$18, tags=$19, updated_at=NOW()
       WHERE id=$20 RETURNING *`,
      [name || existing.rows[0].name, slug, short_description, description, parseFloat(price), parseFloat(discount_percentage || 0), parseInt(stock || 0), unit || 'kg', category_id || null, imageUrl, is_featured === 'true', is_active !== 'false', weight, origin, nutritional_info, health_benefits || null, cooking_tips || null, JSON.stringify(weight_options ? JSON.parse(weight_options) : existing.rows[0].weight_options || []), JSON.stringify(tags ? JSON.parse(tags) : existing.rows[0].tags), req.params.id]
    );

    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query('UPDATE products SET is_active = false WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deactivated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
