-- ============================================================
-- Migration: View Once messages (Snapchat-style)
-- Tambahan ke chat_messages:
--   view_once  : bool, true kalau ini pesan sekali lihat
--   viewed_at  : timestamptz, waktu pertama kali dilihat recipient
--
-- Cara kerja:
--   1. Sender toggle 🔥 view once mode, kirim pesan
--   2. Recipient buka chat, liat pesan normal
--   3. Client call API mark-viewed → set viewed_at + clear content
--   4. Session recipient: pesan masih kelihatan (dari memory)
--   5. Session berikutnya: cuma lihat "🔥 Sudah dilihat" placeholder
-- ============================================================

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS view_once BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_chat_view_once ON chat_messages (view_once, viewed_at) WHERE view_once = true;
