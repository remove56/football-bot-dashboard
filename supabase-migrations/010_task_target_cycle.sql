-- ============================================================
-- Migration: Tambah target_cycle ke task_queue (Item: User Control Cycle)
--
-- Tujuan: User bisa pilih siklus spesifik (1-4) saat buat task posting,
-- bukan auto-picked oleh bot.
--
-- Behavior:
--   - target_cycle = NULL  → bot auto-pick siklus berikutnya yang belum complete (perilaku lama)
--   - target_cycle = 1-4   → bot post ke siklus tersebut spesifik
--
-- Cara pakai: Supabase SQL Editor → paste → Run
-- ============================================================

ALTER TABLE task_queue
ADD COLUMN IF NOT EXISTS target_cycle INT;

COMMENT ON COLUMN task_queue.target_cycle IS 'Siklus tujuan (1-4). NULL = auto-pick.';
