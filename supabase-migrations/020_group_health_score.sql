-- 020_group_health_score.sql
-- Phase 4.1: Group Health Score
--
-- Score 0-100 per grup, dihitung berkala (default tiap 6 jam).
--
-- Komponen score:
--   1. Success rate posting 7 hari last (40% bobot)
--      = (done / total) × 100
--   2. Avg engagement per post (30% bobot)
--      = average (likes + comments×2 + shares×3) dari engagement_log,
--        dinormalisasi ke 0-100 berdasarkan kuartil grup lain
--   3. Posting consistency (15% bobot)
--      = 100 - stdev(jam antar post 7 hari last), normalized
--   4. Recency (15% bobot)
--      = 100 kalau post <24 jam, 50 kalau 24-72 jam, 0 kalau >72 jam
--
-- Threshold:
--   ≥80 → Healthy (hijau)
--   50-79 → Warning (kuning)
--   <50 → At-Risk (merah)

ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS health_breakdown JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS health_last_check TIMESTAMPTZ;

COMMENT ON COLUMN groups.health_score IS 'Phase 4.1: Score 0-100. ≥80 healthy, 50-79 warning, <50 at-risk.';
COMMENT ON COLUMN groups.health_breakdown IS 'JSON: { success_rate, avg_engagement, consistency, recency } detail per komponen.';

CREATE INDEX IF NOT EXISTS idx_groups_health_score ON groups (health_score) WHERE health_score < 80;
