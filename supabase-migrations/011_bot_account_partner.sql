-- ============================================================
-- Migration: Tambah partner_account_id di bot_accounts
--
-- Tujuan: User bisa pair-kan 2 akun bot (Rangga ↔ Irfan, dst).
-- Strategy:
--   - Akun A handle cycle 1+2 di sebuah grup
--   - Akun B (partner) handle cycle 3+4 di grup yang sama
--   - Beban per akun turun 50%, target post tetap tercapai (4 cycle)
--
-- Cara pakai: Supabase SQL Editor → paste → Run
-- ============================================================

ALTER TABLE bot_accounts
ADD COLUMN IF NOT EXISTS partner_account_id TEXT;

COMMENT ON COLUMN bot_accounts.partner_account_id IS 'account_id akun partner (untuk pair shift cycle 1-2 vs 3-4). NULL = standalone.';
