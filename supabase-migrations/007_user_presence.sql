-- ============================================================
-- Migration: User Presence (online status)
-- Tambah kolom last_active_at di users table.
-- Client update kolom ini tiap 30 detik saat dashboard aktif
-- (kecuali user set 'appear offline').
--
-- Derivation di client:
--   online   : last_active_at < 2 menit yang lalu
--   offline  : last_active_at > 2 menit yang lalu atau NULL
--
-- Cara pakai:
--   1. Supabase SQL Editor → paste → Run
--   2. Tunggu "Success. No rows returned"
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_last_active ON users (last_active_at DESC);
