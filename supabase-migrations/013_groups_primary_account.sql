-- ============================================================
-- Migration 013: Tambah primary_account_id di groups
--
-- Tujuan: Mapping "siapa akun bot pemilik grup ini" — biar fitur
-- Bulk Task Creator bisa otomatis distribute task pakai pair strategy:
--   - Cycle 1+2 → primary_account_id (akun A, admin/moderator)
--   - Cycle 3+4 → bot_accounts.partner_account_id (akun B partner)
--
-- Kalau grup TIDAK punya partner (standalone) → semua 4 cycle ke primary.
-- Kalau grup TIDAK punya primary_account_id → di-skip oleh Bulk
--   (user bisa set manual via dashboard "Kelola Grup" → dropdown).
--
-- SEED DATA: Update 16 grup yang udah ada di config-groups.js dgn akun A-nya.
-- Mapping berdasarkan kepemilikan moderator/admin akun:
--   Rangga (89654516737) → 4 grup
--   Aditya (89654520329) → 3 grup
--   Bima   (89654516608) → 3 grup
--   Yoga   (89654520576) → 3 grup
--   Aldi   (89654520562) → 3 grup
--
-- Total: 16 grup ter-mapping. Sisanya (kalau ada di table groups)
-- harus di-set manual oleh user via dashboard.
--
-- Cara pakai: Supabase SQL Editor → paste → Run
-- ============================================================

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS primary_account_id TEXT;

COMMENT ON COLUMN groups.primary_account_id IS 'account_id akun bot A (admin/moderator) untuk grup ini. Cycle 3+4 ke partner-nya. NULL = belum di-setup.';

-- ============================================================
-- SEED: mapping 16 grup pair existing
-- ============================================================

-- Rangga Prakoso (89654516737) — 4 grup
UPDATE groups SET primary_account_id = '89654516737'
WHERE url ILIKE '%/groups/413394872151294%'
   OR url ILIKE '%/groups/1240332723043972%'
   OR url ILIKE '%/groups/1568038536801711%'
   OR url ILIKE '%/groups/348100147471239%';

-- Aditya Prakoso (89654520329) — 3 grup
UPDATE groups SET primary_account_id = '89654520329'
WHERE url ILIKE '%/groups/904079967261164%'
   OR url ILIKE '%/groups/1405856309519360%'
   OR url ILIKE '%/groups/760853075750371%';

-- Bima Pratama (89654516608) — 3 grup
UPDATE groups SET primary_account_id = '89654516608'
WHERE url ILIKE '%/groups/1281923889167114%'
   OR url ILIKE '%/groups/278290561830693%'
   OR url ILIKE '%/groups/1519921462099787%';

-- Yoga Permana (89654520576) — 3 grup
UPDATE groups SET primary_account_id = '89654520576'
WHERE url ILIKE '%/groups/745639796751648%'
   OR url ILIKE '%/groups/556766765448842%'
   OR url ILIKE '%/groups/1005017257262995%';

-- Aldi Kurniawan (89654520562) — 3 grup
UPDATE groups SET primary_account_id = '89654520562'
WHERE url ILIKE '%/groups/marketplacenunukan%'
   OR url ILIKE '%/groups/735167033166103%'
   OR url ILIKE '%/groups/166732286464107%';

-- Index untuk query bulk faster
CREATE INDEX IF NOT EXISTS idx_groups_primary_account ON groups (primary_account_id);

-- Verify (run separately untuk cek hasilnya):
-- SELECT primary_account_id, COUNT(*) FROM groups GROUP BY primary_account_id ORDER BY primary_account_id;
