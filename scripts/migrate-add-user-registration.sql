-- Migration: tambah field untuk public registration + admin approval flow
-- Jalanin SEKALI di Supabase Dashboard → SQL Editor
--
-- Fields yang ditambah ke users table:
--   email          TEXT   nullable, format-validated client side
--   full_name      TEXT   nullable, untuk display di dashboard
--   is_approved    BOOL   default true (existing user OK), false untuk new signup
--   approved_at    TIMESTAMPTZ kapan admin approve (audit trail)
--   approved_by    TEXT   user_id admin yg approve

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- Set existing users semua approved (mereka udah dipakai sebelum migration)
UPDATE users SET is_approved = true WHERE is_approved IS NULL;

-- Index untuk query "pending approval" cepat
CREATE INDEX IF NOT EXISTS idx_users_pending_approval
  ON users(is_approved)
  WHERE is_approved = false;

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('email', 'full_name', 'is_approved', 'approved_at', 'approved_by');
