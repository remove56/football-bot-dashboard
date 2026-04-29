-- 015_autonomous_posting.sql
-- Autonomous Task Generator — bot self-driven posting tiap interval.
-- Default: SEMUA OFF. Bot tetap behave seperti sekarang sampai user explicit aktif.

-- ============================================================
-- 1. Tambah kolom di groups untuk autonomous setting per-grup
-- ============================================================
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS auto_post_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS posting_interval_hours integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS last_auto_post_at timestamptz;

COMMENT ON COLUMN groups.auto_post_enabled IS 'Toggle: bot auto-create posting task untuk grup ini tiap interval. Default false (manual mode).';
COMMENT ON COLUMN groups.posting_interval_hours IS 'Interval (jam) antara auto-post. Default 2 jam. Range aman: 2-6 jam (anti FB rate-limit).';
COMMENT ON COLUMN groups.last_auto_post_at IS 'Timestamp kapan terakhir auto-task berhasil di-create untuk grup ini. Used for interval calculation.';

-- ============================================================
-- 2. Tabel app_config untuk system-level settings
-- ============================================================
CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Insert master switch (default OFF — autonomous gak jalan)
INSERT INTO app_config (key, value, description) VALUES
  ('auto_post_master_switch', 'false'::jsonb, 'Master toggle untuk autonomous task generator. Kalau false, bot tetap manual mode walaupun grup-grup ada yg auto_post_enabled=true.')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 3. Index untuk query performance auto-task-generator
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_groups_auto_post_enabled
  ON groups (auto_post_enabled)
  WHERE auto_post_enabled = true;

CREATE INDEX IF NOT EXISTS idx_groups_last_auto_post
  ON groups (last_auto_post_at)
  WHERE auto_post_enabled = true;

-- ============================================================
-- 4. Cara aktif nanti (REFERENCE — jangan run sekarang):
-- ============================================================
-- Test 1 grup dulu:
--   UPDATE groups SET auto_post_enabled = true WHERE id = <test_group_id>;
--   UPDATE groups SET posting_interval_hours = 2 WHERE id = <test_group_id>;
--
-- Aktif master switch (semua grup yg enabled mulai auto-post):
--   UPDATE app_config SET value = 'true'::jsonb WHERE key = 'auto_post_master_switch';
--
-- Disable kembali (emergency stop):
--   UPDATE app_config SET value = 'false'::jsonb WHERE key = 'auto_post_master_switch';
--
-- Bulk enable semua grup (pas yakin):
--   UPDATE groups SET auto_post_enabled = true;
