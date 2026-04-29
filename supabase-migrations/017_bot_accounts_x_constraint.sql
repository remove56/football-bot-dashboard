-- 017_bot_accounts_x_constraint.sql
-- Fix: tambah 'x' (Twitter/X) ke CHECK constraint bot_accounts.account_type.
--
-- Bug: saat add platform X di code (commit a29bd5a + 7a4cab5), lupa update
-- CHECK constraint di DB. Constraint lama cuma allow:
--   reels / tiktok / ig / grup / both
-- Tipe 'x' di-reject → "violates check constraint bot_accounts_account_type_check".

ALTER TABLE bot_accounts DROP CONSTRAINT IF EXISTS bot_accounts_account_type_check;

ALTER TABLE bot_accounts ADD CONSTRAINT bot_accounts_account_type_check
  CHECK (account_type IN ('reels', 'tiktok', 'ig', 'grup', 'both', 'x'));
