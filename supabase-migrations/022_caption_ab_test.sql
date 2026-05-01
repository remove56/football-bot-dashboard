-- 022_caption_ab_test.sql
-- Phase 4.2: A/B Test Caption Templates
--
-- Track template_id + promo_id yang dipakai per post → cross-reference dengan
-- engagement_log → analyze pemenang otomatis.
--
-- Template structure (config/promo.js):
--   - 50 CAPTION_TEMPLATES (index 0-49)
--   - 50 PROMO_TEXTS (index 0-49)
--
-- Tabel caption_variants log tiap caption yang di-generate:
--   - post_url (FK ke engagement_log untuk join engagement)
--   - template_id (0-49)
--   - promo_id (0-49)
--   - hashtag_signature (hash of hashtag set)
--
-- Analisis pemenang via JOIN dengan engagement_log:
--   SELECT cv.template_id, AVG(el.likes_count + el.comments_count*2 + el.shares_count*3) as score,
--          COUNT(*) as sample_size
--   FROM caption_variants cv
--   JOIN engagement_log el ON cv.post_url = el.post_url
--   WHERE el.last_check_at IS NOT NULL
--   GROUP BY cv.template_id
--   ORDER BY score DESC;

CREATE TABLE IF NOT EXISTS caption_variants (
  id BIGSERIAL PRIMARY KEY,
  post_url TEXT NOT NULL UNIQUE,
  group_id TEXT,
  group_name TEXT,
  club TEXT,
  template_id SMALLINT NOT NULL,        -- 0-49 (index CAPTION_TEMPLATES)
  promo_id SMALLINT NOT NULL,            -- 0-49 (index PROMO_TEXTS)
  hashtag_count SMALLINT,                -- Jumlah hashtag (5-7)
  caption_source TEXT NOT NULL DEFAULT 'template', -- 'template' | 'ai'
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE caption_variants IS 'Phase 4.2: Track template+promo dipakai per post untuk A/B test analysis';
COMMENT ON COLUMN caption_variants.template_id IS 'Index CAPTION_TEMPLATES dari config/promo.js (0-49)';
COMMENT ON COLUMN caption_variants.promo_id IS 'Index PROMO_TEXTS (0-49)';
COMMENT ON COLUMN caption_variants.caption_source IS 'template = 50 hardcoded; ai = Claude Haiku 4.5';

CREATE INDEX IF NOT EXISTS idx_cv_template ON caption_variants (template_id);
CREATE INDEX IF NOT EXISTS idx_cv_promo ON caption_variants (promo_id);
CREATE INDEX IF NOT EXISTS idx_cv_posted_at ON caption_variants (posted_at DESC);

-- View untuk analyzer: join dengan engagement_log
CREATE OR REPLACE VIEW caption_ab_analysis AS
SELECT
  cv.template_id,
  cv.promo_id,
  cv.caption_source,
  COUNT(*) as sample_size,
  ROUND(AVG(COALESCE(el.likes_count, 0) + COALESCE(el.comments_count, 0) * 2 + COALESCE(el.shares_count, 0) * 3)::numeric, 2) as avg_engagement,
  ROUND(AVG(COALESCE(el.likes_count, 0))::numeric, 2) as avg_likes,
  ROUND(AVG(COALESCE(el.comments_count, 0))::numeric, 2) as avg_comments,
  ROUND(AVG(COALESCE(el.shares_count, 0))::numeric, 2) as avg_shares
FROM caption_variants cv
LEFT JOIN engagement_log el ON cv.post_url = el.post_url
WHERE cv.posted_at >= now() - INTERVAL '30 days'
  AND el.last_check_at IS NOT NULL
GROUP BY cv.template_id, cv.promo_id, cv.caption_source
HAVING COUNT(*) >= 3; -- Minimum 3 sampel per kombinasi
