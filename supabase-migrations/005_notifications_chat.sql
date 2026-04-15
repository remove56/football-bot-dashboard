-- ============================================================
-- Migration: Notifications + Chat System (Item #4)
-- Tujuan:
--   1. Tabel notifications — admin kirim pesan ke member individual / all,
--      member lihat di notification bell dengan mark-as-read.
--   2. Tabel chat_messages — chat antar user:
--      - Global chat (to_user_id = NULL) → visible untuk semua
--      - Direct message (to_user_id = specific user) → visible hanya untuk
--        from + to user
--
-- Cara pakai:
--   1. Supabase SQL Editor → paste seluruh file → Run
--   2. Tunggu "Success. No rows returned"
-- ============================================================

-- ========== NOTIFICATIONS TABLE ==========
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  from_user_id UUID REFERENCES users(id),    -- siapa pengirim (admin biasanya)
  from_user_name TEXT,                        -- denormalized nama pengirim
  to_user_id UUID REFERENCES users(id),       -- target: NULL = broadcast ke semua
  to_user_name TEXT,                          -- denormalized
  title TEXT NOT NULL,                        -- judul notifikasi (max ~100 char)
  message TEXT NOT NULL,                      -- isi pesan
  type TEXT DEFAULT 'info' CHECK (type IN ('info','warning','success','error','announce')),
  read_at TIMESTAMPTZ,                        -- NULL = belum dibaca
  metadata JSONB                              -- extra data (link, action, dll)
);

CREATE INDEX IF NOT EXISTS idx_notifications_to_user ON notifications (to_user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at DESC);

-- ========== CHAT MESSAGES TABLE ==========
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  from_user_id UUID NOT NULL REFERENCES users(id),
  from_user_name TEXT NOT NULL,               -- denormalized
  from_user_role TEXT,                        -- 'admin' | 'member'
  to_user_id UUID REFERENCES users(id),       -- NULL = global chat, ada = DM
  to_user_name TEXT,                          -- denormalized
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,                        -- hanya relevant untuk DM (null untuk global)
  edited BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_chat_global ON chat_messages (created_at DESC) WHERE to_user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_dm ON chat_messages (from_user_id, to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages (created_at DESC);

-- ========== HELPER: hitung unread count per user ==========
CREATE OR REPLACE FUNCTION count_unread_notifications(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  cnt INT;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM notifications
  WHERE read_at IS NULL
    AND (to_user_id = p_user_id OR to_user_id IS NULL);
  RETURN COALESCE(cnt, 0);
END;
$$ LANGUAGE plpgsql;

-- ========== HELPER: cleanup chat lama (>30 hari) ==========
-- Panggil manual atau via cron: SELECT cleanup_old_chat();
CREATE OR REPLACE FUNCTION cleanup_old_chat()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM chat_messages
  WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
