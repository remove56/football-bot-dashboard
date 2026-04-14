// ============================================================
// API: Analyze Content — cek apakah URL berisi konten sepakbola
//
// Input (POST body): { id, field, url }
//   - id: UUID row posting_tracker
//   - field: 'gambar1' | 'gambar2' | 'video'
//   - url: URL yang mau dicek
//
// Flow:
//   1. Fetch URL dengan User-Agent FacebookExternalHit (sama kayak dedup)
//   2. Extract og:title + og:description + og:image_alt
//   3. Scan keyword sepakbola di gabungan text
//   4. Hitung jumlah match → tentukan status
//   5. Update row di Supabase: status + checked_at + detected_title
//   6. Return status
//
// Status values:
//   'ok'           = 2+ keyword match → konten sepakbola pasti
//   'suspect'      = 1 keyword match → meragukan
//   'not_football' = 0 keyword match → bukan sepakbola
//   'error'        = fetch gagal / tidak ada og:title
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Keyword list — lowercase, akan di-match case-insensitive
const FOOTBALL_KEYWORDS = [
  // Bahasa Indonesia umum
  'bola', 'sepakbola', 'sepak bola', 'gol', 'liga', 'timnas', 'pertandingan',
  'pemain', 'pelatih', 'klub', 'stadion', 'striker', 'kiper', 'bek', 'gelandang',
  'wasit', 'kartu kuning', 'kartu merah', 'penalti', 'tendangan bebas', 'sundulan',
  'transfer', 'bursa transfer', 'cedera', 'laga', 'derbi', 'final', 'semifinal',
  'juara', 'skuad', 'starting xi', 'lineup', 'susunan pemain',

  // Liga & kompetisi internasional
  'premier league', 'la liga', 'serie a', 'bundesliga', 'ligue 1', 'eredivisie',
  'champions league', 'europa league', 'conference league', 'world cup', 'piala dunia',
  'piala eropa', 'euro 2024', 'copa america', 'afc', 'asian cup', 'piala asia',
  'fa cup', 'carabao cup', 'copa del rey', 'coppa italia', 'dfb pokal',

  // Liga Indonesia
  'liga 1', 'liga 2', 'liga indonesia', 'bri liga', 'bri liga 1', 'pegadaian liga',
  'piala presiden', 'piala indonesia', 'super league', 'sea games',

  // Klub Inggris
  'manchester united', 'manchester city', 'liverpool', 'chelsea', 'arsenal',
  'tottenham', 'newcastle', 'aston villa', 'west ham', 'everton', 'mu', 'manutd',
  'leeds', 'leicester', 'wolves', 'brighton', 'fulham', 'crystal palace',

  // Klub Spanyol
  'real madrid', 'barcelona', 'atletico madrid', 'atletico', 'sevilla', 'valencia',
  'villarreal', 'real betis', 'athletic bilbao', 'real sociedad', 'barca', 'madridista',

  // Klub Italia
  'juventus', 'ac milan', 'inter milan', 'inter', 'napoli', 'roma', 'lazio',
  'fiorentina', 'atalanta', 'bologna', 'torino', 'rossoneri', 'nerazzurri', 'bianconeri',

  // Klub Jerman
  'bayern munich', 'bayern munchen', 'borussia dortmund', 'dortmund', 'bvb',
  'rb leipzig', 'bayer leverkusen', 'leverkusen', 'eintracht frankfurt', 'schalke',

  // Klub Prancis
  'psg', 'paris saint-germain', 'marseille', 'lyon', 'monaco', 'lille', 'nice',

  // Klub lain Eropa
  'ajax', 'psv', 'feyenoord', 'benfica', 'porto', 'sporting', 'celtic', 'rangers',

  // ⚽ KLUB LIGA INDONESIA (lengkap — request user)
  'persija', 'persija jakarta', 'persib', 'persib bandung', 'arema', 'arema fc',
  'persebaya', 'persebaya surabaya', 'psm', 'psm makassar', 'bali united',
  'madura united', 'borneo fc', 'borneo', 'psis', 'psis semarang', 'bhayangkara',
  'bhayangkara fc', 'persita', 'persita tangerang', 'persik', 'persik kediri',
  'persikabo', 'dewa united', 'rans nusantara', 'rans fc', 'barito putera',
  'psssb', 'semen padang', 'pss sleman', 'pss', 'sriwijaya', 'sriwijaya fc',
  'mitra kukar', 'kalteng putra', 'persis solo', 'persis', 'persiraja',
  'tira persikabo', 'badak lampung', 'martapura',

  // Pemain bintang (nama yang sering jadi keyword)
  'messi', 'ronaldo', 'cristiano', 'cr7', 'neymar', 'mbappe', 'haaland',
  'salah', 'kane', 'bellingham', 'vinicius', 'vini jr', 'lewandowski',
  'modric', 'de bruyne', 'rodri', 'foden', 'saka', 'odegaard', 'martinez',
  'benzema', 'griezmann', 'pedri', 'gavi', 'yamal', 'raphinha',

  // Pemain timnas Indonesia (sering jadi topik)
  'shin tae-yong', 'shin tae yong', 'sty', 'kluivert', 'patrick kluivert',
  'marselino', 'marselino ferdinan', 'rafael struick', 'struick', 'justin hubner',
  'jay idzes', 'jordi amat', 'sandy walsh', 'shayne pattynama', 'thom haye',
  'elkan baggott', 'witan sulaeman', 'pratama arhan', 'asnawi', 'ernando ari',
  'ragnar oratmangoen', 'calvin verdonk', 'mees hilgers', 'eliano reijnders',
  'garuda', 'garuda muda',

  // Istilah Inggris umum
  'football', 'soccer', 'goal', 'match', 'goalkeeper', 'midfielder', 'defender',
  'forward', 'winger', 'captain', 'manager', 'coach', 'tactical', 'formation',
  'offside', 'corner', 'freekick', 'penalty', 'hat-trick', 'hattrick',
  'transfer window', 'signed', 'debut', 'assist', 'clean sheet',

  // Generik tapi relevan di konteks sepakbola
  'fifa', 'uefa', 'afc', 'pssi', 'concacaf', 'conmebol', 'afcon',
];

