-- ============================================================
-- Migration: Chat Attachments (gambar + voice) + Unread Tracking
--
-- Tambahan ke chat_messages:
--   attachment_url   — URL file di Supabase Storage
--   attachment_type  — 'image' | 'audio' (future: video, file)
--   attachment_name  — nama file asli (biar download bisa dengan nama yang benar)
--   attachment_size  — ukuran file dalam bytes
--   attachment_duration — durasi audio dalam detik (hanya untuk audio)
--
-- Storage bucket (HARUS DIBUAT MANUAL):
--   Nama: chat-media
--   Public: Yes
--   File size limit: 10 MB
--   Allowed MIME types: image/*, audio/*
--
-- Cara pakai:
--   1. Supabase SQL Editor → paste file → Run
--   2. Lalu buat bucket manual di Supabase → Storage → New bucket
-- ============================================================

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT CHECK (attachment_type IN ('image','audio','video','file')),
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_size INT,
  ADD COLUMN IF NOT EXISTS attachment_duration INT;

CREATE INDEX IF NOT EXISTS idx_chat_attachment ON chat_messages (attachment_type) WHERE attachment_url IS NOT NULL;

-- ============================================================
-- Storage bucket policies (run SETELAH bucket 'chat-media' dibuat manual)
-- Pastikan bucket di-set PUBLIC biar URL bisa di-akses tanpa auth
-- ============================================================
-- Note: Policy berikut hanya jalan kalau bucket 'chat-media' sudah ada.
-- Kalau belum, skip bagian ini dulu, buat bucket dulu, baru run policy.

-- Allow anyone to upload (karena kita pakai anon key client-side)
-- Nanti bisa diketatin kalau perlu
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'chat-media') THEN
    -- Drop existing policies kalau ada
    DROP POLICY IF EXISTS "Anyone can upload chat media" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view chat media" ON storage.objects;

    CREATE POLICY "Anyone can upload chat media"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'chat-media');

    CREATE POLICY "Anyone can view chat media"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'chat-media');
  END IF;
END $$;
