-- ============================================================
-- Migration: Backups Log Table (Item #1 Rekomendasi)
-- Tujuan: Simpan snapshot JSON semua tabel penting tiap hari.
-- Dipanggil otomatis oleh Vercel Cron setiap 02:00 WIB (19:00 UTC).
--
-- Retention: 30 backup terakhir (auto-delete yang lebih lama).
--
-- Cara pakai:
--   1. Login ke Supabase Dashboard → SQL Editor
--   2. Paste seluruh isi file ini → klik Run
--   3. Tunggu sampai "Success. No rows returned"
-- ============================================================

CREATE TABLE IF NOT EXISTS backups_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  trigger_type TEXT DEFAULT 'auto' CHECK (trigger_type IN ('auto','manual')),
  row_counts JSONB NOT NULL,
  tables JSONB NOT NULL,
  size_bytes INT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_backups_log_created_at ON backups_log (created_at DESC);

-- Function: cleanup backup lama (sisain 30 terbaru)
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM backups_log
  WHERE id IN (
    SELECT id FROM backups_log
    ORDER BY created_at DESC
    OFFSET 30
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
