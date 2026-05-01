-- 019_engagement_log.sql
-- Phase 2.5: Best Posting Time Analyzer
-- Track engagement metrics per post → analyze golden hour per grup
--
-- Cara kerja:
--   1. Bot post ke grup → upsertPostingTracker simpan URL post di posting_tracker
--   2. Service engagement-tracker scan post umur 6-24h yang belum di engagement_log
--   3. Visit URL via puppeteer (pakai akun yang post itu) → parse likes/comments/shares
--   4. Insert/update ke engagement_log
--   5. best-time-analyzer query aggregate engagement per (group × hour × dow)
--   6. Dashboard heatmap visualize, auto-task-generator pakai golden hour kalau aktif
--
-- ENGAGEMENT METRIC source:
--   - FB Group posts: visible di post header → "5 likes 2 comments 1 share"
--   - Bot ini scrape via puppeteer rate-limited (max 10 post per scan)

CREATE TABLE IF NOT EXISTS engagement_log (
  id BIGSERIAL PRIMARY KEY,
  -- Identity
  post_url TEXT NOT NULL UNIQUE,
  group_id TEXT NOT NULL,
  group_name TEXT,
  club TEXT,
  account_id TEXT,            -- Akun bot yang post (untuk scrape pake cookies-nya)
  account_name TEXT,
  user_name TEXT,             -- Atas nama member ini di-post
  post_type TEXT NOT NULL DEFAULT 'grup_image', -- 'grup_image' | 'grup_video' | 'reels_fb' | 'reels_ig'

  -- Time dimensions (derived from posted_at, untuk aggregate cepat)
  posted_at TIMESTAMPTZ NOT NULL,
  post_hour SMALLINT NOT NULL CHECK (post_hour >= 0 AND post_hour <= 23),
  post_dow SMALLINT NOT NULL CHECK (post_dow >= 0 AND post_dow <= 6), -- 0=Senin, 6=Minggu

  -- Engagement metrics (di-update tiap scrape)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,           -- Untuk reels (kalau ada)

  -- Tracking metadata
  first_check_at TIMESTAMPTZ,              -- Pertama kali engagement di-scrape
  last_check_at TIMESTAMPTZ,               -- Terakhir scrape (refresh)
  check_count INTEGER DEFAULT 0,           -- Sudah berapa kali di-scrape
  scrape_failed_count INTEGER DEFAULT 0,   -- Counter fail (kalau >3, abandon scrape)
  scrape_error TEXT,                       -- Error message terakhir kalau ada

  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE engagement_log IS 'Phase 2.5: Track FB engagement per post → analyze best posting time per group';
COMMENT ON COLUMN engagement_log.post_dow IS 'Day of Week: 0=Senin, 1=Selasa, ..., 6=Minggu (Indonesian convention)';
COMMENT ON COLUMN engagement_log.scrape_failed_count IS 'Increment per scrape fail. Skip post if >=3 (post mungkin di-delete admin grup)';

-- Index untuk query analyzer (aggregate per group × hour × dow)
CREATE INDEX IF NOT EXISTS idx_engagement_group_hour ON engagement_log (group_id, post_hour);
CREATE INDEX IF NOT EXISTS idx_engagement_group_dow ON engagement_log (group_id, post_dow);
CREATE INDEX IF NOT EXISTS idx_engagement_posted_at ON engagement_log (posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_last_check ON engagement_log (last_check_at NULLS FIRST); -- Buat nemuin yang belum pernah di-scrape

-- Materialized view untuk aggregate (refresh tiap jam)
CREATE MATERIALIZED VIEW IF NOT EXISTS engagement_summary AS
SELECT
  group_id,
  group_name,
  post_hour,
  post_dow,
  COUNT(*) as post_count,
  ROUND(AVG(likes_count + comments_count * 2 + shares_count * 3)::numeric, 2) as engagement_score,
  -- Bobot: 1 like = 1, 1 comment = 2, 1 share = 3 (share paling valuable)
  ROUND(AVG(likes_count)::numeric, 2) as avg_likes,
  ROUND(AVG(comments_count)::numeric, 2) as avg_comments,
  ROUND(AVG(shares_count)::numeric, 2) as avg_shares,
  MAX(posted_at) as last_post_at
FROM engagement_log
WHERE posted_at >= now() - INTERVAL '60 days'  -- Data 60 hari terakhir aja (relevan)
  AND last_check_at IS NOT NULL                  -- Skip yang belum pernah di-scrape
GROUP BY group_id, group_name, post_hour, post_dow;

CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_summary_unique ON engagement_summary (group_id, post_hour, post_dow);

-- Tabel groups: tambah column untuk best-time auto-task integration
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS prefer_best_time BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS best_hours JSONB DEFAULT '[]'::jsonb;
  -- best_hours = JSON array integer 0-23 (top 3 best hours per grup, di-update auto sehari sekali)

COMMENT ON COLUMN groups.prefer_best_time IS 'Phase 2.5: Kalau autonomous + ini true, auto-task prioritaskan slot di best_hours';
COMMENT ON COLUMN groups.best_hours IS 'Top 3 jam terbaik per grup (computed dari engagement_summary). Empty array kalau data belum cukup.';
