-- ============================================================
-- Migration: Bot Heartbeat / Health Monitoring (Item #2)
-- Tujuan: Track status bot worker (aktif/mati/stale) dengan mekanisme heartbeat.
--
-- Cara kerja:
--   1. Bot worker kirim POST ke /api/bot-heartbeat setiap 60 detik
--   2. API update kolom last_heartbeat di tabel worker_status
--   3. Dashboard query tabel ini → tampilkan status bot realtime
--
-- Status derivation (dihitung di client):
--   - 'active'  : last_heartbeat < 2 menit lalu
--   - 'stale'   : 2-15 menit lalu (bot mungkin lagi proses task berat)
--   - 'down'    : > 15 menit (kemungkinan crash/matikan)
--   - 'never'   : belum pernah heartbeat (row belum ada)
--
-- Cara pakai:
--   1. Supabase SQL Editor → paste isi file → Run
--   2. Setelah sukses, bot workers yang udah di-update akan otomatis bikin row
-- ============================================================

CREATE TABLE IF NOT EXISTS worker_status (
  worker_id TEXT PRIMARY KEY,                      -- 'bot-grup' | 'bot-reels' | etc
  worker_name TEXT NOT NULL,                       -- display name
  last_heartbeat TIMESTAMPTZ,                      -- timestamp heartbeat terakhir
  last_task_at TIMESTAMPTZ,                        -- timestamp task terakhir yang diproses
  last_task_info TEXT,                             -- deskripsi task terakhir (misal: "Posting AC Milan Fans G1")
  current_task TEXT,                               -- task yang sedang diproses (NULL = idle)
  total_tasks_today INT DEFAULT 0,                 -- counter task hari ini (reset via cron)
  total_success_today INT DEFAULT 0,
  total_failed_today INT DEFAULT 0,
  version TEXT,                                    -- versi worker (buat track update)
  pid INT,                                         -- process ID di OS (debug)
  hostname TEXT,                                   -- nama komputer worker jalan
  error_message TEXT,                              -- error terakhir (kalau ada)
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_status_heartbeat ON worker_status (last_heartbeat DESC);

-- Function: reset counter harian (dipanggil oleh cron job atau manual)
CREATE OR REPLACE FUNCTION reset_worker_daily_counters()
RETURNS VOID AS $$
BEGIN
  UPDATE worker_status
  SET total_tasks_today = 0,
      total_success_today = 0,
      total_failed_today = 0;
END;
$$ LANGUAGE plpgsql;
