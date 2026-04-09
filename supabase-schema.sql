-- ============================================
-- Football Bot Dashboard — Supabase Schema
-- Jalankan di SQL Editor Supabase
-- ============================================

-- 1. USERS (login + role)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default admin
INSERT INTO users (username, password, name, role)
VALUES ('admin', 'BolaMania2026!', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert member TOGOKX
INSERT INTO users (username, password, name, role)
VALUES ('TOGOKX', 'MM123', 'TOGOKX', 'member')
ON CONFLICT (username) DO NOTHING;

-- 2. GROUPS (38 grup Facebook)
CREATE TABLE IF NOT EXISTS groups (
  id VARCHAR(20) PRIMARY KEY,
  club VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  league VARCHAR(50) NOT NULL,
  team_id INTEGER
);

-- Insert semua grup
INSERT INTO groups (id, club, name, url, league, team_id) VALUES
('madrid1','Real Madrid','Info Seputar Real Madrid','https://www.facebook.com/groups/874545484359742','La Liga',541),
('madrid2','Real Madrid','Real Madriddista Fans','https://www.facebook.com/groups/870540954188977','La Liga',541),
('barca1','FC Barcelona','Info Seputar Barca','https://www.facebook.com/groups/2225235007877633','La Liga',529),
('barca2','FC Barcelona','Info Transfer Barca','https://www.facebook.com/groups/204740855809482','La Liga',529),
('barca3','FC Barcelona','FC Barcelona','https://www.facebook.com/groups/1405856309519360','La Liga',529),
('barca4','FC Barcelona','Barca Club','https://www.facebook.com/groups/1575091236359850','La Liga',529),
('atleti1','Atletico Madrid','Gudang Info ATM','https://www.facebook.com/groups/2949735738437306','La Liga',530),
('mufc1','Manchester United','Rumor Seputar Manchester United','https://www.facebook.com/groups/413394872151294','Premier League',33),
('mufc2','Manchester United','Manchester United Fans Club','https://www.facebook.com/groups/745639796751648','Premier League',33),
('mufc3','Manchester United','Manchester United Fans Club','https://www.facebook.com/groups/1500639570750741','Premier League',33),
('mcfc1','Manchester City','Manchester City Fans','https://www.facebook.com/groups/348100147471239','Premier League',50),
('lfc1','Liverpool','Liverpool Football Fans Club','https://www.facebook.com/groups/1121340058523256','Premier League',40),
('cfc1','Chelsea','Info Tim Chelsea','https://www.facebook.com/groups/1240332723043972','Premier League',49),
('cfc2','Chelsea','Chelsea Football Club','https://www.facebook.com/groups/597004145809685','Premier League',49),
('afc1','Arsenal','The Gunner','https://www.facebook.com/groups/16673228646410','Premier League',42),
('thfc1','Tottenham','The Lilywhites','https://www.facebook.com/groups/1648422908726767','Premier League',47),
('avfc1','Aston Villa','Aston Villa Football Club','https://www.facebook.com/groups/3412211172230102','Premier League',66),
('nufc1','Newcastle','The Magpies','https://www.facebook.com/groups/904079967261164','Premier League',34),
('inter1','Inter Milan','FC Internazionale Fans','https://www.facebook.com/groups/1813050465811237','Serie A',505),
('inter2','Inter Milan','Berita Terkini Inter','https://www.facebook.com/groups/1555341661395053','Serie A',505),
('juve1','Juventus','Juventus Fans Club','https://www.facebook.com/groups/735167033166103','Serie A',496),
('acm1','AC Milan','Info Terkini AC Milan','https://www.facebook.com/groups/336300181360590','Serie A',489),
('acm2','AC Milan','AC Milan Fans','https://www.facebook.com/groups/1485454835545972','Serie A',489),
('roma1','AS Roma','AS Roma Football Club','https://www.facebook.com/groups/468792666844610','Serie A',497),
('napoli1','Napoli','SSC Napoli FC','https://www.facebook.com/groups/556766765448842','Serie A',492),
('lazio1','Lazio','SS Lazio','https://www.facebook.com/groups/marketplacenunukan','Serie A',487),
('ata1','Atalanta','Atalanta BC La Dea','https://www.facebook.com/groups/1129921185079368','Serie A',499),
('bayern1','Bayern Munich','Bayern Munchen','https://www.facebook.com/groups/523180438259123','Bundesliga',157),
('lever1','Bayer Leverkusen','Bayer 04 Leverkusen','https://www.facebook.com/groups/1005017257262995','Bundesliga',168),
('psg1','PSG','Les Parisians','https://www.facebook.com/groups/278290561830693','Ligue 1',85),
('lyon1','Lyon','Les Gones','https://www.facebook.com/groups/1519921462099787','Ligue 1',80),
('persija1','Persija Jakarta','Macan Kemayoran Fans Club','https://www.facebook.com/groups/373464172808456','Liga 1',NULL),
('persija2','Persija Jakarta','Berita Macan Kemayoran','https://www.facebook.com/groups/1268214230398409','Liga 1',NULL),
('persib1','Persib Bandung','Persib Bandung Club','https://www.facebook.com/groups/220333897074580','Liga 1',NULL),
('persebaya1','Persebaya','Persebaya Club','https://www.facebook.com/groups/760853075750371','Liga 1',NULL),
('timnas1','Timnas Indonesia','Info Timnas Indonesia','https://www.facebook.com/groups/1568038536801711','Timnas',NULL),
('cr7','Cristiano Ronaldo','CR7 Fans','https://www.facebook.com/groups/1281923889167114','Pemain',NULL),
('messi','Lionel Messi','La Pulga Fans','https://www.facebook.com/groups/698926972386710','Pemain',NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. LINK SUBMISSIONS
CREATE TABLE IF NOT EXISTS link_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  user_name VARCHAR(100),
  group_id VARCHAR(20) REFERENCES groups(id),
  group_name VARCHAR(200),
  link TEXT NOT NULL,
  note TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ACTIVITY LOG
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20),
  team VARCHAR(100),
  group_url TEXT,
  title TEXT,
  success BOOLEAN DEFAULT false,
  source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Public read for groups
CREATE POLICY "Groups readable by all" ON groups FOR SELECT USING (true);

-- Users: only authenticated can read own
CREATE POLICY "Users read all" ON users FOR SELECT USING (true);
CREATE POLICY "Users insert admin" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update admin" ON users FOR UPDATE USING (true);
CREATE POLICY "Users delete admin" ON users FOR DELETE USING (true);

-- Links: read own or admin reads all
CREATE POLICY "Links read" ON link_submissions FOR SELECT USING (true);
CREATE POLICY "Links insert" ON link_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Links update" ON link_submissions FOR UPDATE USING (true);
CREATE POLICY "Links delete" ON link_submissions FOR DELETE USING (true);

-- Activity: readable by all authenticated
CREATE POLICY "Activity read" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Activity insert" ON activity_log FOR INSERT WITH CHECK (true);

-- 6. CONTENT REGISTRY (anti-duplikat konten antar member)
-- Menyimpan fingerprint URL konten supaya tidak bisa dipakai ulang
CREATE TABLE IF NOT EXISTS content_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint VARCHAR(500) NOT NULL,  -- normalized URL / content ID
  original_url TEXT NOT NULL,          -- URL asli yang disubmit
  user_id UUID REFERENCES users(id),
  user_name VARCHAR(100),
  group_id VARCHAR(20),
  group_name VARCHAR(200),
  content_type VARCHAR(20) CHECK (content_type IN ('gambar', 'video')),
  source VARCHAR(20) DEFAULT 'member', -- member / bot
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk pencarian cepat fingerprint
CREATE INDEX IF NOT EXISTS idx_content_fingerprint ON content_registry(fingerprint);

-- RLS
ALTER TABLE content_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Content registry read" ON content_registry FOR SELECT USING (true);
CREATE POLICY "Content registry insert" ON content_registry FOR INSERT WITH CHECK (true);
CREATE POLICY "Content registry delete" ON content_registry FOR DELETE USING (true);

-- 7. IMAGE HASHES (pHash — sidik jari visual gambar anti-duplikat)
-- Menyimpan perceptual hash untuk deteksi gambar yang sama
-- meski sudah di-crop, resize, compress, atau upload ulang
CREATE TABLE IF NOT EXISTS image_hashes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phash VARCHAR(32) NOT NULL,           -- perceptual hash (hex)
  source_url TEXT,                       -- URL asal gambar (opsional)
  user_name VARCHAR(100),               -- member/bot yang posting
  group_id VARCHAR(20),
  group_name VARCHAR(200),
  club VARCHAR(100),
  content_type VARCHAR(20) DEFAULT 'gambar', -- gambar / video_thumb
  source VARCHAR(20) DEFAULT 'bot',     -- bot / member
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_image_phash ON image_hashes(phash);

ALTER TABLE image_hashes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Image hashes read" ON image_hashes FOR SELECT USING (true);
CREATE POLICY "Image hashes insert" ON image_hashes FOR INSERT WITH CHECK (true);
CREATE POLICY "Image hashes delete" ON image_hashes FOR DELETE USING (true);

-- 8. REELS TASKS (tugas posting video ke beranda)
CREATE TABLE IF NOT EXISTS reels_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id VARCHAR(20) NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  keyword TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'failed')),
  result_url TEXT,
  video_title TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reels_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reels tasks read" ON reels_tasks FOR SELECT USING (true);
CREATE POLICY "Reels tasks insert" ON reels_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Reels tasks update" ON reels_tasks FOR UPDATE USING (true);
CREATE POLICY "Reels tasks delete" ON reels_tasks FOR DELETE USING (true);

-- 9. BOT ACCOUNTS (akun Facebook untuk bot — bisa tambah/edit/hapus dari dashboard)
CREATE TABLE IF NOT EXISTS bot_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id VARCHAR(30) NOT NULL,       -- nomor telepon / email login
  account_name VARCHAR(100) NOT NULL,    -- nama profil Facebook
  account_type VARCHAR(20) DEFAULT 'reels' CHECK (account_type IN ('grup', 'reels', 'both')),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  total_posts INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bot_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bot accounts read" ON bot_accounts FOR SELECT USING (true);
CREATE POLICY "Bot accounts insert" ON bot_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Bot accounts update" ON bot_accounts FOR UPDATE USING (true);
CREATE POLICY "Bot accounts delete" ON bot_accounts FOR DELETE USING (true);
