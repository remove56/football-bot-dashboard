-- 018_account_health_score.sql
-- Tambah health_score columns ke bot_accounts untuk monitor risk per akun.
--
-- health_score 0-100 dihitung dari:
--   - success_rate 7 hari (40% bobot) — main indicator
--   - failure_streak (current consecutive failures, 30% bobot)
--   - account_age_days (10% bobot, akun baru = lower score)
--   - cookies_age_days (20% bobot, cookies tua = expired risk)
--
-- Computed di dashboard side (real-time query) atau via cron.

ALTER TABLE bot_accounts
  ADD COLUMN IF NOT EXISTS health_score integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS last_health_check timestamptz,
  ADD COLUMN IF NOT EXISTS last_post_at timestamptz,
  ADD COLUMN IF NOT EXISTS failure_streak integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cookies_refreshed_at timestamptz DEFAULT now();

COMMENT ON COLUMN bot_accounts.health_score IS 'Score 0-100. ≥80=healthy, 50-79=warning, <50=at_risk. Auto-disable threshold 50.';
COMMENT ON COLUMN bot_accounts.failure_streak IS 'Consecutive failed task count. Reset ke 0 saat ada done. Increment tiap failed.';
COMMENT ON COLUMN bot_accounts.cookies_refreshed_at IS 'Timestamp kapan cookies terakhir di-refresh (run save-cookies-{type}.js). Untuk cookie aging logic (Phase 1.4).';

CREATE INDEX IF NOT EXISTS idx_bot_accounts_health ON bot_accounts (health_score) WHERE is_active = true;
