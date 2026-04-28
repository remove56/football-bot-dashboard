-- ============================================================
-- Migration 014: News Archive + Group Fallback Theme
--
-- Tujuan:
-- 1. News Archive — cache berita yang udah di-scrape supaya bisa dipake
--    sebagai fallback kalau berita TERBARU gak cukup (cycle 1-4 butuh 2 berita).
--    Daripada bot bikin canvas hitam generic, ambil berita lama yang masih
--    "high class" (punya gambar real + headline real).
--
-- 2. Group Fallback Theme — per-group setting tema visual untuk fallback
--    canvas (kalau cache pun kosong). Pilihan: cinematic, neon, sport_magazine,
--    3d_text, minimalist. Default: cinematic.
--
-- Cara pakai: Supabase SQL Editor → paste → Run
-- ============================================================

-- =========================================================
-- TABLE: news_archive — cache berita yang pernah di-scrape
-- =========================================================
CREATE TABLE IF NOT EXISTS news_archive (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,                  -- URL artikel asli (untuk dedup)
  title TEXT NOT NULL,                -- Judul berita
  summary TEXT,                       -- Ringkasan / lead
  image_url TEXT,                     -- URL gambar (og:image atau preview)
  source_name TEXT,                   -- Nama source (Bola.com, CNN Sport, dll)
  club TEXT,                          -- Klub related (Real Madrid, Persib, dll)
  league TEXT,                        -- Liga related
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  used_count INT DEFAULT 0,           -- Berapa kali artikel ini dipakai
  last_used_at TIMESTAMPTZ
);

-- Unique index biar gak duplicate scrape
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_archive_url
ON news_archive (url);

-- Index untuk query cepat saat fallback (filter by club + scraped age)
CREATE INDEX IF NOT EXISTS idx_news_archive_club_scraped
ON news_archive (club, scraped_at DESC);

-- =========================================================
-- COLUMN: groups.fallback_theme — per-group theme override
-- =========================================================
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS fallback_theme TEXT DEFAULT 'cinematic';

COMMENT ON COLUMN groups.fallback_theme IS 'Tema visual fallback canvas. Pilihan: cinematic | neon | sport_magazine | 3d_text | minimalist. Default: cinematic.';

-- =========================================================
-- AUTO-CLEANUP function — hapus berita > 60 hari (jaga DB lean)
-- =========================================================
CREATE OR REPLACE FUNCTION cleanup_old_news_archive()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM news_archive
  WHERE scraped_at < NOW() - INTERVAL '60 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- VERIFIKASI (run separately):
-- SELECT COUNT(*) FROM news_archive;
-- SELECT fallback_theme, COUNT(*) FROM groups GROUP BY fallback_theme;
-- =========================================================
