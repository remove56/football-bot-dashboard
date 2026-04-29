-- 016_password_hash.sql
-- Hash password migration — gradual zero-downtime.
--
-- Phase 1 (DEPLOY DULU): tambah kolom password_hash, default null.
--   Login dual-mode: cek hash dulu, fallback plaintext, auto-hash on success.
--   Existing user login → password auto-migrate ke hash.
--
-- Phase 2 (MANUAL TRIGGER, kapan2): bulk-hash semua plaintext yang masih ada.
--   Run: node scripts/migrate-hash-passwords.js
--
-- Phase 3 (FUTURE): drop kolom password, keep password_hash only.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash text,
  ADD COLUMN IF NOT EXISTS password_migrated_at timestamptz;

COMMENT ON COLUMN users.password_hash IS 'bcryptjs hash dari password. Login pakai bcrypt.compare(input, hash). Default null untuk backward compat.';
COMMENT ON COLUMN users.password_migrated_at IS 'Timestamp kapan user terakhir login + auto-migrate dari plaintext ke hash. Null = belum migrate.';

-- Index untuk lookup cepat (rare, tapi good practice)
CREATE INDEX IF NOT EXISTS idx_users_password_migrated
  ON users (password_migrated_at)
  WHERE password_migrated_at IS NULL;
