-- Run this in pgAdmin Query Tool (connected to h_roots database)
-- This sets the correct bcrypt hash for password: Admin@123

UPDATE admin_users
SET password_hash = '$2a$12$1xLcu85a//f0EO6nSD.CB.UxYXskGnhtN9nFqIk9xAi7R.nfCgQy.'
WHERE email = 'admin@himalayanroots.com';

-- Verify
SELECT id, name, email, role, is_active FROM admin_users;
