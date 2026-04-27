-- ============================================================
-- Migration: Auto-retry failed task (Tier 1.2)
--
-- Tujuan: Kalau task fail (network glitch, FB rate limit sementara, dll)
-- bot otomatis retry sampai 3x dengan backoff (2min → 5min → 10min),
-- baru kalau masih gagal di-mark permanent_failed + kirim notif.
--
-- Behavior:
--   retry_count       = 0..3 (sudah retry brapa kali)
--   next_retry_at     = timestamp kapan task boleh diambil lagi (NULL = sekarang)
--   permanent_failed  = TRUE kalau sudah retry 3x masih gagal (jangan diambil lagi)
--
-- Cara pakai: Supabase SQL Editor → paste → Run
-- ============================================================

ALTER TABLE task_queue
ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS permanent_failed BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN task_queue.retry_count      IS 'Sudah retry berapa kali (0..3).';
COMMENT ON COLUMN task_queue.next_retry_at    IS 'Kapan task boleh diambil bot lagi. NULL = ready now.';
COMMENT ON COLUMN task_queue.permanent_failed IS 'TRUE = sudah retry 3x masih gagal, jangan dipick.';

-- Index biar query bot worker (cari task ready) tetap cepat
CREATE INDEX IF NOT EXISTS idx_task_queue_retry_ready
ON task_queue (next_retry_at)
WHERE permanent_failed = FALSE;
