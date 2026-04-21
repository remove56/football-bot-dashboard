-- ============================================================
-- Migration: Instagram Tasks Queue (Item #IG Bot)
-- Tujuan: Antrian task untuk posting video Reels ke Instagram.
--
-- Cara kerja:
--   1. Dashboard insert row ke ig_tasks (pilih akun + video + scheduled_at)
--   2. ig-worker.js poll table ini setiap ~60 detik
--   3. Worker pick task dengan status='pending' AND scheduled_at<=NOW()
--   4. Worker update status 'running' → upload via Puppeteer → 'completed' / 'failed'
--   5. Kalau failed & retry_count < 1 → otomatis reset ke pending + reschedule +5min
--   6. Kalau failed 2x → tetap 'failed', user bisa manual retry di dashboard
--
-- Source video:
--   Ambil dari reels_tasks yang status='completed' terbaru (dari TikTok bot)
--   source_video_path disimpan di kolom video_path (TODO: perlu tambah kolom ini di reels_tasks)
--
-- Cara pakai:
--   1. Supabase SQL Editor → paste isi file → Run
--   2. ig-worker.js otomatis detect table ini saat jalan
-- ============================================================

CREATE TABLE IF NOT EXISTS ig_tasks (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Source
  source_video_path TEXT NOT NULL,                 -- path absolute ke file .mp4
  source_tiktok_task_id BIGINT,                    -- FK opsional ke reels_tasks (untuk trace)

  -- Target
  account_id TEXT NOT NULL,                        -- 'artezi9090' | 'artezi9191'
  caption TEXT,                                    -- caption lengkap + hashtag

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- kapan task boleh mulai jalan

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',          -- pending | running | completed | failed
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  retry_count INT NOT NULL DEFAULT 0,              -- 0 = belum retry, 1 = sudah retry 1x
  error_message TEXT,
  post_url TEXT,                                   -- URL post IG setelah berhasil

  -- Meta
  triggered_by TEXT,                               -- 'manual' | 'auto_chain' | 'retry'
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_ig_tasks_status_scheduled ON ig_tasks(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_ig_tasks_account ON ig_tasks(account_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ig_tasks_created ON ig_tasks(created_at DESC);

-- Settings per-project untuk IG bot (auto-chain toggle, delay defaults)
CREATE TABLE IF NOT EXISTS ig_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default settings
INSERT INTO ig_settings (key, value) VALUES
  ('auto_chain_enabled', 'false'),           -- kalau 'true', tiap TikTok completed auto-create IG tasks
  ('delay_account_1_minutes', '60'),         -- delay akun 1 (artezi9090) dari TikTok completed (default 1 jam)
  ('delay_account_2_minutes', '180'),        -- delay akun 2 (artezi9191) dari TikTok completed (default 3 jam)
  ('max_posts_per_account_per_day', '2')     -- safety limit: max 2 post/akun/hari
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE ig_tasks IS 'Antrian task upload Reels ke Instagram';
COMMENT ON TABLE ig_settings IS 'Setting konfigurasi IG bot (key-value)';
