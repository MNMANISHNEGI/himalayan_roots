const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow localhost in dev, and the deployed Vercel URL in production
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,           // e.g. https://himalayan-roots.vercel.app
  process.env.CLIENT_URL_PREVIEW,   // optional: Vercel preview URL pattern
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Allow all *.vercel.app subdomains (covers preview deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/customers', require('./routes/customers'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Himalayan Roots API' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🏔️  Himalayan Roots API running on port ${PORT}`);
  console.log(`📦  Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
