-- ============================================================
-- Migration: Content Analyzer (Batch 2)
-- Tujuan: Tambah kolom untuk menyimpan status analisa konten per slot
--         (Gambar 1, Gambar 2, Video) di tabel posting_tracker.
--
-- Status values:
--   'pending'       = baru submit / belum dianalisa (ungu)
--   'ok'            = konten sepakbola valid (hijau)
--   'suspect'       = keyword samar, meragukan (kuning)
--   'not_football'  = bukan konten sepakbola (merah)
--   'error'         = fetch gagal / link rusak / FB block (abu-abu)
--
-- Cara pakai:
--   1. Login ke Supabase Dashboard → SQL Editor
--   2. Paste seluruh isi file ini → klik Run
--   3. Tunggu sampai "Success. No rows returned"
-- ============================================================

ALTER TABLE posting_tracker
  ADD COLUMN IF NOT EXISTS gambar1_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS gambar2_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS video_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS gambar1_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gambar2_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS video_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gambar1_detected_title TEXT,
  ADD COLUMN IF NOT EXISTS gambar2_detected_title TEXT,
  ADD COLUMN IF NOT EXISTS video_detected_title TEXT;

-- Constraint: status harus salah satu dari values yang valid
ALTER TABLE posting_tracker
  DROP CONSTRAINT IF EXISTS gambar1_status_check,
  DROP CONSTRAINT IF EXISTS gambar2_status_check,
  DROP CONSTRAINT IF EXISTS video_status_check;

ALTER TABLE posting_tracker
  ADD CONSTRAINT gambar1_status_check CHECK (gambar1_status IN ('pending','ok','suspect','not_football','error')),
  ADD CONSTRAINT gambar2_status_check CHECK (gambar2_status IN ('pending','ok','suspect','not_football','error')),
  ADD CONSTRAINT video_status_check CHECK (video_status IN ('pending','ok','suspect','not_football','error'));

-- Index untuk query row yang masih pending (dipakai audit historis)
CREATE INDEX IF NOT EXISTS idx_posting_tracker_pending_status
  ON posting_tracker (gambar1_status, gambar2_status, video_status)
  WHERE gambar1_status = 'pending' OR gambar2_status = 'pending' OR video_status = 'pending';

-- Set row yang gambar1_link=NULL → gambar1_status=NULL (biar nggak muncul pending palsu)
UPDATE posting_tracker SET gambar1_status = NULL WHERE gambar1_link IS NULL;
UPDATE posting_tracker SET gambar2_status = NULL WHERE gambar2_link IS NULL;
UPDATE posting_tracker SET video_status = NULL WHERE video_link IS NULL;