const FB_UA = 'Mozilla/5.0 (compatible; FacebookExternalHit/1.1; +http://www.facebook.com/externalhit_uatext.php)';

async function extractTextFromUrl(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': FB_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000), // 10 detik timeout
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const html = await res.text();

    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const ogImageAlt = html.match(/<meta\s+property=["']og:image:alt["']\s+content=["']([^"']+)["']/i);
    const twitterTitle = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
    const twitterDesc = html.match(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i);

    const title = ogTitle?.[1] || twitterTitle?.[1] || '';
    const desc = ogDesc?.[1] || twitterDesc?.[1] || '';
    const imageAlt = ogImageAlt?.[1] || '';

    if (!title && !desc && !imageAlt) return { error: 'no_og_tags' };

    return {
      title,
      combined: [title, desc, imageAlt].filter(Boolean).join(' ').toLowerCase(),
    };
  } catch (e) {
    return { error: e.message || 'fetch_failed' };
  }
}

// Anti-keyword: indikator kuat bahwa konten BUKAN sepakbola.
// Kalau salah satu match, langsung tandai not_football.
// CATATAN: musik/lagu TIDAK di-block — user bilang boleh bebas.
const ANTI_KEYWORDS = [
  // Makanan & resep
  'resep', 'masakan', 'recipe', 'kuliner', 'masak ',
  'chef', 'dapur',
  // Game (non-football)
  'mobile legends', 'free fire', 'pubg', 'valorant', 'genshin', 'minecraft',
  'roblox', 'mlbb',
  // Film & TV
  'drama korea', 'drakor', 'sinetron', 'anime ', 'manga', 'cartoon',
  // Beauty & fashion
  'tutorial makeup', 'skincare', 'tutorial hijab',
  // Politik
  'pemilu', 'capres', 'dpr ', 'mpr ',
  // Agama (konten ceramah)
  'pengajian', 'ceramah', 'khutbah',
  // Tutorial non-bola
  'tutorial coding',
  // Hewan peliharaan
  'ikan cupang', 'ayam aduan', 'burung kicau',
  // Spam judi/pinjol
  'pinjaman online', 'pinjol', 'judi online', 'slot online',
];

function countKeywordMatches(text, keywords) {
  if (!text) return 0;
  let count = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) count++;
  }
  return count;
}

