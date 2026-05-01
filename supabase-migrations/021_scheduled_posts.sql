-- 021_scheduled_posts.sql
-- Phase 3.1: Scheduled Posts
--
-- Tambah column scheduled_for ke task_queue & reels_tasks.
-- Kalau di-set, task BARU pickup setelah waktu itu (worker filter di pickTask).
-- Kalau NULL (default), behavior seperti biasa (langsung pickup).
--
-- ig_tasks udah punya scheduled_at sebelumnya (migration 009).

ALTER TABLE task_queue
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE reels_tasks
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN task_queue.scheduled_for IS 'Phase 3.1: Kalau diset, worker tunggu sampai waktu ini sebelum pickup. NULL = pickup segera.';
COMMENT ON COLUMN reels_tasks.scheduled_for IS 'Phase 3.1: Sama dgn task_queue.scheduled_for.';

-- Index untuk filter cepat
CREATE INDEX IF NOT EXISTS idx_task_queue_scheduled ON task_queue (scheduled_for) WHERE status = 'pending' AND scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reels_tasks_scheduled ON reels_tasks (scheduled_for) WHERE status = 'pending' AND scheduled_for IS NOT NULL;
