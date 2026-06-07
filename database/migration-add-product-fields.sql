-- Migration: Add health_benefits, cooking_tips, weight_options to products
-- Run this against your Neon / cloud database AFTER schema.sql has been applied

ALTER TABLE products ADD COLUMN IF NOT EXISTS health_benefits TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cooking_tips TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_options JSONB DEFAULT '[]';