// Algoritma context-aware:
// 1. Ada anti-keyword kuat → not_football (red)
// 2. Ada keyword bola minimal 1 → ok (green) — karena konteks grup udah bola
// 3. Kosong total, tapi grup = grup bola (dari context) → ok (green) — trust context
// 4. Fetch gagal total → caller sudah handle sebagai 'error'
function determineStatus({ fetchedText, groupContext }) {
  const combinedForFootball = `${fetchedText} ${groupContext}`.toLowerCase();
  const antiMatches = countKeywordMatches(fetchedText, ANTI_KEYWORDS);
  if (antiMatches >= 1) return { status: 'not_football', reason: `anti-keyword match (${antiMatches})` };

  const footballMatches = countKeywordMatches(combinedForFootball, FOOTBALL_KEYWORDS);
  if (footballMatches >= 1) return { status: 'ok', reason: `${footballMatches} football keyword match` };

  // Fallback: kalau groupContext ada dan nggak kosong, trust context
  if (groupContext && groupContext.trim().length > 0) return { status: 'ok', reason: 'trust group context' };

  return { status: 'suspect', reason: 'no keyword match, no context' };
}

export async function POST(req) {
  try {
    const { id, field, url } = await req.json();

    if (!id || !field || !url) {
      return NextResponse.json({ error: 'Missing id, field, or url' }, { status: 400 });
    }
    if (!['gambar1', 'gambar2', 'video'].includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    const fieldStatus = `${field}_status`;
    const fieldCheckedAt = `${field}_checked_at`;
    const fieldDetectedTitle = `${field}_detected_title`;

    // Ambil group context dari row posting_tracker + join ke groups untuk dapat club
    const { data: row } = await supabase
      .from('posting_tracker')
      .select('group_id, group_name')
      .eq('id', id)
      .single();

    let groupContext = '';
    if (row) {
      groupContext = (row.group_name || '').toLowerCase();
      // Coba tambahkan club dari tabel groups
      if (row.group_id) {
        const { data: grp } = await supabase
          .from('groups')
          .select('club, name, league')
          .eq('id', row.group_id)
          .single();
        if (grp) {
          groupContext += ' ' + (grp.club || '').toLowerCase() + ' ' + (grp.name || '').toLowerCase() + ' ' + (grp.league || '').toLowerCase();
        }
      }
    }

    // Extract og tags
    const result = await extractTextFromUrl(url);
    const now = new Date().toISOString();

    if (result.error) {
      // Kalau fetch gagal tapi group context ada dan jelas grup bola → trust context → ok
      const contextCheck = determineStatus({ fetchedText: '', groupContext });
      if (contextCheck.status === 'ok') {
        await supabase
          .from('posting_tracker')
          .update({
            [fieldStatus]: 'ok',
            [fieldCheckedAt]: now,
            [fieldDetectedTitle]: `[CONTEXT] ${row?.group_name || 'group'} — fetch failed, trusted`,
          })
          .eq('id', id);
        return NextResponse.json({ status: 'ok', reason: 'fetch_failed_trust_context' });
      }
      await supabase
        .from('posting_tracker')
        .update({
          [fieldStatus]: 'error',
          [fieldCheckedAt]: now,
          [fieldDetectedTitle]: `[ERROR] ${result.error}`,
        })
        .eq('id', id);
      return NextResponse.json({ status: 'error', reason: result.error });
    }

    // Klasifikasi dengan context
    const { status, reason } = determineStatus({ fetchedText: result.combined, groupContext });

    await supabase
      .from('posting_tracker')
      .update({
        [fieldStatus]: status,
        [fieldCheckedAt]: now,
        [fieldDetectedTitle]: (result.title || '[no title]').substring(0, 200),
      })
      .eq('id', id);

    return NextResponse.json({ status, reason, title: result.title });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
