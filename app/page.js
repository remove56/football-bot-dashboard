'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

// ============================================================
// STYLES
// ============================================================
// DARK CRYSTAL ICE STRONG THEME — obsidian black dengan aksen kristal es biru
const S = {
  nav: { background:'linear-gradient(180deg,#020617 0%,#0f172a 100%)',borderBottom:'2px solid #0891b2',padding:'12px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100,boxShadow:'0 2px 20px rgba(6,182,212,0.3)' },
  h1: { fontSize:20,background:'linear-gradient(135deg,#67e8f9 0%,#22d3ee 30%,#06b6d4 70%,#0891b2 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:900,textShadow:'0 0 30px rgba(34,211,238,0.4)',letterSpacing:0.5 },
  tabs: { display:'flex',gap:8,padding:'14px 24px',background:'linear-gradient(180deg,#0f172a 0%,#020617 100%)',borderBottom:'1px solid #164e63',flexWrap:'wrap' },
  tab: (a) => ({ padding:'8px 16px',borderRadius:6,cursor:'pointer',fontSize:13,fontWeight:700,color:a?'#22d3ee':'#64748b',background:a?'linear-gradient(135deg,#164e63 0%,#0e7490 100%)':'#0f172a',border:`2px solid ${a?'#06b6d4':'#1e293b'}`,boxShadow:a?'0 0 20px rgba(6,182,212,0.5), inset 0 1px 0 rgba(103,232,249,0.3)':'none',transition:'all 0.2s',textTransform:'uppercase',letterSpacing:0.5 }),
  main: { padding:24,maxWidth:1400,margin:'0 auto' },
  box: { background:'linear-gradient(135deg,#0f172a 0%,#020617 100%)',border:'1px solid #164e63',borderRadius:8,padding:24,marginBottom:24,boxShadow:'0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.1), inset 0 1px 0 rgba(103,232,249,0.05)' },
  stat: { background:'linear-gradient(135deg,#0f172a 0%,#020617 100%)',border:'1px solid #164e63',borderRadius:6,padding:18,boxShadow:'0 0 15px rgba(6,182,212,0.2), inset 0 1px 0 rgba(103,232,249,0.08)' },
  num: { fontSize:28,fontWeight:900,background:'linear-gradient(135deg,#e0f2fe 0%,#67e8f9 50%,#06b6d4 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textShadow:'0 0 20px rgba(103,232,249,0.3)' },
  label: { fontSize:12,color:'#64748b',marginTop:4,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5 },
  input: { width:'100%',padding:'10px 14px',background:'#020617',border:'1px solid #1e293b',borderRadius:6,color:'#e0f2fe',fontSize:14,outline:'none',fontWeight:500 },
  btn: (c) => ({ padding:'10px 16px',border:`1px solid ${c||'#0e7490'}`,borderRadius:6,background:c?`linear-gradient(135deg,${c} 0%,${c}dd 100%)`:'linear-gradient(135deg,#0e7490 0%,#164e63 100%)',color:'#e0f2fe',fontSize:13,fontWeight:800,cursor:'pointer',boxShadow:'0 2px 12px rgba(6,182,212,0.3)',transition:'all 0.2s',textTransform:'uppercase',letterSpacing:0.5 }),
  badge: (c) => ({ padding:'2px 8px',borderRadius:3,fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:0.5,...({
    ok:{background:'linear-gradient(135deg,#064e3b 0%,#047857 100%)',color:'#6ee7b7',border:'1px solid #10b981'},
    fail:{background:'linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)',color:'#fca5a5',border:'1px solid #ef4444'},
    pending:{background:'linear-gradient(135deg,#1e3a8a 0%,#1e40af 100%)',color:'#93c5fd',border:'1px solid #3b82f6'},
    approved:{background:'linear-gradient(135deg,#064e3b 0%,#047857 100%)',color:'#6ee7b7',border:'1px solid #10b981'},
    rejected:{background:'linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)',color:'#fca5a5',border:'1px solid #ef4444'},
    admin:{background:'linear-gradient(135deg,#581c87 0%,#6b21a8 100%)',color:'#d8b4fe',border:'1px solid #a855f7'},
    member:{background:'linear-gradient(135deg,#164e63 0%,#0e7490 100%)',color:'#67e8f9',border:'1px solid #06b6d4'}
  }[c]||{background:'#0f172a',color:'#94a3b8',border:'1px solid #1e293b'}) }),
  th: { background:'linear-gradient(135deg,#0f172a 0%,#020617 100%)',padding:'10px 14px',textAlign:'left',fontSize:12,color:'#22d3ee',fontWeight:800,borderBottom:'2px solid #164e63',textTransform:'uppercase',letterSpacing:0.5 },
  td: { padding:'10px 14px',borderTop:'1px solid #0f172a',fontSize:13,color:'#cbd5e1' },
  link: { color:'#67e8f9',textDecoration:'none',fontWeight:700 },
};

const LEAGUE_COLORS = {'La Liga':'#22d3ee','Premier League':'#60a5fa','Serie A':'#67e8f9','Bundesliga':'#06b6d4','Ligue 1':'#38bdf8','Liga 1':'#7dd3fc','Timnas':'#0ea5e9','Pemain':'#a5f3fc'};

// ============================================================
// CONTENT DEDUP — Normalisasi URL untuk deteksi duplikat
// Mengekstrak "fingerprint" konten dari URL apapun
// Bahkan jika URL di-edit, potong parameter, ganti query string
// ============================================================
// Resolve link bot lama (format `bot:groupId:timestamp`) → URL grup FB asli
// Data baru sudah pakai URL FB, jadi function ini cuma transform legacy data
function resolveBotLink(link) {
  if (!link) return '';
  if (link.startsWith('bot:')) {
    const parts = link.split(':');
    const groupId = parts[1] || '';
    return groupId ? `https://www.facebook.com/groups/${groupId}/?bot=1&legacy=1` : '';
  }
  return link;
}

function normalizeContentUrl(url) {
  if (!url) return '';
  try {
    const raw = url.trim(); // Simpan URL asli (dengan query params)

    // Facebook — ekstrak ID dari URL ASLI (sebelum strip params)
    // fbid=123 atau /posts/123 atau /reel/123 atau pfbid...
    const fbidMatch = raw.match(/[?&]fbid=(\d{10,})/i);
    if (fbidMatch) return 'fb:' + fbidMatch[1];

    const fbPostMatch = raw.match(/facebook\.com\/.*?\/posts\/(\d{10,})/i);
    if (fbPostMatch) return 'fb:' + fbPostMatch[1];

    const fbReelMatch = raw.match(/facebook\.com\/reel\/(\d{10,})/i);
    if (fbReelMatch) return 'fb:' + fbReelMatch[1];

    const fbVideoMatch = raw.match(/facebook\.com\/.*?\/videos\/(\d{10,})/i);
    if (fbVideoMatch) return 'fb:' + fbVideoMatch[1];

    const fbWatchMatch = raw.match(/facebook\.com\/watch\/?\?v=(\d{10,})/i);
    if (fbWatchMatch) return 'fb:' + fbWatchMatch[1];

    const fbStoryMatch = raw.match(/story_fbid=(\d{10,})/i);
    if (fbStoryMatch) return 'fb:' + fbStoryMatch[1];

    const pfbidMatch = raw.match(/(pfbid\w{20,})/i);
    if (pfbidMatch) return 'fb:' + pfbidMatch[1];

    // YouTube — ekstrak video ID
    const ytMatch = raw.match(/(?:youtube\.com\/(?:watch\?.*?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
    if (ytMatch) return 'yt:' + ytMatch[1];

    // TikTok — ekstrak video ID
    const ttMatch = raw.match(/tiktok\.com.*?\/video\/(\d+)/i);
    if (ttMatch) return 'tt:' + ttMatch[1];

    // Instagram — ekstrak shortcode
    const igMatch = raw.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/i);
    if (igMatch) return 'ig:' + igMatch[1];

    // Twitter/X — ekstrak status ID
    const twMatch = raw.match(/(?:twitter|x)\.com\/\w+\/status\/(\d+)/i);
    if (twMatch) return 'tw:' + twMatch[1];

    // Default: domain + path (tanpa query/fragment)
    const cleaned = raw.replace(/[#?].*$/, '').replace(/\/+$/, '');
    const parsed = new URL(cleaned.startsWith('http') ? cleaned : 'https://' + cleaned);
    return parsed.hostname.replace('www.', '') + parsed.pathname.replace(/\/+$/, '');
  } catch (e) {
    return url.trim().toLowerCase().replace(/[#?].*$/, '').replace(/\/+$/, '');
  }
}

// ============================================================
// HELPER: Warna icon berdasarkan status analisa konten.
// Dipakai di tabel Progress Postingan untuk tandain G1/G2/V.
// ============================================================
function getStatusStyle(link, status) {
  if (!link) return { bg: '#1f2937', fg: '#374151', label: 'Belum diisi' };
  switch (status) {
    case 'ok':            return { bg: '#065f46', fg: '#6ee7b7', label: 'OK — konten sepakbola' };
    case 'suspect':       return { bg: '#78350f', fg: '#fcd34d', label: 'Meragukan — cek manual' };
    case 'not_football':  return { bg: '#7f1d1d', fg: '#fca5a5', label: 'BUKAN sepakbola — akan dihapus' };
    case 'error':         return { bg: '#374151', fg: '#9ca3af', label: 'Error — link rusak / FB block' };
    case 'pending':
    default:              return { bg: '#3b0764', fg: '#c4b5fd', label: 'Sedang dianalisa...' };
  }
}

// ============================================================
// HELPER: Format tanggal lokal (YYYY-MM-DD) — pakai timezone browser, BUKAN UTC.
// Kritis untuk konsistensi data antar user di WIB (UTC+7), supaya semua user
// di tanggal lokal yang sama menulis & membaca period yang sama.
// ============================================================
function localDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ============================================================
// HELPER: Kategorisasi performa target harian
// ============================================================
function getTargetCategory(completed, target) {
  if (!target || target === 0) return { label: 'Tanpa Target', color: '#6b7280', bg: '#1f2937' };
  if (completed === 0) return { label: 'Belum Mulai', color: '#9ca3af', bg: '#1f2937' };
  const pct = (completed / target) * 100;
  if (pct >= 100) return { label: 'Sangat Bagus', color: '#10b981', bg: '#064e3b' };
  if (pct >= 70) return { label: 'Bagus', color: '#3b82f6', bg: '#1e3a5f' };
  if (pct >= 50) return { label: 'Sedang', color: '#f59e0b', bg: '#78350f' };
  if (pct >= 40) return { label: 'Buruk', color: '#f97316', bg: '#7c2d12' };
  return { label: 'Sangat Buruk', color: '#ef4444', bg: '#7f1d1d' };
}

// ============================================================
// HELPER: Hitung jumlah grup unik yang dicapai member pada tanggal tertentu
// ============================================================
function countGroupsForDate(memberName, period, tracker) {
  const posts = tracker.filter(p => p.period === period && p.user_name === memberName);
  return new Set(posts.map(p => p.group_id)).size;
}

// ============================================================
// HELPER: Hitung streak (hari berturut-turut on-target)
// ============================================================
function computeStreak(memberName, target, history) {
  if (!target || target === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = localDateString(d);
    const count = countGroupsForDate(memberName, dateKey, history);
    if (count >= target) {
      streak++;
    } else {
      // Hari ini belum tercapai — jangan putuskan streak
      if (i === 0 && count < target) continue;
      break;
    }
  }
  return streak;
}

// ============================================================
// HELPER: Hitung rata-rata performa N hari terakhir (0-100%)
// ============================================================
function computeAvgPerformance(memberName, target, history, days) {
  if (!target || target === 0) return 0;
  const today = new Date();
  let totalPct = 0;
  let validDays = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = localDateString(d);
    const count = countGroupsForDate(memberName, dateKey, history);
    const pct = Math.min(100, (count / target) * 100);
    totalPct += pct;
    validDays++;
  }
  return validDays > 0 ? Math.round(totalPct / validDays) : 0;
}

// ============================================================
// HELPER: Countdown ke jam 23:59 hari ini
// ============================================================
function getDeadlineCountdown() {
  const now = new Date();
  const deadline = new Date();
  deadline.setHours(23, 59, 0, 0);
  const diff = deadline - now;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { hours, minutes, total: diff };
}

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');

  const login = async () => {
    // Dual-mode login: cek password_hash dulu, fallback ke plaintext (auto-migrate).
    const { data } = await supabase.from('users').select('*').eq('username', u).single();
    if (!data) { setErr('Username atau password salah'); return; }

    // Path 1: punya password_hash → bcrypt verify
    if (data.password_hash) {
      try {
        const ok = await bcrypt.compare(p, data.password_hash);
        if (ok) { onLogin(data); return; }
      } catch (e) { /* fall through to plaintext check */ }
    }

    // Path 2: fallback plaintext (backward compat) + auto-migrate
    if (data.password === p) {
      // Auto-hash & clear plaintext (transparent migration, consistent dgn bulk script)
      try {
        const hash = await bcrypt.hash(p, 10);
        await supabase.from('users').update({
          password_hash: hash,
          password: null, // CLEAR plaintext biar konsisten dgn bulk migration
          password_migrated_at: new Date().toISOString(),
        }).eq('id', data.id);
      } catch (e) { /* silent — login tetap sukses walaupun migrate gagal */ }
      onLogin(data);
      return;
    }

    setErr('Username atau password salah');
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',position:'relative'}}>
      <div style={{
        background:'linear-gradient(135deg,#0f172a 0%,#020617 100%)',
        border:'2px solid #164e63',
        borderRadius:8,padding:48,width:400,
        boxShadow:'0 0 40px rgba(6,182,212,0.3), 0 0 80px rgba(8,145,178,0.15), inset 0 1px 0 rgba(103,232,249,0.1), 0 20px 50px rgba(0,0,0,0.5)',
        position:'relative',
      }}>
        {/* Crystal edge decoration */}
        <div style={{position:'absolute',top:-2,left:-2,right:-2,height:3,background:'linear-gradient(90deg,transparent,#22d3ee,transparent)',borderRadius:'8px 8px 0 0',boxShadow:'0 0 20px rgba(34,211,238,0.6)'}} />
        <div style={{textAlign:'center',fontSize:40,marginBottom:12,filter:'drop-shadow(0 0 10px rgba(103,232,249,0.5))'}}>❄⚽❄</div>
        <h1 style={{...S.h1,fontSize:28,textAlign:'center',marginBottom:8,letterSpacing:1}}>Football Bot Dashboard</h1>
        <p style={{color:'#64748b',fontSize:12,textAlign:'center',marginBottom:32,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>ACCESS TERMINAL</p>
        {err && <div style={{background:'linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)',color:'#fca5a5',padding:10,borderRadius:4,textAlign:'center',marginBottom:16,fontSize:13,border:'1px solid #ef4444',textTransform:'uppercase',letterSpacing:0.5,fontWeight:700}}>{err}</div>}
        <div style={{marginBottom:20}}>
          <label style={{display:'block',fontSize:11,color:'#22d3ee',marginBottom:6,fontWeight:800,textTransform:'uppercase',letterSpacing:1.5}}>Username</label>
          <input style={S.input} value={u} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} />
        </div>
        <div style={{marginBottom:28}}>
          <label style={{display:'block',fontSize:11,color:'#22d3ee',marginBottom:6,fontWeight:800,textTransform:'uppercase',letterSpacing:1.5}}>Password</label>
          <input style={S.input} type="password" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} />
        </div>
        <button onClick={login} style={{
          width:'100%',padding:14,
          background:'linear-gradient(135deg,#22d3ee 0%,#06b6d4 30%,#0891b2 70%,#164e63 100%)',
          border:'1px solid #67e8f9',borderRadius:4,color:'#020617',fontSize:15,fontWeight:900,cursor:'pointer',
          boxShadow:'0 4px 24px rgba(6,182,212,0.5), inset 0 1px 0 rgba(207,250,254,0.4)',textTransform:'uppercase',letterSpacing:3,
        }}>❄ ENTER ❄</button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function Home() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('');
  const [groups, setGroups] = useState([]);
  const [links, setLinks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [leagueFilter, setLeagueFilter] = useState('');
  const [search, setSearch] = useState('');

  // Bot accounts
  const [botAccounts, setBotAccounts] = useState([]);
  const [baId, setBaId] = useState('');
  const [baName, setBaName] = useState('');
  const [baType, setBaType] = useState('reels');
  const [baNotes, setBaNotes] = useState('');
  const [baPartner, setBaPartner] = useState('');
  const [baMsg, setBaMsg] = useState('');
  const [baEditing, setBaEditing] = useState(null);

  // Link form
  const [linkGroup, setLinkGroup] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNote, setLinkNote] = useState('');
  const [linkMsg, setLinkMsg] = useState('');

  // User form
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newName, setNewName] = useState('');
  const [userMsg, setUserMsg] = useState('');

  // Group form
  const [grpId, setGrpId] = useState('');
  const [grpClub, setGrpClub] = useState('');
  const [grpName, setGrpName] = useState('');
  const [grpUrl, setGrpUrl] = useState('');
  const [grpLeague, setGrpLeague] = useState('La Liga');
  const [grpMsg, setGrpMsg] = useState('');

  // Weekly stats
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [wsMonth, setWsMonth] = useState(new Date().getMonth() + 1);
  const [wsYear, setWsYear] = useState(new Date().getFullYear());
  const [wsEditing, setWsEditing] = useState(null);
  const [wsSaving, setWsSaving] = useState(false);

  // Task queue (admin only)
  const [taskQueue, setTaskQueue] = useState([]);
  const [tqMember, setTqMember] = useState('');
  const [tqGroups, setTqGroups] = useState([]);
  const [tqType, setTqType] = useState('full');
  const [tqCycle, setTqCycle] = useState('auto'); // 'auto' | 1 | 2 | 3 | 4
  const [tqCycleStatus, setTqCycleStatus] = useState({}); // { groupId: {1: {g1,g2,v}, 2: ..., 3: ..., 4: ...} }
  const [tqMsg, setTqMsg] = useState('');
  const [tqSelectAll, setTqSelectAll] = useState(false);
  const [tqAccountId, setTqAccountId] = useState(''); // Akun bot grup yang dipilih
  // Bulk Generate state — preview { tasks, skipped, unmapped } sebelum commit
  const [tqBulkPreview, setTqBulkPreview] = useState(null);
  const [tqBulkBusy, setTqBulkBusy] = useState(false);

  // Form tambah akun grup (di tab Jalankan Bot)
  const [bgId, setBgId] = useState('');
  const [bgName, setBgName] = useState('');
  const [bgNotes, setBgNotes] = useState('');
  const [bgMsg, setBgMsg] = useState('');
  const [bgEditing, setBgEditing] = useState(null);

  // Backup & Restore
  const [backupMsg, setBackupMsg] = useState('');
  const [backupStats, setBackupStats] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  // Change password
  const [pwModal, setPwModal] = useState(false);
  const [pwOld, setPwOld] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  // Audit konten historis
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditStopRequested, setAuditStopRequested] = useState(false);
  const [auditProgress, setAuditProgress] = useState({ done: 0, total: 0, ok: 0, suspect: 0, notFootball: 0, error: 0 });
  const [auditMsg, setAuditMsg] = useState('');

  // Auto backup history (Vercel Cron)
  const [autoBackups, setAutoBackups] = useState([]);
  const [autoBackupsLoading, setAutoBackupsLoading] = useState(false);

  // Bot health monitoring (heartbeat dari worker)
  const [botHealth, setBotHealth] = useState([]);
  const [botHealthLoading, setBotHealthLoading] = useState(false);

  // Panduan member modal
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideSection, setGuideSection] = useState('welcome');

  // Notifications system
  const [notifications, setNotifications] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
  const [broadcastTarget, setBroadcastTarget] = useState('all'); // 'all' or user_id
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Chat system
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState('global'); // 'global' or 'dm'
  const [chatDmPartner, setChatDmPartner] = useState(null); // { id, name }
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatDmList, setChatDmList] = useState([]); // list of DM conversations
  const [chatUnread, setChatUnread] = useState(0); // total unread (DM + global)
  const [chatUploading, setChatUploading] = useState(false);
  const [chatRecording, setChatRecording] = useState(false);
  const [chatRecordSec, setChatRecordSec] = useState(0);
  const [chatPendingAttachment, setChatPendingAttachment] = useState(null); // { file, previewUrl, type, name, size }
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [chatLightbox, setChatLightbox] = useState(null); // { url, name } — kalau ada, buka lightbox viewer
  const [chatViewOnceMode, setChatViewOnceMode] = useState(false); // toggle 🔥 view once
  const chatLocalViewedRef = useRef(new Map()); // id -> { message, attachment_url, ... } konten lokal sebelum di-clear di DB
  const [soundEnabled, setSoundEnabled] = useState(true); // sound notification toggle
  // Bot Stats data (last 7 days) — terpisah grup + reels
  const [botStatsData, setBotStatsData] = useState({
    grup: { accounts: [], errors: [], recentFails: [], summary: { totalDone: 0, totalFailed: 0, totalPending: 0, successRate: 0 } },
    reels: { accounts: [], errors: [], recentFails: [], summary: { totalDone: 0, totalFailed: 0, totalPending: 0, successRate: 0 } },
  });
  // Theme dipaksa cosmic-fusion untuk SEMUA user (single theme system)
  const [appearOffline, setAppearOffline] = useState(false); // user can hide their online status
  const [onlineUsers, setOnlineUsers] = useState({}); // { userId: last_active_at }
  const chatMediaRecorderRef = useRef(null);
  const chatRecordTimerRef = useRef(null);
  const prevChatUnreadRef = useRef(null); // null = belum init, biar first load nggak beep
  const prevNotifUnreadRef = useRef(null);

  // Pengaturan (Item 5) — bot accounts pakai state existing (baId, baName, dll)
  const [botAccFilter, setBotAccFilter] = useState('all'); // all | grup | reels | both
  const [systemStats, setSystemStats] = useState(null);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Activity log filter
  const [activityFilter, setActivityFilter] = useState('all'); // all | member | bot

  // Search/filter untuk tabel
  const [searchTracking, setSearchTracking] = useState('');
  const [searchActivity, setSearchActivity] = useState('');
  const [searchGrup, setSearchGrup] = useState('');
  const [filterLeague, setFilterLeague] = useState('');

  // Posting tracker
  const [postTracker, setPostTracker] = useState([]);
  const [postTrackerHistory, setPostTrackerHistory] = useState([]); // last 30 days
  const [targetNotes, setTargetNotes] = useState([]);
  const [historyModal, setHistoryModal] = useState(null); // member being viewed
  const [noteReason, setNoteReason] = useState('');
  const [noteMsg, setNoteMsg] = useState('');
  const [ptGroup, setPtGroup] = useState('');
  const [ptCycle, setPtCycle] = useState(1);
  const [ptType, setPtType] = useState('gambar1'); // gambar1, gambar2, video
  const [ptLink, setPtLink] = useState('');
  const [ptMsg, setPtMsg] = useState('');
  const [ptPeriod, setPtPeriod] = useState(() => localDateString());

  useEffect(() => {
    // Check saved session
    const saved = localStorage.getItem('fb-dash-user');
    if (saved) { const u = JSON.parse(saved); setUser(u); setTab(u.role === 'admin' ? 'overview' : 'groups'); }
  }, []);

  useEffect(() => { if (user) { loadData(); loadAutoMasterSwitch(); } }, [user]);
  useEffect(() => { if (user?.role === 'admin' && tab === 'botstats') loadBotStats(); }, [tab, user]);
  useEffect(() => {
    // Saat user pilih grup di "Buat Tugas Posting", auto-load cycle status hari ini
    if (user?.role === 'admin' && tqGroups.length > 0) loadCycleStatus(tqGroups);
    else setTqCycleStatus({});
  }, [tqGroups, user]);

  const login = (u) => { setUser(u); localStorage.setItem('fb-dash-user', JSON.stringify(u)); setTab(u.role === 'admin' ? 'overview' : 'groups'); };
  const logout = () => { setUser(null); localStorage.removeItem('fb-dash-user'); };

  const loadData = async () => {
    const { data: g } = await supabase.from('groups').select('*').order('id');
    setGroups(g || []);
    if (linkGroup === '' && g?.length) setLinkGroup(g[0].id);

    if (user.role === 'admin') {
      const { data: l } = await supabase.from('link_submissions').select('*').order('created_at', { ascending: false }).limit(200);
      setLinks(l || []);
      const { data: a } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(200);
      setActivity(a || []);
      const { data: u } = await supabase.from('users').select('id,username,name,role,daily_target,created_at');
      setUsers(u || []);
      // Load reels tasks
      const { data: rt } = await supabase.from('reels_tasks').select('*').order('created_at', { ascending: false }).limit(50);
      setReelsTasks(rt || []);
      // Load bot accounts
      const { data: ba } = await supabase.from('bot_accounts').select('*').order('created_at');
      setBotAccounts(ba || []);
    } else {
      const { data: l } = await supabase.from('link_submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setLinks(l || []);
      // Member juga load semua users (hanya field publik) supaya bisa lihat progress target
      const { data: u } = await supabase.from('users').select('id,name,role,daily_target');
      setUsers(u || []);
    }
    // Load history (semua role)
    loadPostTrackerHistory();
    loadTargetNotes();
  };

  const submitLink = async () => {
    if (!linkUrl.trim()) { setLinkMsg('Link wajib diisi!'); return; }
    const linkTrimmed = linkUrl.trim();
    const fingerprint = normalizeContentUrl(linkTrimmed);

    // Cek fingerprint di content_registry
    if (fingerprint) {
      const { data: fpMatch } = await supabase
        .from('content_registry')
        .select('user_name, group_name')
        .eq('fingerprint', fingerprint)
        .limit(1);

      if (fpMatch && fpMatch.length > 0) {
        const d = fpMatch[0];
        if (d.user_name !== user.name) {
          setLinkMsg(`Konten ini sudah dipakai oleh "${d.user_name}" di "${d.group_name}". Gunakan konten berbeda!`);
          return;
        }
      }
    }

    const grp = groups.find(g => g.id === linkGroup);
    await supabase.from('link_submissions').insert({
      user_id: user.id, user_name: user.name, group_id: linkGroup,
      group_name: grp?.name || '', link: linkTrimmed, note: linkNote.trim(),
      status: 'approved',
    });

    // Simpan fingerprint
    if (fingerprint) {
      await supabase.from('content_registry').insert({
        fingerprint, original_url: linkTrimmed,
        user_id: user.id, user_name: user.name,
        group_id: linkGroup, group_name: grp?.name || '',
        content_type: 'gambar', source: 'member',
      });
    }

    setLinkUrl(''); setLinkNote(''); setLinkMsg('Link berhasil disubmit!');
    loadData();
  };

  const updateLinkStatus = async (id, status) => {
    await supabase.from('link_submissions').update({ status, reviewed_by: user.name, reviewed_at: new Date().toISOString() }).eq('id', id);
    loadData();
  };

  const deleteLink = async (id) => {
    if (!confirm('Hapus link ini?')) return;
    await supabase.from('link_submissions').delete().eq('id', id);
    loadData();
  };

  const addUser = async () => {
    if (!newUser || !newPass) { setUserMsg('Username dan password wajib!'); return; }
    // Hash password baru biar DB gak nyimpan plaintext
    const newHash = await bcrypt.hash(newPass, 10);
    const { error } = await supabase.from('users').insert({
      username: newUser,
      password_hash: newHash,
      password_migrated_at: new Date().toISOString(),
      name: newName || newUser,
      role: 'member',
    });
    if (error) setUserMsg('Error: ' + error.message);
    else { setUserMsg(`User "${newUser}" ditambahkan!`); setNewUser(''); setNewPass(''); setNewName(''); loadData(); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Hapus user?')) return;
    await supabase.from('users').delete().eq('id', id);
    loadData();
  };

  // Group management
  const addGroup = async () => {
    if (!grpClub || !grpName || !grpUrl) { setGrpMsg('Klub, nama grup, dan URL wajib diisi!'); return; }
    const id = grpId.trim() || grpClub.toLowerCase().replace(/\s+/g, '').substring(0, 10) + (groups.length + 1);
    const { error } = await supabase.from('groups').insert({
      id, club: grpClub.trim(), name: grpName.trim(), url: grpUrl.trim(), league: grpLeague, team_id: null,
    });
    if (error) { setGrpMsg('Error: ' + error.message); }
    else {
      setGrpMsg(`Grup "${grpName}" berhasil ditambahkan!`);
      setGrpId(''); setGrpClub(''); setGrpName(''); setGrpUrl('');
      loadData();
    }
  };

  const deleteGroup = async (id) => {
    if (!confirm('Hapus grup ini? Link submissions terkait juga akan terpengaruh.')) return;
    await supabase.from('groups').delete().eq('id', id);
    loadData();
  };

  // Edit grup
  const [editingGroup, setEditingGroup] = useState(null); // {id, club, name, url, league}

  const startEditGroup = (g) => {
    setEditingGroup({ id: g.id, club: g.club, name: g.name, url: g.url, league: g.league });
  };

  const saveEditGroup = async () => {
    if (!editingGroup) return;
    await supabase.from('groups').update({
      club: editingGroup.club,
      name: editingGroup.name,
      url: editingGroup.url,
      league: editingGroup.league,
    }).eq('id', editingGroup.id);
    setEditingGroup(null);
    loadData();
  };

  // Quick-set primary_account_id untuk grup (dipakai Bulk Task Creator)
  const setGroupPrimaryAccount = async (groupId, accountId) => {
    await supabase.from('groups').update({
      primary_account_id: accountId || null,
    }).eq('id', groupId);
    loadData();
  };

  // Quick-set fallback theme untuk grup (5 pilihan: cinematic, neon, sport_magazine, 3d_text, minimalist)
  const setGroupFallbackTheme = async (groupId, theme) => {
    await supabase.from('groups').update({
      fallback_theme: theme || 'cinematic',
    }).eq('id', groupId);
    loadData();
  };

  // ============================================================
  // AUTONOMOUS POSTING — master switch + per-grup toggle/interval (DORMANT)
  // ============================================================
  const [autoMasterSwitch, setAutoMasterSwitch] = useState(false);
  const loadAutoMasterSwitch = async () => {
    const { data } = await supabase.from('app_config').select('value').eq('key', 'auto_post_master_switch').single();
    if (data) setAutoMasterSwitch(data.value === true || data.value === 'true');
  };
  const toggleAutoMasterSwitch = async () => {
    const newVal = !autoMasterSwitch;
    if (newVal && !confirm('AKTIFKAN autonomous posting?\n\nBot akan auto-create posting task tiap interval untuk semua grup yang auto_post_enabled=true.\n\nLanjut?')) return;
    const { error } = await supabase.from('app_config').update({
      value: newVal, updated_at: new Date().toISOString(),
    }).eq('key', 'auto_post_master_switch');
    if (error) { alert('Error: ' + error.message); return; }
    setAutoMasterSwitch(newVal);
  };
  // ============================================================
  // BOT STATS — analytics task_queue (grup) + reels_tasks (reels) last 7 days
  // ============================================================
  const aggregateBotStats = (tasks, isReels) => {
    // Per-account stats
    const accountMap = {};
    for (const t of tasks) {
      if (!t.account_id) continue;
      const key = t.account_id;
      if (!accountMap[key]) accountMap[key] = { account_id: key, account_name: t.account_name || key, total: 0, done: 0, failed: 0, pending: 0 };
      accountMap[key].total++;
      if (t.status === 'done') accountMap[key].done++;
      else if (t.status === 'failed') accountMap[key].failed++;
      else if (t.status === 'pending' || t.status === 'running') accountMap[key].pending++;
    }
    const accounts = Object.values(accountMap)
      .map(a => ({ ...a, successRate: a.total > 0 ? Math.round((a.done / a.total) * 100) : 0 }))
      .sort((x, y) => y.total - x.total);

    // Error breakdown — top 5
    const errorCounts = {};
    for (const t of tasks) {
      if (t.status !== 'failed' || !t.error_message) continue;
      const msg = t.error_message.replace(/^\[(retry|permanent)[^\]]+\]\s*/, '').substring(0, 60);
      errorCounts[msg] = (errorCounts[msg] || 0) + 1;
    }
    const errors = Object.entries(errorCounts)
      .map(([msg, count]) => ({ msg, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent failures — 10 latest
    const recentFails = tasks
      .filter(t => t.status === 'failed')
      .slice(0, 10)
      .map(t => ({
        time: t.completed_at || t.created_at,
        account: t.account_name,
        target: isReels ? (t.platforms?.join('+') || 'reels') : t.group_name,
        club: isReels ? (t.keyword || '-') : t.club,
        reason: (t.error_message || '').replace(/^\[(retry|permanent)[^\]]+\]\s*/, '').substring(0, 100),
      }));

    // Summary
    const totalDone = tasks.filter(t => t.status === 'done').length;
    const totalFailed = tasks.filter(t => t.status === 'failed').length;
    const totalPending = tasks.filter(t => t.status === 'pending' || t.status === 'running').length;
    const summary = {
      totalDone, totalFailed, totalPending,
      successRate: tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0,
    };

    return { accounts, errors, recentFails, summary };
  };

  const loadBotStats = async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    // Bot Grup — task_queue
    const { data: grupTasks } = await supabase
      .from('task_queue')
      .select('account_id, account_name, group_name, club, status, error_message, created_at, completed_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false });
    // Bot Reels — reels_tasks
    const { data: reelsTasks } = await supabase
      .from('reels_tasks')
      .select('account_id, account_name, platforms, keyword, status, error_message, created_at, completed_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false });

    setBotStatsData({
      grup: aggregateBotStats(grupTasks || [], false),
      reels: aggregateBotStats(reelsTasks || [], true),
    });
  };

  const setGroupAutoPost = async (groupId, enabled) => {
    await supabase.from('groups').update({ auto_post_enabled: !!enabled }).eq('id', groupId);
    loadData();
  };
  const setGroupInterval = async (groupId, hours) => {
    const v = Math.max(1, Math.min(24, parseInt(hours, 10) || 2));
    await supabase.from('groups').update({ posting_interval_hours: v }).eq('id', groupId);
    loadData();
  };

  // Weekly stats functions
  const loadWeeklyStats = async (y, m) => {
    const { data } = await supabase.from('weekly_stats').select('*').eq('year', y).eq('month', m);
    setWeeklyStats(data || []);
  };

  const getWeekValue = (groupId, week) => {
    const entry = weeklyStats.find(w => w.group_id === groupId && w.week === week);
    return entry ? entry.value : '';
  };

  const getWeekUpdater = (groupId, week) => {
    const entry = weeklyStats.find(w => w.group_id === groupId && w.week === week);
    return entry?.updated_by || '';
  };

  const saveWeekValue = async (groupId, groupName, week, value) => {
    setWsSaving(true);
    const numVal = parseFloat(value) || 0;
    const existing = weeklyStats.find(w => w.group_id === groupId && w.week === week && w.year === wsYear && w.month === wsMonth);

    if (existing) {
      await supabase.from('weekly_stats').update({
        value: numVal, updated_by: user.name, updated_at: new Date().toISOString()
      }).eq('id', existing.id);
    } else {
      await supabase.from('weekly_stats').insert({
        group_id: groupId, group_name: groupName, year: wsYear, month: wsMonth,
        week, value: numVal, updated_by: user.name
      });
    }
    await loadWeeklyStats(wsYear, wsMonth);
    setWsEditing(null);
    setWsSaving(false);
  };

  // Total juga manual — pakai week=6 sebagai kolom total
  const getGroupTotal = (groupId) => {
    const entry = weeklyStats.find(w => w.group_id === groupId && w.week === 6);
    return entry ? parseFloat(entry.value) || 0 : 0;
  };

  const getMemberStats = () => {
    const memberMap = {};
    weeklyStats.forEach(w => {
      if (!w.updated_by) return;
      if (!memberMap[w.updated_by]) memberMap[w.updated_by] = { name: w.updated_by, entries: 0, totalValue: 0, groups: new Set() };
      memberMap[w.updated_by].entries++;
      memberMap[w.updated_by].totalValue += parseFloat(w.value) || 0;
      if (w.group_id) memberMap[w.updated_by].groups.add(w.group_id);
    });
    return Object.values(memberMap).map(m => ({ ...m, groups: m.groups.size })).sort((a, b) => b.totalValue - a.totalValue);
  };

  const MONTH_NAMES = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  // Load status cycle posting_tracker untuk grup tertentu (hari ini)
  // Return: { 1: {g1, g2, v}, 2: ..., 3: ..., 4: ... }
  const loadCycleStatus = async (groupIds) => {
    if (!groupIds || groupIds.length === 0) { setTqCycleStatus({}); return; }
    const today = localDateString();
    const { data } = await supabase
      .from('posting_tracker')
      .select('group_id, cycle, gambar1_link, gambar2_link, video_link, is_complete')
      .in('group_id', groupIds)
      .eq('period', today);
    const map = {};
    for (const gid of groupIds) {
      map[gid] = { 1:{g1:false,g2:false,v:false}, 2:{g1:false,g2:false,v:false}, 3:{g1:false,g2:false,v:false}, 4:{g1:false,g2:false,v:false} };
    }
    for (const r of data || []) {
      if (!map[r.group_id] || !map[r.group_id][r.cycle]) continue;
      map[r.group_id][r.cycle].g1 = !!r.gambar1_link;
      map[r.group_id][r.cycle].g2 = !!r.gambar2_link;
      map[r.group_id][r.cycle].v  = !!r.video_link;
    }
    setTqCycleStatus(map);
  };

  // Task queue functions (admin only)
  const loadTaskQueue = async () => {
    const { data } = await supabase.from('task_queue').select('*').order('created_at', { ascending: false }).limit(200);
    setTaskQueue(data || []);
  };

  const createTasks = async () => {
    if (!tqMember.trim()) { setTqMsg('Nama member wajib diisi!'); return; }
    if (tqGroups.length === 0) { setTqMsg('Pilih minimal 1 grup!'); return; }
    if (!tqAccountId) { setTqMsg('Pilih akun bot grup terlebih dahulu!'); return; }

    const selectedAcc = botAccounts.find(a => a.account_id === tqAccountId);

    const targetCycleVal = tqCycle === 'auto' ? null : Number(tqCycle);
    const tasks = tqGroups.map(gid => {
      const grp = groups.find(g => g.id === gid);
      return {
        member_name: tqMember.trim(),
        group_id: gid,
        group_name: grp?.name || '',
        group_url: grp?.url || '',
        club: grp?.club || '',
        task_type: tqType,
        status: 'pending',
        account_id: tqAccountId,
        account_name: selectedAcc?.account_name || '',
        target_cycle: targetCycleVal,
      };
    });

    const { error } = await supabase.from('task_queue').insert(tasks);
    if (error) { setTqMsg('Error: ' + error.message); }
    else {
      setTqMsg(`${tasks.length} tugas dibuat untuk ${tqMember}!`);
      setTqGroups([]); setTqSelectAll(false);
      loadTaskQueue();
    }
  };

  // ============================================================
  // BULK GENERATE TODAY'S TASKS — auto-distribute pair (cycle 1+2 / 3+4)
  // 1 klik bikin 4 cycle × N grup ter-mapping. Skip yang udah ada hari ini.
  // ============================================================
  const previewBulkTasks = async () => {
    if (!tqMember.trim()) { setTqMsg('Pilih member dulu sebelum Bulk Generate!'); return; }
    setTqBulkBusy(true);
    try {
      // 1. Existing tasks hari ini — skip biar gak duplikat
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const { data: existingTasks, error: errEx } = await supabase
        .from('task_queue')
        .select('group_id, target_cycle, status')
        .gte('created_at', todayStart.toISOString());
      if (errEx) throw errEx;
      const existingSet = new Set(
        (existingTasks || [])
          .filter(t => t.status !== 'failed')
          .map(t => `${t.group_id}|${t.target_cycle}`)
      );

      const accMap = Object.fromEntries(botAccounts.map(a => [a.account_id, a]));
      const tasks = [];
      const skipped = []; // sudah ada hari ini
      const unmapped = []; // grup belum ada primary_account_id

      for (const grp of groups) {
        if (!grp.primary_account_id) {
          unmapped.push({ id: grp.id, name: grp.name, reason: 'belum di-setup primary account' });
          continue;
        }
        const primary = accMap[grp.primary_account_id];
        if (!primary) {
          unmapped.push({ id: grp.id, name: grp.name, reason: `account_id ${grp.primary_account_id} tidak ada di bot_accounts` });
          continue;
        }
        const partner = primary.partner_account_id ? accMap[primary.partner_account_id] : null;

        for (let cycle = 1; cycle <= 4; cycle++) {
          const key = `${grp.id}|${cycle}`;
          if (existingSet.has(key)) {
            skipped.push({ groupName: grp.name, cycle });
            continue;
          }
          const useAcc = (cycle <= 2 || !partner) ? primary : partner;
          tasks.push({
            member_name: tqMember.trim(),
            group_id: grp.id,
            group_name: grp.name,
            group_url: grp.url,
            club: grp.club,
            task_type: tqType,
            status: 'pending',
            account_id: useAcc.account_id,
            account_name: useAcc.account_name,
            target_cycle: cycle,
          });
        }
      }

      setTqBulkPreview({ tasks, skipped, unmapped });
    } catch (e) {
      setTqMsg('Bulk preview error: ' + (e.message || e));
    }
    setTqBulkBusy(false);
  };

  const confirmBulkTasks = async () => {
    if (!tqBulkPreview || tqBulkPreview.tasks.length === 0) return;
    setTqBulkBusy(true);
    const { error } = await supabase.from('task_queue').insert(tqBulkPreview.tasks);
    if (error) {
      setTqMsg('Bulk insert error: ' + error.message);
    } else {
      setTqMsg(`✅ Bulk: ${tqBulkPreview.tasks.length} tugas dibuat (skip ${tqBulkPreview.skipped.length} existing, ${tqBulkPreview.unmapped.length} grup belum di-setup)`);
      setTqBulkPreview(null);
      loadTaskQueue();
    }
    setTqBulkBusy(false);
  };

  const deleteTask = async (id) => {
    await supabase.from('task_queue').delete().eq('id', id);
    loadTaskQueue();
  };

  const clearDoneTasks = async () => {
    if (!confirm('Hapus semua tugas yang sudah selesai?')) return;
    await supabase.from('task_queue').delete().eq('status', 'done');
    loadTaskQueue();
  };

  const toggleGroupSelect = (gid) => {
    setTqGroups(prev => prev.includes(gid) ? prev.filter(id => id !== gid) : [...prev, gid]);
  };

  const toggleSelectAll = () => {
    if (tqSelectAll) { setTqGroups([]); } else { setTqGroups(groups.map(g => g.id)); }
    setTqSelectAll(!tqSelectAll);
  };

  // Posting tracker functions
  const loadPostTracker = async (period) => {
    const { data } = await supabase.from('posting_tracker').select('*').eq('period', period).order('created_at');
    setPostTracker(data || []);
  };

  // Load 30 hari terakhir posting_tracker untuk streak, leaderboard, history
  const loadPostTrackerHistory = async () => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const startDate = localDateString(start);
    const { data } = await supabase.from('posting_tracker').select('*').gte('period', startDate).order('period', { ascending: false });
    setPostTrackerHistory(data || []);
  };

  const loadTargetNotes = async () => {
    const { data } = await supabase.from('target_notes').select('*').order('created_at', { ascending: false }).limit(100);
    setTargetNotes(data || []);
  };

  const saveTargetNote = async (period) => {
    if (!noteReason.trim()) { setNoteMsg('Alasan wajib diisi'); return; }
    const { error } = await supabase.from('target_notes').upsert({
      user_id: user.id,
      user_name: user.name,
      period,
      reason: noteReason.trim(),
    }, { onConflict: 'user_id,period' });
    if (error) setNoteMsg('Error: ' + error.message);
    else { setNoteMsg('Catatan tersimpan!'); setNoteReason(''); loadTargetNotes(); }
  };

  const exportProgressCSV = () => {
    const members = users.filter(u => u.role === 'member');
    const periods = [...new Set(postTrackerHistory.map(p => p.period))].sort().reverse();
    const headers = ['Tanggal', 'Member', 'Target', 'Tercapai', 'Persentase', 'Kategori'];
    const rows = [headers];
    for (const period of periods) {
      for (const m of members) {
        const target = m.daily_target || 0;
        const count = countGroupsForDate(m.name, period, postTrackerHistory);
        const pct = target > 0 ? Math.round((count / target) * 100) : 0;
        const cat = getTargetCategory(count, target);
        rows.push([period, m.name, target, count, pct + '%', cat.label]);
      }
    }
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `progress_target_${localDateString()}.csv`;
    a.click();
  };

  const submitPostLink = async () => {
    if (!ptLink.trim() || !ptGroup) { setPtMsg('Link dan grup wajib diisi!'); return; }

    const linkTrimmed = ptLink.trim();
    const fingerprint = normalizeContentUrl(linkTrimmed);

    // ── CEK 1: Exact URL match di posting_tracker (semua tanggal) ──
    const { data: allMatches } = await supabase
      .from('posting_tracker')
      .select('group_name, cycle, period, gambar1_link, gambar2_link, video_link')
      .or(`gambar1_link.eq.${linkTrimmed},gambar2_link.eq.${linkTrimmed},video_link.eq.${linkTrimmed}`)
      .limit(1);

    if (allMatches && allMatches.length > 0) {
      const d = allMatches[0];
      setPtMsg(`Link sudah pernah dipakai di "${d.group_name}" Siklus ${d.cycle} (${d.period}). Gunakan link yang berbeda!`);
      return;
    }

    // ── CEK 2: Fingerprint match di content_registry ──
    // Konten yang sama TIDAK BOLEH dipakai lagi — di grup mana pun, siklus mana pun.
    // Setiap submit harus konten BARU yang unik.
    if (fingerprint) {
      const { data: fpMatch } = await supabase
        .from('content_registry')
        .select('user_name, group_name, original_url, created_at')
        .eq('fingerprint', fingerprint)
        .limit(1);

      if (fpMatch && fpMatch.length > 0) {
        const d = fpMatch[0];
        if (d.user_name !== user.name) {
          setPtMsg(`DITOLAK: Konten ini sudah dipakai oleh "${d.user_name}" di "${d.group_name}". Tidak boleh menggunakan konten yang sama dengan member lain!`);
        } else {
          setPtMsg(`DITOLAK: Kamu sudah menggunakan konten ini di "${d.group_name}". Konten TIDAK BOLEH di-submit ulang (baik grup sama maupun grup berbeda, siklus mana pun).`);
        }
        return;
      }
    }

    // ── CEK 3: pHash — deteksi gambar SAMA meski di-save & upload ulang ──
    // BLOKIR semua duplikat, tidak peduli milik siapa (konten harus 100% unik)
    setPtMsg('Memeriksa keaslian konten...');
    try {
      const res = await fetch('/api/check-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: linkTrimmed, userName: user.name }),
      });
      const result = await res.json();
      if (result.isDuplicate && result.match) {
        const who = result.isOtherMember ? `member "${result.match.owner}"` : 'kamu sendiri';
        setPtMsg(`DITOLAK: Konten mirip ${result.similarity}% dengan posting ${who} di "${result.match.group}". Setiap posting harus konten unik!`);
        return;
      }
    } catch (e) {
      console.warn('pHash check failed:', e.message);
    }

    const grp = groups.find(g => g.id === ptGroup);
    // Cari existing entry untuk user + grup + cycle + period
    const existing = postTracker.find(p => p.user_id === user.id && p.group_id === ptGroup && p.cycle === ptCycle && p.period === ptPeriod);

    if (existing) {
      // Update field yang sesuai
      const updates = {};
      updates[`${ptType}_link`] = linkTrimmed;
      updates[`${ptType}_at`] = new Date().toISOString();
      const g1 = ptType === 'gambar1' ? linkTrimmed : existing.gambar1_link;
      const g2 = ptType === 'gambar2' ? linkTrimmed : existing.gambar2_link;
      const v = ptType === 'video' ? linkTrimmed : existing.video_link;
      updates.is_complete = !!(g1 && g2 && v);
      await supabase.from('posting_tracker').update(updates).eq('id', existing.id);
    } else {
      const entry = {
        user_id: user.id, user_name: user.name, group_id: ptGroup, group_name: grp?.name || '',
        cycle: ptCycle, period: ptPeriod,
        gambar1_link: ptType === 'gambar1' ? linkTrimmed : null,
        gambar2_link: ptType === 'gambar2' ? linkTrimmed : null,
        video_link: ptType === 'video' ? linkTrimmed : null,
        gambar1_at: ptType === 'gambar1' ? new Date().toISOString() : null,
        gambar2_at: ptType === 'gambar2' ? new Date().toISOString() : null,
        video_at: ptType === 'video' ? new Date().toISOString() : null,
        is_complete: false,
      };
      await supabase.from('posting_tracker').insert(entry);
    }

    // ── Simpan fingerprint ke content_registry ──
    if (fingerprint) {
      await supabase.from('content_registry').insert({
        fingerprint,
        original_url: linkTrimmed,
        user_id: user.id,
        user_name: user.name,
        group_id: ptGroup,
        group_name: grp?.name || '',
        content_type: ptType === 'video' ? 'video' : 'gambar',
        source: 'member',
      });
    }

    // ── Simpan pHash ke image_hashes (untuk deteksi visual duplikat) ──
    // Sekarang juga untuk video (extract og:image dari FB post URL)
    try {
      const res = await fetch('/api/check-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: linkTrimmed, userName: user.name }),
      });
      const result = await res.json();
      if (result.hash) {
        await supabase.from('image_hashes').insert({
          phash: result.hash,
          source_url: linkTrimmed,
          user_name: user.name,
          group_id: ptGroup,
          group_name: grp?.name || '',
          club: grp?.club || '',
          content_type: ptType === 'video' ? 'video' : 'gambar',
          source: 'member',
        });
      }
    } catch (e) { /* silent — hash sudah di-check sebelumnya */ }

    setPtLink(''); setPtMsg('Link berhasil disimpan!');
    loadPostTracker(ptPeriod);
  };

  const deletePostEntry = async (id) => {
    if (!confirm('Hapus entry ini?')) return;
    await supabase.from('posting_tracker').delete().eq('id', id);
    loadPostTracker(ptPeriod);
  };

  // Hapus 1 slot spesifik (gambar1, gambar2, atau video) dari entry yang dipilih
  // Pakai pilihan ptGroup + ptCycle + ptType + ptPeriod saat ini.
  // Admin: boleh hapus entry siapapun. Member: hanya entry sendiri.
  const deletePostField = async () => {
    if (!ptGroup) { setPtMsg('Pilih grup dulu!'); return; }
    const isAdminUser = user.role === 'admin';
    const fieldMapLookup = { gambar1: 'gambar1_link', gambar2: 'gambar2_link', video: 'video_link' };
    const lookupField = fieldMapLookup[ptType];

    // Cari entry: admin = cari slot yang sudah terisi (siapapun); member = cari entry sendiri
    const entry = isAdminUser
      ? postTracker.find(p =>
          p.group_id === ptGroup &&
          p.cycle === ptCycle &&
          p.period === ptPeriod &&
          p[lookupField]
        )
      : postTracker.find(p =>
          p.user_id === user.id &&
          p.group_id === ptGroup &&
          p.cycle === ptCycle &&
          p.period === ptPeriod
        );
    if (!entry) { setPtMsg('Tidak ada entry untuk dihapus'); return; }

    const fieldMap = { gambar1: 'gambar1_link', gambar2: 'gambar2_link', video: 'video_link' };
    const field = fieldMap[ptType];
    if (!entry[field]) { setPtMsg(`${ptType.toUpperCase()} sudah kosong`); return; }

    const ownerInfo = isAdminUser && entry.user_name !== user.name ? ` milik ${entry.user_name}` : '';
    if (!confirm(`Hapus ${ptType.toUpperCase()}${ownerInfo} di grup "${entry.group_name}" siklus ${ptCycle}?`)) return;

    // Kalau semua 3 field jadi kosong setelah hapus → hapus seluruh row
    const willBeEmpty =
      (field === 'gambar1_link' ? !entry.gambar2_link && !entry.video_link :
       field === 'gambar2_link' ? !entry.gambar1_link && !entry.video_link :
                                  !entry.gambar1_link && !entry.gambar2_link);

    if (willBeEmpty) {
      await supabase.from('posting_tracker').delete().eq('id', entry.id);
    } else {
      // Update: set field jadi null + recompute is_complete
      const updates = { [field]: null };
      const g1 = field === 'gambar1_link' ? null : entry.gambar1_link;
      const g2 = field === 'gambar2_link' ? null : entry.gambar2_link;
      const v = field === 'video_link' ? null : entry.video_link;
      updates.is_complete = !!(g1 && g2 && v);
      await supabase.from('posting_tracker').update(updates).eq('id', entry.id);
    }

    setPtLink('');
    setPtMsg(`${ptType.toUpperCase()}${ownerInfo} berhasil dihapus`);
    loadPostTracker(ptPeriod);
  };

  // Ganti password — verifikasi password lama, lalu update ke Supabase
  const changePassword = async () => {
    setPwMsg('');
    if (!pwOld || !pwNew || !pwConfirm) { setPwMsg('Semua field wajib diisi'); return; }
    if (pwNew.length < 4) { setPwMsg('Password baru minimal 4 karakter'); return; }
    if (pwNew !== pwConfirm) { setPwMsg('Konfirmasi password tidak cocok'); return; }
    if (pwOld === pwNew) { setPwMsg('Password baru harus beda dari yang lama'); return; }

    // Verify password lama dual-mode (cek hash dulu, fallback plaintext)
    const { data: userRow } = await supabase
      .from('users')
      .select('id, password, password_hash')
      .eq('id', user.id)
      .single();
    if (!userRow) { setPwMsg('User tidak ditemukan'); return; }

    let oldOk = false;
    if (userRow.password_hash) {
      try { oldOk = await bcrypt.compare(pwOld, userRow.password_hash); } catch (e) { /* ignore */ }
    }
    if (!oldOk && userRow.password === pwOld) oldOk = true; // fallback plaintext
    if (!oldOk) { setPwMsg('Password lama salah'); return; }

    // Hash password baru, update ke DB (clear plaintext sekalian)
    const newHash = await bcrypt.hash(pwNew, 10);
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: newHash,
        password: null, // clear plaintext biar gak dual-storage
        password_migrated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (error) { setPwMsg('Gagal update: ' + error.message); return; }

    setPwMsg('Password berhasil diubah!');
    setTimeout(() => {
      setPwModal(false);
      setPwOld(''); setPwNew(''); setPwConfirm(''); setPwMsg('');
    }, 1500);
  };

  // Audit historis — loop semua slot dengan status 'pending' → panggil analyzer → update.
  // Aman: sequential dengan delay 4 detik biar nggak bikin Facebook rate-limit IP Vercel.
  // Bisa di-stop kapan aja lewat tombol Stop. Tidak ngaruh ke akun bot (beda flow).
  // Param reAuditAll: true = reset semua status non-kosong ke pending dulu (re-audit semua)
  const runContentAudit = async (reAuditAll = false) => {
    if (auditRunning) return;
    const msg = reAuditAll
      ? 'Re-audit SEMUA konten? Status lama (ok/suspect/not_football/error) akan di-reset ke pending lalu dianalisa ulang dengan algoritma baru. Proses bisa 30-45 menit.'
      : 'Mulai audit konten? Proses ini akan mengecek semua slot yang masih "pending" dan memerlukan waktu ~30-45 menit. Kamu bisa stop kapan saja.';
    if (!confirm(msg)) return;

    setAuditRunning(true);
    setAuditStopRequested(false);

    // Kalau re-audit semua, reset dulu status non-kosong ke pending
    if (reAuditAll) {
      setAuditMsg('Reset status semua slot ke pending...');
      // Reset gambar1
      await supabase.from('posting_tracker').update({ gambar1_status: 'pending' }).not('gambar1_link', 'is', null);
      await supabase.from('posting_tracker').update({ gambar2_status: 'pending' }).not('gambar2_link', 'is', null);
      await supabase.from('posting_tracker').update({ video_status: 'pending' }).not('video_link', 'is', null);
    }

    setAuditMsg('Memuat daftar row pending dari database...');

    // Ambil semua row yang punya slot berstatus pending
    const { data: rows, error } = await supabase
      .from('posting_tracker')
      .select('id, group_name, cycle, gambar1_link, gambar2_link, video_link, gambar1_status, gambar2_status, video_status')
      .or('gambar1_status.eq.pending,gambar2_status.eq.pending,video_status.eq.pending');

    if (error) {
      setAuditMsg(`Gagal load: ${error.message}`);
      setAuditRunning(false);
      return;
    }

    // Kumpulin daftar task: 1 task = 1 slot (1 row bisa punya 1-3 task)
    const tasks = [];
    for (const r of rows || []) {
      if (r.gambar1_link && r.gambar1_status === 'pending') tasks.push({ id: r.id, field: 'gambar1', url: r.gambar1_link, label: `${r.group_name} S${r.cycle} G1` });
      if (r.gambar2_link && r.gambar2_status === 'pending') tasks.push({ id: r.id, field: 'gambar2', url: r.gambar2_link, label: `${r.group_name} S${r.cycle} G2` });
      if (r.video_link && r.video_status === 'pending') tasks.push({ id: r.id, field: 'video', url: r.video_link, label: `${r.group_name} S${r.cycle} V` });
    }

    if (tasks.length === 0) {
      setAuditMsg('Tidak ada slot pending — semua sudah diaudit!');
      setAuditRunning(false);
      return;
    }

    const counters = { done: 0, total: tasks.length, ok: 0, suspect: 0, notFootball: 0, error: 0 };
    setAuditProgress({ ...counters });
    setAuditMsg(`Mulai audit ${tasks.length} slot...`);

    const DELAY_MS = 4000; // 4 detik antar request biar nggak rate limit

    for (let i = 0; i < tasks.length; i++) {
      if (auditStopRequested) {
        setAuditMsg(`Dihentikan oleh user di posisi ${i}/${tasks.length}`);
        break;
      }
      const t = tasks[i];
      setAuditMsg(`[${i + 1}/${tasks.length}] ${t.label}`);

      try {
        const res = await fetch('/api/analyze-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: t.id, field: t.field, url: t.url }),
        });
        const result = await res.json();
        if (result.status === 'ok') counters.ok++;
        else if (result.status === 'suspect') counters.suspect++;
        else if (result.status === 'not_football') counters.notFootball++;
        else counters.error++;
      } catch (e) {
        counters.error++;
      }

      counters.done = i + 1;
      setAuditProgress({ ...counters });

      // Refresh tampilan tabel tiap 10 task biar user lihat progress visual di icon
      if ((i + 1) % 10 === 0) loadPostTracker(ptPeriod);

      // Delay sebelum request berikutnya
      if (i < tasks.length - 1 && !auditStopRequested) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    setAuditMsg(`Selesai! ${counters.done}/${counters.total} di-audit`);
    setAuditRunning(false);
    loadPostTracker(ptPeriod); // refresh final
  };

  // Load bot health status dari API /api/bot-heartbeat GET
  const loadBotHealth = async () => {
    setBotHealthLoading(true);
    try {
      const res = await fetch('/api/bot-heartbeat');
      const data = await res.json();
      setBotHealth(data.workers || []);
    } catch (e) {
      // silent
    }
    setBotHealthLoading(false);
  };

  // Auto-refresh bot health tiap 30 detik saat di tab Overview (admin only)
  useEffect(() => {
    if (tab !== 'overview') return;
    if (!user || user.role !== 'admin') return;
    loadBotHealth();
    const id = setInterval(loadBotHealth, 30000);
    return () => clearInterval(id);
  }, [tab, user]);

  // ========== NOTIFICATIONS ==========
  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/notifications?user_id=${user.id}&limit=30`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setNotifUnread(data.unread || 0);
    } catch (e) { /* silent */ }
  };

  // Auto-poll notifications tiap 20 detik + saat user login
  useEffect(() => {
    if (!user?.id) return;
    loadNotifications();
    const id = setInterval(loadNotifications, 20000);
    return () => clearInterval(id);
  }, [user]);

  const markNotificationRead = async (notificationId) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId }),
      });
      loadNotifications();
    } catch (e) { /* silent */ }
  };

  const markAllNotificationsRead = async () => {
    if (!user?.id) return;
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all_for_user_id: user.id }),
      });
      loadNotifications();
    } catch (e) { /* silent */ }
  };

  const sendBroadcast = async () => {
    setBroadcastMsg('');
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      setBroadcastMsg('Judul dan isi pesan wajib');
      return;
    }
    try {
      const targetUser = broadcastTarget === 'all' ? null : users.find(u => u.id === broadcastTarget);
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_user_id: user.id,
          from_user_name: user.name,
          to_user_id: targetUser ? targetUser.id : null,
          to_user_name: targetUser ? targetUser.name : null,
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          type: broadcastType,
        }),
      });
      const data = await res.json();
      if (data.error) { setBroadcastMsg('Gagal: ' + data.error); return; }
      setBroadcastMsg('Pesan berhasil dikirim!');
      setTimeout(() => {
        setBroadcastOpen(false);
        setBroadcastTitle(''); setBroadcastMessage(''); setBroadcastMsg('');
        loadNotifications();
      }, 1200);
    } catch (e) {
      setBroadcastMsg('Error: ' + e.message);
    }
  };

  // ========== CHAT ==========
  const loadChatMessages = async () => {
    if (!user?.id) return;
    try {
      let url = '/api/chat?';
      if (chatMode === 'global') url += 'scope=global&limit=100';
      else if (chatMode === 'dm' && chatDmPartner) url += `scope=dm&user1=${user.id}&user2=${chatDmPartner.id}&limit=100`;
      else return;
      const res = await fetch(url);
      const data = await res.json();
      setChatMessages(data.messages || []);
    } catch (e) { /* silent */ }
  };

  const loadDmList = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/chat?scope=dm_list&user_id=${user.id}`);
      const data = await res.json();
      setChatDmList(data.conversations || []);
    } catch (e) { /* silent */ }
  };

  // Auto-refresh chat saat modal terbuka (polling 5 detik)
  useEffect(() => {
    if (!chatOpen || !user?.id) return;
    loadChatMessages();
    loadDmList();
    const id = setInterval(() => {
      loadChatMessages();
      loadDmList();
    }, 5000);
    return () => clearInterval(id);
  }, [chatOpen, chatMode, chatDmPartner, user]);

  const sendChatMessage = async (extras = {}) => {
    if (!user?.id) return;
    // Harus ada message atau attachment
    if (!chatInput.trim() && !extras.attachment_url) return;
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_user_id: user.id,
          from_user_name: user.name,
          from_user_role: user.role,
          to_user_id: chatMode === 'dm' && chatDmPartner ? chatDmPartner.id : null,
          to_user_name: chatMode === 'dm' && chatDmPartner ? chatDmPartner.name : null,
          message: chatInput.trim() || (extras.attachment_type === 'image' ? '📷 Foto' : extras.attachment_type === 'audio' ? '🎤 Pesan suara' : ''),
          view_once: chatViewOnceMode,
          ...extras,
        }),
      });
      setChatInput('');
      setChatViewOnceMode(false); // reset setelah kirim
      loadChatMessages();
    } catch (e) { /* silent */ }
  };

  // Upload file ke Supabase Storage bucket 'chat-media'
  // Return URL publik, atau null kalau gagal
  const uploadChatFile = async (file, type) => {
    try {
      setChatUploading(true);
      const ext = file.name.split('.').pop().toLowerCase();
      const path = `${type}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('chat-media').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) {
        alert('Upload gagal: ' + error.message + '\n\nPastikan bucket "chat-media" sudah dibuat di Supabase Storage.');
        setChatUploading(false);
        return null;
      }
      const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(path);
      setChatUploading(false);
      return urlData.publicUrl;
    } catch (e) {
      alert('Error upload: ' + e.message);
      setChatUploading(false);
      return null;
    }
  };

  // Set pending attachment (preview dulu, belum upload)
  const setPendingImage = (file, fileName) => {
    if (file.size > 5 * 1024 * 1024) { alert('Gambar maksimal 5 MB'); return; }
    // Revoke previous preview URL kalau ada
    if (chatPendingAttachment?.previewUrl) {
      URL.revokeObjectURL(chatPendingAttachment.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setChatPendingAttachment({
      file,
      previewUrl,
      type: 'image',
      name: fileName || file.name,
      size: file.size,
    });
  };

  // Handler untuk pilih file gambar via file picker — simpan ke pending, JANGAN langsung kirim
  const onChatImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('File harus gambar'); return; }
    setPendingImage(file, file.name);
    e.target.value = ''; // reset input
  };

  // Handler Ctrl+V paste — deteksi image di clipboard, simpan ke pending
  const onChatPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault(); // cegah paste text default
        const blob = item.getAsFile();
        if (!blob) continue;
        const ext = blob.type.split('/')[1] || 'png';
        const fileName = `pasted-${Date.now()}.${ext}`;
        const file = new File([blob], fileName, { type: blob.type });
        setPendingImage(file, fileName);
        return;
      }
    }
    // Kalau bukan image, biarkan paste default (text)
  };

  // Cancel pending attachment
  const cancelPendingAttachment = () => {
    if (chatPendingAttachment?.previewUrl) {
      URL.revokeObjectURL(chatPendingAttachment.previewUrl);
    }
    setChatPendingAttachment(null);
  };

  // Kirim pending attachment (upload lalu send dengan caption optional dari chatInput)
  const sendPendingAttachment = async () => {
    if (!chatPendingAttachment) return;
    const { file, type, name, size } = chatPendingAttachment;
    const url = await uploadChatFile(file, type === 'image' ? 'images' : 'audio');
    if (!url) return;
    // sendChatMessage akan ambil chatInput sebagai message (caption)
    // Kalau chatInput kosong, placeholder '📷 Foto' akan dipakai otomatis
    await sendChatMessage({
      attachment_url: url,
      attachment_type: type,
      attachment_name: name,
      attachment_size: size,
    });
    // cleanup preview URL
    if (chatPendingAttachment.previewUrl) {
      URL.revokeObjectURL(chatPendingAttachment.previewUrl);
    }
    setChatPendingAttachment(null);
  };

  // Handler untuk record voice message
  const startVoiceRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chatMediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        if (blob.size < 1000) { alert('Rekaman terlalu pendek'); return; }
        const durationSec = chatRecordSec;
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        const url = await uploadChatFile(file, 'audio');
        if (!url) return;
        await sendChatMessage({
          attachment_url: url,
          attachment_type: 'audio',
          attachment_name: file.name,
          attachment_size: file.size,
          attachment_duration: durationSec,
        });
      };
      mediaRecorder.start();
      setChatRecording(true);
      setChatRecordSec(0);
      chatRecordTimerRef.current = setInterval(() => {
        setChatRecordSec(prev => {
          if (prev >= 60) { stopVoiceRecord(); return 60; } // max 60 detik
          return prev + 1;
        });
      }, 1000);
    } catch (e) {
      alert('Gagal akses mikrofon: ' + e.message);
    }
  };

  const stopVoiceRecord = () => {
    if (chatMediaRecorderRef.current && chatMediaRecorderRef.current.state === 'recording') {
      chatMediaRecorderRef.current.stop();
    }
    if (chatRecordTimerRef.current) {
      clearInterval(chatRecordTimerRef.current);
      chatRecordTimerRef.current = null;
    }
    setChatRecording(false);
  };

  const cancelVoiceRecord = () => {
    if (chatMediaRecorderRef.current && chatMediaRecorderRef.current.state === 'recording') {
      chatMediaRecorderRef.current.onstop = null; // skip upload
      chatMediaRecorderRef.current.stop();
    }
    if (chatRecordTimerRef.current) {
      clearInterval(chatRecordTimerRef.current);
      chatRecordTimerRef.current = null;
    }
    setChatRecording(false);
    setChatRecordSec(0);
  };

  // Hitung chat unread count (DM unread + global messages baru)
  const loadChatUnread = async () => {
    if (!user?.id) return;
    try {
      // 1. DM unread: messages to me that are unread
      const { data: dmData } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('to_user_id', user.id)
        .is('read_at', null)
        .eq('deleted', false);
      const dmCount = dmData?.length || 0;

      // Alternative count query
      const { count: dmUnreadCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', user.id)
        .is('read_at', null)
        .eq('deleted', false);

      // 2. Global unread: messages after last_seen timestamp from localStorage
      const lastSeen = localStorage.getItem(`chat-lastseen-global-${user.id}`);
      let globalCount = 0;
      if (lastSeen) {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .is('to_user_id', null)
          .gt('created_at', lastSeen)
          .neq('from_user_id', user.id)
          .eq('deleted', false);
        globalCount = count || 0;
      }

      setChatUnread((dmUnreadCount || 0) + globalCount);
    } catch (e) { /* silent */ }
  };

  // Mark global chat as "seen" — update localStorage timestamp
  const markGlobalChatSeen = () => {
    if (!user?.id) return;
    localStorage.setItem(`chat-lastseen-global-${user.id}`, new Date().toISOString());
    loadChatUnread();
  };

  // Auto-poll chat unread tiap 10 detik
  useEffect(() => {
    if (!user?.id) return;
    loadChatUnread();
    const id = setInterval(loadChatUnread, 10000);
    return () => clearInterval(id);
  }, [user]);

  // Saat buka chat + mode global → mark as seen
  useEffect(() => {
    if (chatOpen && chatMode === 'global') {
      markGlobalChatSeen();
    }
  }, [chatOpen, chatMode]);

  // Update tab title + favicon badge dengan unread count (seperti Discord/WhatsApp Web)
  useEffect(() => {
    const total = (notifUnread || 0) + (chatUnread || 0);
    document.title = total > 0 ? `(${total}) Football Bot Dashboard` : 'Football Bot Dashboard';

    // Draw favicon dinamis dengan badge angka
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Base: bola sepak dengan background cyan (match theme Dark Crystal Ice)
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, 2 * Math.PI);
    ctx.fill();
    // Pattern bola (segi enam hitam)
    ctx.fillStyle = '#020617';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚽', 32, 32);

    // Badge angka kalau ada unread
    if (total > 0) {
      const displayNum = total > 99 ? '99+' : String(total);
      // Red circle di pojok kanan atas
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(48, 16, 16, 0, 2 * Math.PI);
      ctx.fill();
      // White border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Angka putih
      ctx.fillStyle = '#ffffff';
      ctx.font = displayNum.length > 2 ? 'bold 14px sans-serif' : 'bold 20px sans-serif';
      ctx.fillText(displayNum, 48, 17);
    }

    // Set favicon — hapus semua existing icon link, buat yang baru
    const dataUrl = canvas.toDataURL('image/png');
    // Hapus semua link icon yang ada
    document.querySelectorAll("link[rel*='icon'], link[rel='shortcut icon']").forEach(el => el.remove());
    // Buat link baru dengan multiple rel untuk kompatibilitas semua browser
    ['icon', 'shortcut icon'].forEach(rel => {
      const link = document.createElement('link');
      link.rel = rel;
      link.type = 'image/png';
      link.href = dataUrl;
      document.head.appendChild(link);
    });
  }, [notifUnread, chatUnread]);

  // Keyboard Esc untuk tutup lightbox
  useEffect(() => {
    if (!chatLightbox) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setChatLightbox(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [chatLightbox]);

  // ========== SOUND NOTIFICATION (HTML5 Audio — reliable di Firefox) ==========
  // Pre-load Audio elements sekali saja
  const chatAudioRef = useRef(null);
  const notifAudioRef = useRef(null);

  useEffect(() => {
    // Load preferensi
    const saved = localStorage.getItem('fb-dash-sound-enabled');
    if (saved !== null) setSoundEnabled(saved === 'true');

    // FORCE cosmic-fusion untuk semua user (single theme system).
    // Ignore localStorage — kalau user lama punya tema lain saved, tetep pake cosmic-fusion.
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'cosmic-fusion');
    }
    // Hapus old localStorage entry biar gak nyangkut
    try { localStorage.removeItem('fb-dash-theme'); } catch (e) { /* silent */ }

    // Pre-load audio files
    if (typeof Audio !== 'undefined') {
      chatAudioRef.current = new Audio('/sounds/chat-beep.wav');
      chatAudioRef.current.volume = 0.5;
      chatAudioRef.current.preload = 'auto';

      notifAudioRef.current = new Audio('/sounds/notif-beep.wav');
      notifAudioRef.current.volume = 0.5;
      notifAudioRef.current.preload = 'auto';
    }
  }, []);

  // Play beep via HTML5 Audio — lebih reliable daripada Web Audio API
  const playBeep = (type = 'chat') => {
    if (!soundEnabled) return;
    const audio = type === 'notif' ? notifAudioRef.current : chatAudioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0; // rewind biar bisa play berkali-kali cepat
      const promise = audio.play();
      if (promise && promise.catch) {
        promise.catch(err => {
          console.warn('[Sound] Play blocked:', err.message, '— butuh user interaction');
        });
      }
    } catch (e) {
      console.warn('[Sound] Error:', e.message);
    }
  };

  // Detect unread increase → play beep
  // prevRef === null artinya first load (init) — cuma set baseline, jangan beep
  useEffect(() => {
    if (prevChatUnreadRef.current === null) {
      prevChatUnreadRef.current = chatUnread;
      return;
    }
    if (chatUnread > prevChatUnreadRef.current) {
      playBeep('chat');
    }
    prevChatUnreadRef.current = chatUnread;
  }, [chatUnread]);

  useEffect(() => {
    if (prevNotifUnreadRef.current === null) {
      prevNotifUnreadRef.current = notifUnread;
      return;
    }
    if (notifUnread > prevNotifUnreadRef.current) {
      playBeep('notif');
    }
    prevNotifUnreadRef.current = notifUnread;
  }, [notifUnread]);

  // ========== USER PRESENCE (online/offline) ==========
  // Load appear offline preference saat mount
  useEffect(() => {
    if (!user?.id) return;
    const saved = localStorage.getItem(`fb-dash-appear-offline-${user.id}`);
    if (saved === 'true') setAppearOffline(true);
  }, [user]);

  // Auto-update last_active_at tiap 30 detik (kecuali appearOffline = true)
  useEffect(() => {
    if (!user?.id) return;
    const updatePresence = async () => {
      if (appearOffline) return;
      try {
        await supabase
          .from('users')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', user.id);
      } catch (e) { /* silent */ }
    };
    updatePresence(); // langsung update saat mount
    const id = setInterval(updatePresence, 30000);
    return () => clearInterval(id);
  }, [user, appearOffline]);

  // Poll online status semua user tiap 20 detik
  const loadOnlineUsers = async () => {
    try {
      const { data } = await supabase.from('users').select('id, last_active_at');
      const map = {};
      for (const u of data || []) {
        map[u.id] = u.last_active_at;
      }
      setOnlineUsers(map);
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadOnlineUsers();
    const id = setInterval(loadOnlineUsers, 20000);
    return () => clearInterval(id);
  }, [user]);

  // Helper: cek apakah user online berdasarkan last_active_at
  const isUserOnline = (userId) => {
    const lastActive = onlineUsers[userId];
    if (!lastActive) return false;
    const age = Date.now() - new Date(lastActive).getTime();
    return age < 120000; // 2 menit
  };

  // Helper: format "last seen" WhatsApp-style
  const formatLastSeen = (userId) => {
    const lastActive = onlineUsers[userId];
    if (!lastActive) return 'Belum pernah online';
    const date = new Date(lastActive);
    const age = Date.now() - date.getTime();
    if (age < 120000) return 'online';
    if (age < 60000) return 'Terakhir dilihat baru saja';
    if (age < 3600000) {
      const mins = Math.floor(age / 60000);
      return `Terakhir dilihat ${mins} menit lalu`;
    }
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Terakhir dilihat hari ini jam ${timeStr}`;
    if (isYesterday) return `Terakhir dilihat kemarin jam ${timeStr}`;
    if (age < 7 * 86400000) {
      const days = Math.floor(age / 86400000);
      return `Terakhir dilihat ${days} hari lalu jam ${timeStr}`;
    }
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return `Terakhir dilihat ${dateStr}`;
  };

  const toggleAppearOffline = () => {
    if (!user?.id) return;
    const newVal = !appearOffline;
    setAppearOffline(newVal);
    localStorage.setItem(`fb-dash-appear-offline-${user.id}`, String(newVal));
    // Kalau user switch ke offline mode, set last_active_at ke null supaya langsung offline
    if (newVal) {
      supabase.from('users').update({ last_active_at: null }).eq('id', user.id);
    } else {
      // Kalau switch ke online, update langsung
      supabase.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', user.id);
    }
    loadOnlineUsers();
  };

  // Delete chat message (soft delete)
  const deleteChatMessage = async (messageId) => {
    if (!confirm('Hapus pesan ini? Tidak bisa di-undo.')) return;
    try {
      await fetch(`/api/chat?id=${messageId}`, { method: 'DELETE' });
      loadChatMessages();
    } catch (e) {
      alert('Gagal hapus: ' + e.message);
    }
  };

  // Auto mark view-once messages sebagai viewed saat muncul di chat
  // Simpan konten lokal sebelum di-clear di DB, supaya user masih bisa lihat
  // sekali pada session saat ini.
  useEffect(() => {
    if (!user?.id || !chatOpen) return;
    chatMessages.forEach(async (m) => {
      if (!m.view_once) return;
      if (m.deleted) return;
      if (m.from_user_id === user.id) return; // sender nggak perlu mark
      if (m.viewed_at) return; // udah pernah dilihat
      if (chatLocalViewedRef.current.has(m.id)) return; // udah di-mark session ini

      // Untuk DM, cek recipient. Untuk global, skip (view once cuma untuk DM)
      if (m.to_user_id !== user.id) return;

      // Simpan konten lokal dulu sebelum di-clear di DB
      chatLocalViewedRef.current.set(m.id, {
        message: m.message,
        attachment_url: m.attachment_url,
        attachment_type: m.attachment_type,
        attachment_name: m.attachment_name,
        attachment_duration: m.attachment_duration,
      });

      // Panggil API mark viewed (clear content di DB)
      try {
        await fetch(`/api/chat?action=view-once&id=${m.id}`, { method: 'PATCH' });
      } catch (e) { /* silent */ }
    });
  }, [chatMessages, user, chatOpen]);

  const toggleSoundEnabled = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('fb-dash-sound-enabled', String(newVal));
    // Play test beep saat enable — dipanggil SYNCHRONOUSLY dalam click handler
    // biar dianggap user gesture oleh browser
    if (newVal && notifAudioRef.current) {
      try {
        notifAudioRef.current.currentTime = 0;
        const promise = notifAudioRef.current.play();
        if (promise && promise.catch) {
          promise.catch(err => {
            console.warn('[Sound] Test play blocked:', err.message);
            alert('Browser memblokir audio. Silakan izinkan autoplay di Firefox:\n1. Klik icon gembok di address bar\n2. Permissions → Autoplay → Allow Audio and Video\n3. Refresh halaman');
          });
        }
      } catch (e) { /* silent */ }
    }
  };

  const openDmWith = async (partnerId, partnerName) => {
    setChatMode('dm');
    setChatDmPartner({ id: partnerId, name: partnerName });
    // Mark as read saat buka
    if (user?.id) {
      try {
        await fetch(`/api/chat?mark_read=1&user1=${user.id}&user2=${partnerId}`, { method: 'PATCH' });
        loadDmList();
      } catch (e) { /* silent */ }
    }
  };

  // ========== PENGATURAN (Item 5) — System Actions ==========
  const resetWorkerCounters = async () => {
    if (!confirm('Reset counter harian semua worker bot ke 0?')) return;
    try {
      const { error } = await supabase.rpc('reset_worker_daily_counters');
      if (error) { setSettingsMsg('Gagal: ' + error.message); return; }
      setSettingsMsg('Counter worker di-reset');
      loadBotHealth();
    } catch (e) { setSettingsMsg('Error: ' + e.message); }
  };

  const cleanupOldChat = async () => {
    if (!confirm('Hapus permanen pesan chat lebih dari 30 hari?')) return;
    try {
      const { data, error } = await supabase.rpc('cleanup_old_chat');
      if (error) { setSettingsMsg('Gagal: ' + error.message); return; }
      setSettingsMsg(`${data || 0} pesan chat lama dihapus`);
    } catch (e) { setSettingsMsg('Error: ' + e.message); }
  };

  const cleanupOldBackups = async () => {
    if (!confirm('Hapus backup lama (sisain 30 terbaru)?')) return;
    try {
      const { data, error } = await supabase.rpc('cleanup_old_backups');
      if (error) { setSettingsMsg('Gagal: ' + error.message); return; }
      setSettingsMsg(`${data || 0} backup lama dihapus`);
      loadAutoBackups();
    } catch (e) { setSettingsMsg('Error: ' + e.message); }
  };

  const loadSystemStats = async () => {
    setSettingsMsg('Menghitung statistik...');
    try {
      const [usersRes, groupsRes, trackerRes, linkRes, activityRes, chatRes, notifRes, backupsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('groups').select('id', { count: 'exact', head: true }),
        supabase.from('posting_tracker').select('id', { count: 'exact', head: true }),
        supabase.from('link_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('activity_log').select('id', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true }),
        supabase.from('backups_log').select('id, size_bytes'),
      ]);
      const totalBackupSize = (backupsRes.data || []).reduce((a, b) => a + (b.size_bytes || 0), 0);
      setSystemStats({
        users: usersRes.count || 0,
        groups: groupsRes.count || 0,
        posting_tracker: trackerRes.count || 0,
        link_submissions: linkRes.count || 0,
        activity_log: activityRes.count || 0,
        chat_messages: chatRes.count || 0,
        notifications: notifRes.count || 0,
        backups: (backupsRes.data || []).length,
        backups_size_kb: Math.round(totalBackupSize / 1024),
      });
      setSettingsMsg('');
    } catch (e) { setSettingsMsg('Error load stats: ' + e.message); }
  };

  // Load daftar auto backup dari tabel backups_log
  const loadAutoBackups = async () => {
    setAutoBackupsLoading(true);
    const { data, error } = await supabase
      .from('backups_log')
      .select('id, created_at, trigger_type, row_counts, size_bytes, error')
      .order('created_at', { ascending: false })
      .limit(30);
    if (!error) setAutoBackups(data || []);
    setAutoBackupsLoading(false);
  };

  // Download 1 backup dari backups_log ke file JSON
  const downloadAutoBackup = async (backupId) => {
    const { data, error } = await supabase
      .from('backups_log')
      .select('*')
      .eq('id', backupId)
      .single();
    if (error || !data) { alert('Gagal load backup: ' + (error?.message || 'unknown')); return; }

    const blob = new Blob([JSON.stringify(data.tables, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date(data.created_at).toISOString().split('T')[0];
    a.download = `backup_auto_${date}_${data.trigger_type}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Trigger manual backup — panggil API cron (butuh CRON_SECRET)
  const triggerManualBackup = async () => {
    const secret = prompt('Masukkan CRON_SECRET untuk trigger backup manual:\n(Kosongkan kalau belum set di Vercel env var)');
    if (secret === null) return;
    try {
      const res = await fetch('/api/cron/backup', {
        method: 'POST',
        headers: secret ? { 'Authorization': `Bearer ${secret}` } : {},
      });
      const result = await res.json();
      if (result.success) {
        alert(`Backup berhasil!\nTotal row: ${result.total_rows}\nUkuran: ${(result.size_bytes / 1024).toFixed(1)} KB\nDurasi: ${result.duration_ms}ms`);
        loadAutoBackups();
      } else {
        alert('Backup gagal: ' + (result.error || 'unknown'));
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  // Backup & Restore
  const downloadBackup = async () => {
    setBackingUp(true);
    setBackupMsg('Membuat backup...');
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const text = await blob.text();
      const data = JSON.parse(text);
      setBackupStats(data.stats || null);

      // Download file
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_fbgroup_${localDateString()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setBackupMsg(`Backup berhasil! Total ${data.stats?.total || 0} baris data dari ${Object.keys(data.tables).length} tabel.`);
    } catch (err) {
      setBackupMsg('Error: ' + err.message);
    } finally {
      setBackingUp(false);
    }
  };

  const uploadRestore = async (file) => {
    if (!file) return;
    if (!confirm('PERINGATAN: Restore akan meng-overwrite data existing berdasarkan ID. Lanjutkan?')) return;
    setRestoring(true);
    setBackupMsg('Memproses file backup...');
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!backup.tables) throw new Error('Format backup tidak valid (tidak ada field "tables")');

      setBackupMsg('Restore dalam progress...');
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setBackupMsg(`Restore berhasil! Total ${result.total} baris di-restore.`);
      setBackupStats(result.results);
      loadData();
    } catch (err) {
      setBackupMsg('Error: ' + err.message);
    } finally {
      setRestoring(false);
    }
  };

  // Helper: strip @ prefix di account_id (Twitter/IG username convention).
  // Aman untuk email (artezi@gmail.com) — cuma strip @ paling depan.
  // Aman untuk numeric FB ID — gak ada @ jadi no-op.
  const cleanBotAccountId = (id) => (id || '').trim().replace(/^@/, '');

  // CRUD akun grup khusus (di tab Jalankan Bot)
  const addGrupAccount = async () => {
    if (!bgId || !bgName) { setBgMsg('ID dan Nama wajib diisi!'); return; }
    const { error } = await supabase.from('bot_accounts').insert({
      account_id: cleanBotAccountId(bgId), account_name: bgName.trim(),
      account_type: 'grup', notes: bgNotes.trim() || null,
    });
    if (error) setBgMsg('Error: ' + error.message);
    else { setBgMsg(`Akun grup "${bgName}" ditambahkan!`); setBgId(''); setBgName(''); setBgNotes(''); loadData(); }
  };

  const updateGrupAccount = async () => {
    if (!bgEditing) return;
    await supabase.from('bot_accounts').update({
      account_id: cleanBotAccountId(bgId), account_name: bgName.trim(),
      account_type: 'grup', notes: bgNotes.trim() || null,
    }).eq('id', bgEditing);
    setBgEditing(null); setBgId(''); setBgName(''); setBgNotes(''); setBgMsg('Akun diupdate!'); loadData();
  };

  const startEditGrupAccount = (a) => {
    setBgEditing(a.id); setBgId(a.account_id); setBgName(a.account_name); setBgNotes(a.notes || '');
  };

  // Pilih akun grup (nama member dipilih terpisah dari dropdown user)
  const selectGrupAccount = (accountId) => {
    setTqAccountId(accountId);
  };

  // Bot accounts CRUD
  const addBotAccount = async () => {
    if (!baId || !baName) { setBaMsg('ID dan Nama wajib diisi!'); return; }
    const { error } = await supabase.from('bot_accounts').insert({
      account_id: cleanBotAccountId(baId), account_name: baName.trim(),
      account_type: baType, notes: baNotes.trim() || null,
    });
    if (error) setBaMsg('Error: ' + error.message);
    else { setBaMsg(`Akun "${baName}" ditambahkan!`); setBaId(''); setBaName(''); setBaNotes(''); loadData(); }
  };

  const updateBotAccount = async () => {
    if (!baEditing) return;
    await supabase.from('bot_accounts').update({
      account_id: cleanBotAccountId(baId), account_name: baName.trim(),
      account_type: baType, notes: baNotes.trim() || null,
      partner_account_id: cleanBotAccountId(baPartner) || null,
    }).eq('id', baEditing);
    setBaEditing(null); setBaId(''); setBaName(''); setBaNotes(''); setBaPartner(''); setBaMsg('Akun diupdate!'); loadData();
  };

  // Set pasangan akun bot (dua-arah otomatis)
  const setAccountPartner = async (accountId, partnerId) => {
    if (!accountId) return;
    // Set akun A → partner = akun B
    await supabase.from('bot_accounts').update({ partner_account_id: partnerId || null }).eq('account_id', accountId);
    // Set akun B → partner = akun A (timbal balik)
    if (partnerId) {
      await supabase.from('bot_accounts').update({ partner_account_id: accountId }).eq('account_id', partnerId);
    }
    loadData();
  };

  const toggleBotAccount = async (id, isActive) => {
    await supabase.from('bot_accounts').update({ is_active: !isActive }).eq('id', id);
    loadData();
  };

  const deleteBotAccount = async (id) => {
    if (!confirm('Hapus akun bot ini?')) return;
    await supabase.from('bot_accounts').delete().eq('id', id);
    loadData();
  };

  const startEditAccount = (a) => {
    setBaEditing(a.id); setBaId(a.account_id); setBaName(a.account_name); setBaType(a.account_type); setBaNotes(a.notes || ''); setBaPartner(a.partner_account_id || '');
  };

  // Reels Bot state
  const [reelsTasks, setReelsTasks] = useState([]);
  const [reelsKeyword, setReelsKeyword] = useState('');
  const [reelsMsg, setReelsMsg] = useState('');
  const [reelsPlatforms, setReelsPlatforms] = useState({ facebook: true, tiktok: false, instagram: false, x: false });

  // Dynamic accounts — dari database
  const reelsAccounts = botAccounts.filter(a => (a.account_type === 'reels' || a.account_type === 'both') && a.is_active);
  const grupAccounts = botAccounts.filter(a => (a.account_type === 'grup' || a.account_type === 'both') && a.is_active);

  const loadReelsTasks = async () => {
    const { data } = await supabase.from('reels_tasks').select('*').order('created_at', { ascending: false }).limit(50);
    setReelsTasks(data || []);
  };

  const createReelsTask = async (accountId, accountName) => {
    const selectedPlatforms = Object.keys(reelsPlatforms).filter(k => reelsPlatforms[k]);
    if (selectedPlatforms.length === 0) { setReelsMsg('Pilih minimal 1 platform!'); return; }
    const { error } = await supabase.from('reels_tasks').insert({
      account_id: accountId,
      account_name: accountName,
      keyword: reelsKeyword || null,
      status: 'pending',
      platforms: selectedPlatforms,
    });
    if (error) setReelsMsg('Error: ' + error.message);
    else { setReelsMsg(`Tugas reels dibuat untuk ${accountName} → ${selectedPlatforms.join(' + ')}!`); loadReelsTasks(); }
  };

  const deleteReelsTask = async (id) => {
    await supabase.from('reels_tasks').delete().eq('id', id);
    loadReelsTasks();
  };

  // Summary per member
  const getMemberPostSummary = () => {
    const map = {};
    postTracker.forEach(p => {
      if (!map[p.user_name]) map[p.user_name] = { name: p.user_name, totalCycles: 0, completeCycles: 0, gambar: 0, video: 0, groups: new Set() };
      map[p.user_name].totalCycles++;
      if (p.is_complete) map[p.user_name].completeCycles++;
      if (p.gambar1_link) map[p.user_name].gambar++;
      if (p.gambar2_link) map[p.user_name].gambar++;
      if (p.video_link) map[p.user_name].video++;
      if (p.group_id) map[p.user_name].groups.add(p.group_id);
    });
    return Object.values(map).map(m => ({ ...m, groups: m.groups.size })).sort((a, b) => b.completeCycles - a.completeCycles);
  };

  if (!user) return <LoginScreen onLogin={login} />;

  const isAdmin = user.role === 'admin';
  const adminTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'weekly', label: 'Data Mingguan' },
    { id: 'posttrack', label: 'Tracking Postingan' },
    { id: 'botqueue', label: 'Jalankan Bot' },
    { id: 'reelsbot', label: 'Reels Bot' },
    { id: 'groups', label: `Grup (${groups.length})` },
    { id: 'users', label: 'Kelola User' },
    { id: 'activity', label: 'Activity Log' },
    { id: 'botstats', label: '📊 Bot Stats' },
    { id: 'settings', label: '⚙️ Pengaturan' },
  ];
  const memberTabs = [
    { id: 'groups', label: 'Daftar Grup' },
    { id: 'weekly', label: 'Data Mingguan' },
    { id: 'posttrack', label: 'Tracking Postingan' },
  ];
  const tabs = isAdmin ? adminTabs : memberTabs;

  const filteredGroups = groups.filter(g =>
    (!leagueFilter || g.league === leagueFilter) &&
    (!search || g.name.toLowerCase().includes(search.toLowerCase()) || g.club.toLowerCase().includes(search.toLowerCase()))
  );

  const today = localDateString();
  const todayLinks = links.filter(l => l.created_at?.startsWith(today) && l.status === 'approved').length;
  const todayBot = activity.filter(a => a.created_at?.startsWith(today) && a.success).length;
  const todayPosts = todayLinks + todayBot;
  const totalSuccess = activity.filter(a => a.success).length + links.filter(l => l.status === 'approved').length;

  // Analytics — gabungan data dari beberapa source:
  //   - activity_log (post dari bot auto-posting)
  //   - link_submissions (link manual submission — legacy)
  //   - posting_tracker (workflow utama member sekarang lewat tab Tracking Postingan)
  //
  // Per row posting_tracker bisa punya 1-3 konten (gambar1 + gambar2 + video).
  // Hitung total konten per cycle = jumlah field terisi.
  const clubs = [...new Set(groups.map(g => g.club))].sort();
  const clubStats = clubs.map(c => {
    const clubGroups = groups.filter(g => g.club === c);
    const clubGroupIds = clubGroups.map(g => g.id);

    // Bot auto-posts (dari activity_log)
    const botPosts = activity.filter(a => a.team === c);
    const botCount = botPosts.length;
    const botSuccess = botPosts.filter(a => a.success).length;

    // Legacy link submissions (kalau ada)
    const legacyLinks = links.filter(l => clubGroupIds.includes(l.group_id) && l.status === 'approved');
    const legacyCount = legacyLinks.length;

    // Main workflow: posting_tracker — hitung field terisi (gambar1, gambar2, video) per row
    const trackerRows = postTrackerHistory.filter(p => clubGroupIds.includes(p.group_id));
    let trackerContents = 0;
    for (const r of trackerRows) {
      if (r.gambar1_link) trackerContents++;
      if (r.gambar2_link) trackerContents++;
      if (r.video_link) trackerContents++;
    }

    const memberCount = legacyCount + trackerContents;
    const total = botCount + memberCount;
    const success = botSuccess + memberCount; // member submit = langsung dianggap sukses
    const trackerCycles = trackerRows.length;
    const trackerCompleted = trackerRows.filter(r => r.is_complete).length;

    return {
      club: c,
      groups: clubGroups.length,
      total,
      success,
      memberPosts: memberCount,
      botPosts: botCount,
      trackerCycles,
      trackerCompleted,
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <>
      {/* NAV */}
      <div style={S.nav} className="dash-header">
        <h1 style={S.h1}>Football Bot Dashboard</h1>
        <div style={{display:'flex',gap:12,alignItems:'center',fontSize:13,flexWrap:'wrap'}}>
          <span style={{color:'#9ca3af'}}>{user.name}</span>
          <span style={S.badge(user.role)}>{user.role}</span>
          <a onClick={()=>setChatOpen(true)} style={{color:'#a5f3fc',cursor:'pointer',fontSize:12,position:'relative',animation:chatUnread>0?'bellPulse 1.5s ease-in-out infinite':'none'}} title="Chat">
            💬 Chat
            {chatUnread > 0 && (
              <span style={{position:'absolute',top:-6,right:-8,background:'#ef4444',color:'#fff',borderRadius:'50%',minWidth:16,height:16,fontSize:9,fontWeight:900,display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'0 4px',boxShadow:'0 0 10px rgba(239,68,68,0.8)'}}>
                {chatUnread > 99 ? '99+' : chatUnread}
              </span>
            )}
          </a>
          <a onClick={()=>setNotifOpen(!notifOpen)} style={{color:'#a5f3fc',cursor:'pointer',fontSize:12,position:'relative',animation:notifUnread>0?'bellPulse 1.5s ease-in-out infinite':'none'}} title="Notifikasi">
            🔔
            {notifUnread > 0 && (
              <span style={{position:'absolute',top:-6,right:-10,background:'#ef4444',color:'#fff',borderRadius:'50%',minWidth:16,height:16,fontSize:9,fontWeight:900,display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'0 4px',boxShadow:'0 0 10px rgba(239,68,68,0.8)'}}>
                {notifUnread > 99 ? '99+' : notifUnread}
              </span>
            )}
          </a>
          <a onClick={toggleAppearOffline} style={{color:appearOffline?'#6b7280':'#10b981',cursor:'pointer',fontSize:12}} title={appearOffline ? 'Status: Tampil Offline (klik untuk online)' : 'Status: Online (klik untuk sembunyikan)'}>
            {appearOffline ? '⚫' : '🟢'}
          </a>
          <a onClick={toggleSoundEnabled} style={{color:'#a5f3fc',cursor:'pointer',fontSize:12}} title={soundEnabled ? 'Suara ON (klik untuk matikan)' : 'Suara OFF (klik untuk nyalakan)'}>
            {soundEnabled ? '🔊' : '🔇'}
          </a>
          <a onClick={()=>setGuideOpen(true)} style={{color:'#a5f3fc',cursor:'pointer',fontSize:12}} title="Panduan Pemakaian">❓</a>
          <a onClick={()=>setPwModal(true)} style={{color:'#67e8f9',cursor:'pointer',fontSize:12}} title="Ganti Password">🔑</a>
          <a onClick={logout} style={{color:'#ef4444',cursor:'pointer'}}>Logout</a>
        </div>
      </div>

      {/* DROPDOWN NOTIFIKASI */}
      {notifOpen && (
        <>
          <div onClick={()=>setNotifOpen(false)} style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:998}}/>
          <div style={{position:'fixed',top:56,right:20,width:380,maxHeight:'70vh',background:'linear-gradient(180deg,#0f172a 0%,#020617 100%)',border:'2px solid #0891b2',borderRadius:10,boxShadow:'0 8px 40px rgba(6,182,212,0.4)',zIndex:999,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid #1f2937',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:13,color:'#67e8f9',fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>🔔 Notifikasi</div>
                <div style={{fontSize:10,color:'#9ca3af'}}>{notifUnread} belum dibaca</div>
              </div>
              <div style={{display:'flex',gap:6}}>
                {user?.role === 'admin' && (
                  <button onClick={()=>{setBroadcastOpen(true);setNotifOpen(false);}} style={{...S.btn('#065f46'),padding:'6px 10px',fontSize:10}}>+ Kirim</button>
                )}
                {notifUnread > 0 && (
                  <button onClick={markAllNotificationsRead} style={{...S.btn('#164e63'),padding:'6px 10px',fontSize:10}}>Tandai Baca</button>
                )}
              </div>
            </div>
            <div style={{flex:1,overflow:'auto'}}>
              {notifications.length === 0 && (
                <div style={{padding:30,textAlign:'center',color:'#6b7280',fontSize:12}}>Belum ada notifikasi</div>
              )}
              {notifications.map(n => {
                const typeColors = {
                  info: '#67e8f9', warning: '#f59e0b', success: '#10b981',
                  error: '#ef4444', announce: '#c084fc',
                };
                const typeIcons = {
                  info: 'ℹ️', warning: '⚠️', success: '✅', error: '❌', announce: '📢',
                };
                const color = typeColors[n.type] || '#67e8f9';
                const icon = typeIcons[n.type] || 'ℹ️';
                const isUnread = !n.read_at;
                return (
                  <div key={n.id} onClick={()=>isUnread&&markNotificationRead(n.id)} style={{
                    padding:'12px 16px',
                    borderBottom:'1px solid #1f2937',
                    cursor: isUnread ? 'pointer' : 'default',
                    background: isUnread ? '#0c1220' : 'transparent',
                    borderLeft: '3px solid ' + (isUnread ? color : '#1f2937'),
                  }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                      <div style={{fontSize:12,fontWeight:700,color,flex:1}}>{icon} {n.title}</div>
                      <div style={{fontSize:9,color:'#6b7280',whiteSpace:'nowrap'}}>{new Date(n.created_at).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                    <div style={{fontSize:11,color:'#9ca3af',marginTop:4,whiteSpace:'pre-wrap'}}>{n.message}</div>
                    <div style={{fontSize:9,color:'#6b7280',marginTop:4}}>
                      {n.to_user_id ? '📧 Personal' : '📢 Broadcast'} · dari <strong>{n.from_user_name}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* MODAL ADMIN BROADCAST */}
      {broadcastOpen && (
        <div onClick={()=>setBroadcastOpen(false)} className="responsive-modal-backdrop" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(2,6,23,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'linear-gradient(180deg,#0f172a 0%,#020617 100%)',border:'2px solid #0891b2',borderRadius:10,width:'100%',maxWidth:500,padding:24}}>
            <h3 style={{color:'#67e8f9',margin:'0 0 16px 0',fontSize:15,fontWeight:900,textTransform:'uppercase',letterSpacing:1}}>📢 Kirim Notifikasi</h3>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label style={{display:'block',fontSize:11,color:'#67e8f9',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>Target</label>
                <select style={S.input} value={broadcastTarget} onChange={e=>setBroadcastTarget(e.target.value)}>
                  <option value="all">📢 Semua User (Broadcast)</option>
                  {users.filter(u => u.role === 'member').map(u => (
                    <option key={u.id} value={u.id}>👤 {u.name}</option>
                  ))}
                </select>
              </div>
              <div><label style={{display:'block',fontSize:11,color:'#67e8f9',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>Tipe</label>
                <select style={S.input} value={broadcastType} onChange={e=>setBroadcastType(e.target.value)}>
                  <option value="info">ℹ️ Info</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="success">✅ Success</option>
                  <option value="error">❌ Error</option>
                  <option value="announce">📢 Announcement</option>
                </select>
              </div>
              <div><label style={{display:'block',fontSize:11,color:'#67e8f9',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>Judul</label>
                <input style={S.input} value={broadcastTitle} onChange={e=>setBroadcastTitle(e.target.value)} placeholder="Judul singkat..." maxLength={100}/></div>
              <div><label style={{display:'block',fontSize:11,color:'#67e8f9',marginBottom:4,fontWeight:700,textTransform:'uppercase'}}>Pesan</label>
                <textarea style={{...S.input,minHeight:100,resize:'vertical',fontFamily:'inherit'}} value={broadcastMessage} onChange={e=>setBroadcastMessage(e.target.value)} placeholder="Isi pesan..." maxLength={1000}/></div>
              {broadcastMsg && <p style={{fontSize:12,color:broadcastMsg.includes('berhasil')?'#10b981':'#ef4444',margin:0}}>{broadcastMsg}</p>}
              <div style={{display:'flex',gap:8}}>
                <button onClick={sendBroadcast} style={{...S.btn('#065f46'),flex:1,padding:'10px'}}>📤 Kirim</button>
                <button onClick={()=>{setBroadcastOpen(false);setBroadcastTitle('');setBroadcastMessage('');setBroadcastMsg('');}} style={{...S.btn('#374151'),flex:1,padding:'10px'}}>Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHAT */}
      {/* LIGHTBOX IMAGE VIEWER — buka gambar tanpa pindah tab */}
      {chatLightbox && (
        <div
          onClick={()=>setChatLightbox(null)}
          style={{
            position:'fixed',top:0,left:0,right:0,bottom:0,
            background:'rgba(0,0,0,0.92)',
            zIndex:2000,
            display:'flex',alignItems:'center',justifyContent:'center',
            cursor:'zoom-out',
            padding:20,
          }}
        >
          {/* Tombol close */}
          <button
            onClick={(e)=>{e.stopPropagation();setChatLightbox(null);}}
            style={{
              position:'absolute',top:20,right:20,
              background:'#991b1b',color:'#fff',border:'none',
              borderRadius:'50%',width:44,height:44,
              fontSize:20,fontWeight:900,cursor:'pointer',
              boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
              zIndex:2001,
            }}
            title="Tutup (Esc)"
          >✕</button>

          {/* Tombol download */}
          <a
            href={chatLightbox.url}
            download={chatLightbox.name}
            onClick={(e)=>e.stopPropagation()}
            style={{
              position:'absolute',top:20,right:80,
              background:'#065f46',color:'#fff',textDecoration:'none',
              borderRadius:22,padding:'10px 18px',
              fontSize:12,fontWeight:700,
              boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
              zIndex:2001,
              display:'inline-flex',alignItems:'center',gap:6,
            }}
            title="Download"
          >📥 Download</a>

          {/* Info nama file */}
          <div style={{
            position:'absolute',top:20,left:20,
            color:'#e0f2fe',fontSize:12,
            background:'rgba(6,182,212,0.2)',
            padding:'8px 14px',borderRadius:6,
            border:'1px solid #0891b2',
            maxWidth:'60%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
            zIndex:2001,
          }}>
            🖼 {chatLightbox.name}
          </div>

          {/* Gambar — click image jangan close */}
          <img
            src={chatLightbox.url}
            alt={chatLightbox.name}
            onClick={(e)=>e.stopPropagation()}
            style={{
              maxWidth:'90vw',
              maxHeight:'90vh',
              objectFit:'contain',
              borderRadius:4,
              cursor:'default',
              boxShadow:'0 20px 80px rgba(0,0,0,0.8)',
            }}
          />

          {/* Hint keyboard */}
          <div style={{
            position:'absolute',bottom:20,left:'50%',transform:'translateX(-50%)',
            color:'#9ca3af',fontSize:11,
            background:'rgba(2,6,23,0.8)',
            padding:'6px 14px',borderRadius:6,
            border:'1px solid #1f2937',
          }}>
            Klik di luar gambar atau tekan <kbd style={{background:'#374151',padding:'1px 6px',borderRadius:3,fontSize:10}}>Esc</kbd> untuk tutup
          </div>
        </div>
      )}

      {chatOpen && (
        <div onClick={()=>setChatOpen(false)} className="responsive-modal-backdrop" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(2,6,23,0.9)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div onClick={e=>e.stopPropagation()} className="responsive-modal-content" style={{background:'linear-gradient(180deg,#0f172a 0%,#020617 100%)',border:'2px solid #0891b2',borderRadius:12,width:'100%',maxWidth:900,height:'85vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 8px 40px rgba(6,182,212,0.3)'}}>
            {/* Header */}
            <div style={{padding:'14px 20px',borderBottom:'2px solid #0891b2',display:'flex',justifyContent:'space-between',alignItems:'center',background:'linear-gradient(90deg,#0c1220 0%,#020617 100%)'}}>
              <div>
                <h2 style={{margin:0,color:'#67e8f9',fontSize:16,fontWeight:900,textTransform:'uppercase',letterSpacing:1}}>💬 Chat</h2>
                <div style={{fontSize:10,color:'#9ca3af',marginTop:2,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                  {chatMode === 'global' ? (
                    <span>Global — semua member bisa baca</span>
                  ) : (
                    <>
                      <span>DM dengan <strong style={{color:'#e0f2fe'}}>{chatDmPartner?.name || '-'}</strong></span>
                      {chatDmPartner && (
                        isUserOnline(chatDmPartner.id) ? (
                          <span style={{color:'#10b981',fontWeight:700,display:'inline-flex',alignItems:'center',gap:3}}>
                            <span style={{width:7,height:7,background:'#10b981',borderRadius:'50%',display:'inline-block'}}/>
                            online
                          </span>
                        ) : (
                          <span style={{color:'#6b7280',fontStyle:'italic'}}>
                            · {formatLastSeen(chatDmPartner.id)}
                          </span>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
              <button onClick={()=>setChatOpen(false)} style={{background:'#991b1b',color:'#fff',border:'none',borderRadius:6,padding:'8px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>✕</button>
            </div>

            <div className="chat-body-flex" style={{flex:1,display:'flex',overflow:'hidden'}}>
              {/* Sidebar: global + DM list */}
              <div className="chat-sidebar" style={{width:220,borderRight:'1px solid #1f2937',background:'#020617',overflow:'auto',display:'flex',flexDirection:'column'}}>
                <div
                  onClick={()=>{setChatMode('global');setChatDmPartner(null);}}
                  style={{
                    padding:'12px 16px',
                    fontSize:12,
                    cursor:'pointer',
                    color: chatMode === 'global' ? '#67e8f9' : '#9ca3af',
                    background: chatMode === 'global' ? '#0c1220' : 'transparent',
                    borderLeft: chatMode === 'global' ? '3px solid #06b6d4' : '3px solid transparent',
                    fontWeight: chatMode === 'global' ? 700 : 400,
                    borderBottom:'1px solid #1f2937',
                  }}
                >
                  🌐 Global Chat
                </div>
                <div style={{padding:'8px 16px',fontSize:9,color:'#6b7280',textTransform:'uppercase',letterSpacing:1,marginTop:4}}>Direct Messages</div>

                {/* DM list existing */}
                {chatDmList.map(conv => {
                  const online = isUserOnline(conv.partner_id);
                  return (
                    <div key={conv.partner_id}
                      onClick={()=>openDmWith(conv.partner_id, conv.partner_name)}
                      style={{
                        padding:'10px 16px',
                        fontSize:11,
                        cursor:'pointer',
                        color: chatMode === 'dm' && chatDmPartner?.id === conv.partner_id ? '#67e8f9' : '#9ca3af',
                        background: chatMode === 'dm' && chatDmPartner?.id === conv.partner_id ? '#0c1220' : 'transparent',
                        borderLeft: chatMode === 'dm' && chatDmPartner?.id === conv.partner_id ? '3px solid #06b6d4' : '3px solid transparent',
                        borderBottom:'1px solid #1f2937',
                      }}
                    >
                      <div style={{fontWeight:700,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                          👤 {conv.partner_name}
                          {online && <span title="Online" style={{width:8,height:8,background:'#10b981',borderRadius:'50%',display:'inline-block',animation:'onlinePulse 2s ease-in-out infinite'}}/>}
                        </span>
                        {conv.unread > 0 && <span style={{background:'#ef4444',color:'#fff',borderRadius:'50%',minWidth:16,height:16,fontSize:9,display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'0 4px'}}>{conv.unread}</span>}
                      </div>
                      <div style={{fontSize:10,color:online?'#10b981':'#6b7280',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:180}}>
                        {online ? '🟢 Online' : conv.last_message.substring(0, 40)}
                      </div>
                    </div>
                  );
                })}

                {/* Pilih member baru untuk DM */}
                <div style={{padding:'8px 16px',fontSize:9,color:'#6b7280',textTransform:'uppercase',letterSpacing:1,marginTop:8,borderTop:'1px solid #1f2937'}}>Mulai Chat Baru</div>
                {users.filter(u => u.id !== user.id && !chatDmList.some(c => c.partner_id === u.id)).map(u => {
                  const online = isUserOnline(u.id);
                  return (
                    <div key={u.id}
                      onClick={()=>openDmWith(u.id, u.name)}
                      style={{padding:'8px 16px',fontSize:11,cursor:'pointer',color:'#9ca3af',borderBottom:'1px solid #0c1220',display:'flex',alignItems:'center',gap:6}}
                    >
                      + {u.name}
                      {online && <span title="Online" style={{width:7,height:7,background:'#10b981',borderRadius:'50%',display:'inline-block'}}/>}
                      <span style={{fontSize:9,color:'#6b7280',marginLeft:'auto'}}>({u.role})</span>
                    </div>
                  );
                })}
              </div>

              {/* Main chat area */}
              <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
                <div style={{flex:1,overflow:'auto',padding:16,display:'flex',flexDirection:'column',gap:8}}>
                  {chatMessages.length === 0 && (
                    <div style={{textAlign:'center',color:'#6b7280',padding:30,fontSize:12}}>Belum ada pesan. Mulai chat!</div>
                  )}
                  {chatMessages.map(m => {
                    const isMe = m.from_user_id === user.id;
                    const roleColor = m.from_user_role === 'admin' ? '#c084fc' : '#67e8f9';
                    const isDeleted = m.deleted;
                    // Read receipt logic: untuk DM, cek read_at. Global nggak ada read tracking per user.
                    const isRead = m.to_user_id && m.read_at;
                    // View once: recipient bisa lihat konten lokal selama session ini (sebelum refresh)
                    const isViewOnce = m.view_once;
                    const localViewed = chatLocalViewedRef.current.get(m.id);
                    const isViewOnceConsumed = isViewOnce && !isMe && m.viewed_at && !localViewed;
                    // Content yang di-display: kalau view once + recipient + locally viewed, pakai localViewed
                    const displayMessage = localViewed ? localViewed.message : m.message;
                    const displayAttachmentUrl = localViewed ? localViewed.attachment_url : m.attachment_url;
                    const displayAttachmentType = localViewed ? localViewed.attachment_type : m.attachment_type;
                    const displayAttachmentName = localViewed ? localViewed.attachment_name : m.attachment_name;
                    const displayAttachmentDuration = localViewed ? localViewed.attachment_duration : m.attachment_duration;
                    // Semua user (admin + member) bisa hapus pesan siapapun
                    const canDelete = !isDeleted;
                    return (
                      <div key={m.id} style={{display:'flex',justifyContent:isMe?'flex-end':'flex-start'}} className="chat-message-row">
                        <div style={{
                          maxWidth:'75%',
                          padding:'10px 14px',
                          borderRadius:8,
                          background: isDeleted ? '#1f2937' : (isMe ? '#065f46' : '#0d1117'),
                          border:'1px solid ' + (isDeleted ? '#374151' : (isMe ? '#10b981' : '#1f2937')),
                          opacity: isDeleted ? 0.6 : 1,
                          position:'relative',
                        }}>
                          {/* Delete button — admin bisa hapus siapapun, member cuma pesan sendiri */}
                          {canDelete && (
                            <button
                              onClick={()=>deleteChatMessage(m.id)}
                              title={isMe ? 'Hapus pesan' : `Hapus pesan (admin)`}
                              style={{
                                position:'absolute',
                                top:4,
                                right:4,
                                background:'rgba(153,27,27,0.95)',
                                color:'#fff',
                                border:'1px solid #dc2626',
                                borderRadius:'50%',
                                width:20,
                                height:20,
                                fontSize:9,
                                fontWeight:900,
                                cursor:'pointer',
                                opacity:0,
                                transition:'opacity 0.2s',
                                display:'flex',
                                alignItems:'center',
                                justifyContent:'center',
                                boxShadow:'0 2px 6px rgba(0,0,0,0.6)',
                                zIndex:5,
                                padding:0,
                                lineHeight:1,
                              }}
                              className="msg-delete-btn"
                            >✕</button>
                          )}
                          {!isMe && !isDeleted && (
                            <div style={{fontSize:10,fontWeight:700,color:roleColor,marginBottom:4}}>
                              {m.from_user_name} {m.from_user_role === 'admin' && '👑'}
                            </div>
                          )}

                          {isDeleted ? (
                            <div style={{fontSize:11,color:'#6b7280',fontStyle:'italic'}}>🚫 Pesan dihapus</div>
                          ) : isViewOnceConsumed ? (
                            <div style={{fontSize:11,color:'#fb923c',fontStyle:'italic',display:'flex',alignItems:'center',gap:6}}>
                              🔥 Pesan sekali lihat — sudah dibuka
                            </div>
                          ) : (
                            <>
                              {/* View once indicator */}
                              {isViewOnce && (
                                <div style={{fontSize:9,color:'#fb923c',fontWeight:700,marginBottom:4,display:'flex',alignItems:'center',gap:3}}>
                                  🔥 SEKALI LIHAT {localViewed && '· akan hilang next session'}
                                </div>
                              )}

                              {/* IMAGE ATTACHMENT */}
                              {displayAttachmentType === 'image' && displayAttachmentUrl && (
                                <div style={{marginBottom:displayMessage && displayMessage !== '📷 Foto' ? 6 : 0}}>
                                  <img
                                    src={displayAttachmentUrl}
                                    alt={displayAttachmentName || 'image'}
                                    style={{maxWidth:'100%',maxHeight:300,borderRadius:6,cursor:'pointer',display:'block'}}
                                    onClick={()=>setChatLightbox({ url: displayAttachmentUrl, name: displayAttachmentName || 'image' })}
                                  />
                                </div>
                              )}

                              {/* AUDIO ATTACHMENT */}
                              {displayAttachmentType === 'audio' && displayAttachmentUrl && (
                                <div style={{marginBottom:displayMessage && displayMessage !== '🎤 Pesan suara' ? 6 : 0,display:'flex',alignItems:'center',gap:8}}>
                                  <audio controls src={displayAttachmentUrl} style={{height:36,maxWidth:240}}/>
                                  {displayAttachmentDuration && (
                                    <span style={{fontSize:10,color:'#9ca3af'}}>{displayAttachmentDuration}s</span>
                                  )}
                                </div>
                              )}

                              {/* TEXT MESSAGE (skip kalau cuma placeholder untuk attachment) */}
                              {displayMessage && displayMessage !== '📷 Foto' && displayMessage !== '🎤 Pesan suara' && displayMessage !== '[🔥 pesan sekali lihat]' && (
                                <div style={{fontSize:12,color:'#e0f2fe',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{displayMessage}</div>
                              )}

                              {/* View once: sender liat status */}
                              {isViewOnce && isMe && m.viewed_at && (
                                <div style={{fontSize:9,color:'#10b981',marginTop:4,fontStyle:'italic'}}>
                                  ✓ Sudah dilihat {new Date(m.viewed_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}
                                </div>
                              )}
                            </>
                          )}

                          {/* Footer: waktu + read receipt */}
                          <div style={{fontSize:9,color:'#6b7280',marginTop:4,textAlign:'right',display:'flex',justifyContent:'flex-end',alignItems:'center',gap:4}}>
                            <span>{new Date(m.created_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span>
                            {/* Read receipt icon — hanya untuk own messages di DM */}
                            {isMe && !isDeleted && m.to_user_id && (
                              <span style={{fontSize:11,color:isRead?'#38bdf8':'#6b7280',fontWeight:700,letterSpacing:-2}} title={isRead?'Sudah dibaca':'Terkirim'}>
                                {isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Input toolbar */}
                <div style={{padding:12,borderTop:'1px solid #1f2937',background:'#020617'}}>
                  {/* PREVIEW ATTACHMENT (kalau ada pending) */}
                  {chatPendingAttachment && (
                    <div style={{marginBottom:10,padding:10,background:'#0d1117',border:'1px solid #0891b2',borderRadius:6,display:'flex',gap:12,alignItems:'center'}}>
                      {chatPendingAttachment.type === 'image' && (
                        <img src={chatPendingAttachment.previewUrl} alt="preview" style={{maxHeight:80,maxWidth:120,borderRadius:4,objectFit:'cover'}}/>
                      )}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,color:'#67e8f9',fontWeight:700}}>📷 Gambar siap dikirim</div>
                        <div style={{fontSize:10,color:'#9ca3af',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{chatPendingAttachment.name}</div>
                        <div style={{fontSize:10,color:'#6b7280',marginTop:2}}>{(chatPendingAttachment.size / 1024).toFixed(1)} KB · Tekan Kirim untuk upload, atau tambahkan caption di bawah</div>
                      </div>
                      <button onClick={cancelPendingAttachment} disabled={chatUploading} style={{...S.btn('#991b1b'),padding:'8px 12px',fontSize:11}}>✕ Batal</button>
                    </div>
                  )}

                  {chatRecording ? (
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <div style={{flex:1,display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#1a0a0a',border:'1px solid #dc2626',borderRadius:6,color:'#fca5a5',fontSize:12,fontWeight:700,animation:'recordPulse 1.5s ease-in-out infinite'}}>
                        🎤 Merekam... {chatRecordSec}s / 60s
                      </div>
                      <button onClick={cancelVoiceRecord} style={{...S.btn('#374151'),padding:'10px 14px',fontSize:11}}>✕ Batal</button>
                      <button onClick={stopVoiceRecord} style={{...S.btn('#065f46'),padding:'10px 20px',fontSize:12}}>✓ Kirim</button>
                    </div>
                  ) : (
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      {/* Emoji picker */}
                      <div style={{position:'relative'}}>
                        <button onClick={()=>setEmojiPickerOpen(!emojiPickerOpen)} style={{padding:'10px 12px',background:emojiPickerOpen?'#0c4a6e':'#164e63',color:'#67e8f9',border:'none',borderRadius:6,fontSize:16,cursor:'pointer'}} title="Emoji">
                          😀
                        </button>
                        {emojiPickerOpen && (
                          <>
                            <div onClick={()=>setEmojiPickerOpen(false)} style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:99}}/>
                            <div style={{position:'absolute',bottom:46,left:0,background:'#0f172a',border:'2px solid #0891b2',borderRadius:10,padding:10,width:320,maxHeight:280,overflow:'auto',zIndex:100,boxShadow:'0 8px 30px rgba(0,0,0,0.7)',userSelect:'none',WebkitUserSelect:'none'}}>
                              {[
                                { cat: 'Sering', emojis: '😀😂🤣😍🥰😘😎🤩🥳🤔😅😭🔥❤️👍👏💪🎉⚽🏆' },
                                { cat: 'Wajah', emojis: '😀😃😄😁😆😅🤣😂🙂😊😇🥰😍🤩😘😋😛🤔🤫🤭😏😌😴😷🤒🤕🤑🤠😈👿' },
                                { cat: 'Tangan', emojis: '👍👎👊✊🤛🤜👏🙌🤝🙏✌️🤟🤘👌🤏👈👉👆👋🤚✋🖐️' },
                                { cat: 'Hati', emojis: '❤️🧡💛💚💙💜🖤🤍🤎💔❣️💕💞💓💗💖💘💝💟' },
                                { cat: 'Bola', emojis: '⚽🏆🥇🥈🥉🏅🎖️🏟️🥅👟🦶💪🎯🔥✨🎉🎊🏃‍♂️🧤🦁🐐' },
                                { cat: 'Objek', emojis: '🎵🎶📸📹💻📱⏰🔔📢📌📍🗓️📊💰💎🎁🎂🍕🍔☕🍺' },
                                { cat: 'Simbol', emojis: '✅❌⭐💯🔴🟢🟡🔵⚡☀️🌙🌟💡🚀✈️🏠🚗💤👀🫡' },
                              ].map(group => (
                                <div key={group.cat}>
                                  <div style={{fontSize:9,color:'#6b7280',textTransform:'uppercase',letterSpacing:1,padding:'6px 2px 3px',borderBottom:'1px solid #1f2937',marginBottom:4}}>{group.cat}</div>
                                  <div style={{display:'flex',flexWrap:'wrap',gap:2,marginBottom:6}}>
                                    {[...group.emojis].filter(c => c.trim()).reduce((acc, char) => {
                                      // Handle multi-codepoint emojis
                                      const last = acc[acc.length - 1];
                                      if (last && /[\uD800-\uDBFF]/.test(last) && /[\uDC00-\uDFFF]/.test(char)) {
                                        acc[acc.length - 1] = last + char;
                                      } else if (last && char === '\uFE0F') {
                                        acc[acc.length - 1] = last + char;
                                      } else if (last && char === '\u200D') {
                                        acc[acc.length - 1] = last + char;
                                      } else if (last && last.endsWith('\u200D')) {
                                        acc[acc.length - 1] = last + char;
                                      } else {
                                        acc.push(char);
                                      }
                                      return acc;
                                    }, []).map((emoji, i) => (
                                      <button key={i} type="button" onMouseDown={(e)=>{e.preventDefault();e.stopPropagation();setChatInput(prev=>prev+emoji);}} style={{width:32,height:32,border:'none',background:'transparent',borderRadius:4,fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',touchAction:'manipulation',userSelect:'none'}} title={emoji}>
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      {/* Image upload */}
                      <label style={{cursor:(chatUploading||chatPendingAttachment)?'not-allowed':'pointer',padding:'10px 12px',background:'#164e63',borderRadius:6,fontSize:16,opacity:(chatUploading||chatPendingAttachment)?0.5:1}} title="Kirim foto">
                        {chatUploading ? '⏳' : '📷'}
                        <input type="file" accept="image/*" style={{display:'none'}} disabled={chatUploading||!!chatPendingAttachment} onChange={onChatImageSelect}/>
                      </label>
                      {/* Voice record */}
                      <button onClick={startVoiceRecord} disabled={chatUploading||!!chatPendingAttachment} style={{padding:'10px 12px',background:'#164e63',color:'#67e8f9',border:'none',borderRadius:6,fontSize:16,cursor:(chatUploading||chatPendingAttachment)?'not-allowed':'pointer',opacity:(chatUploading||chatPendingAttachment)?0.5:1}} title="Rekam pesan suara">
                        🎤
                      </button>
                      {/* View once toggle — hanya aktif di DM mode */}
                      {chatMode === 'dm' && (
                        <button
                          onClick={()=>setChatViewOnceMode(!chatViewOnceMode)}
                          disabled={chatUploading}
                          title={chatViewOnceMode ? 'View Once ON — pesan akan hilang setelah dilihat' : 'Toggle View Once (🔥 pesan sekali lihat)'}
                          style={{
                            padding:'10px 12px',
                            background: chatViewOnceMode ? '#7c2d12' : '#164e63',
                            color: chatViewOnceMode ? '#fb923c' : '#67e8f9',
                            border: chatViewOnceMode ? '2px solid #fb923c' : 'none',
                            borderRadius:6,
                            fontSize:16,
                            cursor: chatUploading ? 'not-allowed' : 'pointer',
                            opacity: chatUploading ? 0.5 : 1,
                          }}
                        >
                          🔥
                        </button>
                      )}
                      <input
                        type="text"
                        style={{...S.input,flex:1}}
                        value={chatInput}
                        onChange={e=>setChatInput(e.target.value)}
                        onKeyDown={e=>{
                          if (e.key === 'Enter') {
                            if (chatPendingAttachment) sendPendingAttachment();
                            else sendChatMessage();
                          }
                        }}
                        onPaste={onChatPaste}
                        placeholder={chatPendingAttachment ? 'Tambahkan caption (opsional)...' : (chatMode === 'dm' ? `Pesan ke ${chatDmPartner?.name || '-'}... (Ctrl+V paste gambar)` : 'Ketik pesan global... (Ctrl+V paste gambar)')}
                        maxLength={2000}
                        disabled={chatUploading}
                      />
                      <button
                        onClick={()=>chatPendingAttachment ? sendPendingAttachment() : sendChatMessage()}
                        disabled={chatUploading || (!chatPendingAttachment && !chatInput.trim())}
                        style={{...S.btn('#065f46'),padding:'10px 20px',fontSize:12,opacity:(chatUploading || (!chatPendingAttachment && !chatInput.trim()))?0.5:1}}
                      >
                        {chatUploading ? '⏳' : 'Kirim'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PANDUAN MEMBER */}
      {guideOpen && (
        <div onClick={()=>setGuideOpen(false)} className="responsive-modal-backdrop" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(2,6,23,0.9)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div onClick={e=>e.stopPropagation()} className="responsive-modal-content" style={{background:'linear-gradient(180deg,#0f172a 0%,#020617 100%)',border:'2px solid #0891b2',borderRadius:12,width:'100%',maxWidth:900,maxHeight:'90vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 8px 40px rgba(6,182,212,0.3)'}}>
            {/* Header */}
            <div style={{padding:'16px 24px',borderBottom:'2px solid #0891b2',display:'flex',justifyContent:'space-between',alignItems:'center',background:'linear-gradient(90deg,#0c1220 0%,#020617 100%)'}}>
              <div>
                <h2 style={{margin:0,color:'#67e8f9',fontSize:18,fontWeight:900,textTransform:'uppercase',letterSpacing:1.5}}>❓ Panduan Pemakaian</h2>
                <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>Football Bot Dashboard — untuk member & admin</div>
              </div>
              <button onClick={()=>setGuideOpen(false)} style={{background:'#991b1b',color:'#fff',border:'none',borderRadius:6,padding:'8px 14px',fontSize:13,fontWeight:700,cursor:'pointer'}}>✕ Tutup</button>
            </div>

            {/* Body: sidebar + content */}
            <div style={{flex:1,display:'flex',overflow:'hidden'}}>
              {/* Sidebar sections */}
              <div style={{width:220,borderRight:'1px solid #1f2937',background:'#020617',overflow:'auto',padding:'12px 0'}}>
                {[
                  { id: 'welcome',    label: '👋 Selamat Datang' },
                  { id: 'target',     label: '🎯 Target & Siklus' },
                  { id: 'submit',     label: '📝 Cara Submit' },
                  { id: 'rules',      label: '✅ Aturan Konten' },
                  { id: 'dedup',      label: '🔍 Sistem Dedup' },
                  { id: 'progress',   label: '📊 Baca Progress' },
                  { id: 'faq',        label: '💬 FAQ' },
                  { id: 'trouble',    label: '🚨 Troubleshoot' },
                ].map(s => (
                  <div key={s.id} onClick={()=>setGuideSection(s.id)} style={{
                    padding:'10px 16px',
                    fontSize:12,
                    cursor:'pointer',
                    color: guideSection === s.id ? '#67e8f9' : '#9ca3af',
                    background: guideSection === s.id ? '#0c1220' : 'transparent',
                    borderLeft: guideSection === s.id ? '3px solid #06b6d4' : '3px solid transparent',
                    fontWeight: guideSection === s.id ? 700 : 400,
                  }}>
                    {s.label}
                  </div>
                ))}
              </div>

              {/* Content area */}
              <div style={{flex:1,padding:'20px 28px',overflow:'auto',fontSize:13,lineHeight:1.7,color:'#e0f2fe'}}>
                {guideSection === 'welcome' && (
                  <div>
                    <h3 style={{color:'#67e8f9',fontSize:18,marginTop:0}}>👋 Selamat Datang di Football Bot Dashboard</h3>
                    <p>Dashboard ini adalah pusat kendali untuk tim posting konten sepakbola ke grup Facebook. Dashboard bantu kamu tracking progress harian, submit link postingan, dan kelola target.</p>

                    <h4 style={{color:'#a5f3fc',marginTop:20,fontSize:14}}>Siapa yang pakai?</h4>
                    <ul style={{paddingLeft:20}}>
                      <li><strong style={{color:'#67e8f9'}}>Admin</strong> — kelola grup, member, bot, review progress</li>
                      <li><strong style={{color:'#67e8f9'}}>Member</strong> — submit link posting harian ke grup yang ditugaskan</li>
                    </ul>

                    <h4 style={{color:'#a5f3fc',marginTop:20,fontSize:14}}>Apa yang kamu perlukan?</h4>
                    <ul style={{paddingLeft:20}}>
                      <li>Akun Facebook yang udah gabung ke grup-grup target</li>
                      <li>Login ke dashboard dengan username + password yang dikasih admin</li>
                      <li>Konten sepakbola yang mau kamu posting</li>
                    </ul>

                    <div style={{marginTop:20,padding:12,background:'#064e3b',borderLeft:'3px solid #10b981',borderRadius:4,fontSize:12}}>
                      💡 <strong>Tip</strong>: Kalau pertama kali pakai, mulai dari section <strong>"🎯 Target & Siklus"</strong> di sebelah kiri untuk paham konsep dasar.
                    </div>
                  </div>
                )}

                {guideSection === 'target' && (
                  <div>
                    <h3 style={{color:'#67e8f9',fontSize:18,marginTop:0}}>🎯 Target Harian & Siklus Posting</h3>

                    <h4 style={{color:'#a5f3fc',fontSize:14}}>Apa itu "Siklus"?</h4>
                    <p>Satu <strong>siklus</strong> = satu ronde posting lengkap di satu grup. Tiap siklus terdiri dari:</p>
                    <ul style={{paddingLeft:20}}>
                      <li><strong style={{color:'#6ee7b7'}}>G1</strong> (Gambar 1) — post gambar pertama</li>
                      <li><strong style={{color:'#6ee7b7'}}>G2</strong> (Gambar 2) — post gambar kedua</li>
                      <li><strong style={{color:'#c084fc'}}>V</strong> (Video) — post video</li>
                    </ul>

                    <h4 style={{color:'#a5f3fc',marginTop:16,fontSize:14}}>Target per grup: 4 siklus</h4>
                    <p>Setiap grup punya <strong>4 siklus</strong> per hari:</p>
                    <div style={{background:'#0d1117',padding:12,borderRadius:6,border:'1px solid #1f2937',fontSize:12,fontFamily:'monospace'}}>
                      Siklus 1: G1 + G2 + V<br/>
                      Siklus 2: G1 + G2 + V<br/>
                      Siklus 3: G1 + G2 + V<br/>
                      Siklus 4: G1 + G2 + V<br/>
                      <strong style={{color:'#fcd34d'}}>Total per grup: 12 post (8 gambar + 4 video)</strong>
                    </div>

                    <h4 style={{color:'#a5f3fc',marginTop:16,fontSize:14}}>Target harian kamu</h4>
                    <p>Setiap member dikasih target <strong>jumlah grup</strong> yang harus diselesaikan per hari. Misal target = 5 grup, berarti kamu harus isi 12 post × 5 grup = <strong>60 post</strong> per hari.</p>

                    <div style={{marginTop:16,padding:12,background:'#78350f',borderLeft:'3px solid #f59e0b',borderRadius:4,fontSize:12}}>
                      ⚠️ Target kamu bisa dilihat di tab <strong>Tracking Postingan</strong>, section "Progress Target Hari Ini".
                    </div>
                  </div>
                )}

                {guideSection === 'submit' && (
                  <div>
                    <h3 style={{color:'#67e8f9',fontSize:18,marginTop:0}}>📝 Cara Submit Link Post</h3>

                    <p>Setelah kamu selesai posting ke grup Facebook, <strong>submit link post-nya</strong> ke dashboard biar ke-track.</p>

                    <h4 style={{color:'#a5f3fc',fontSize:14}}>Langkah step-by-step:</h4>
                    <ol style={{paddingLeft:20,lineHeight:2}}>
                      <li><strong>Buka tab "Tracking Postingan"</strong> di navigasi atas</li>
                      <li><strong>Scroll ke section "Submit Postingan"</strong></li>
                      <li>Pilih <strong>Grup</strong> dari dropdown (grup Facebook yang kamu posting)</li>
                      <li>Pilih <strong>Siklus ke-</strong> (1, 2, 3, atau 4)</li>
                      <li>Pilih <strong>Jenis</strong> — Gambar 1, Gambar 2, atau Video</li>
                      <li>Paste <strong>link post Facebook</strong> di kolom "Link Postingan"
                        <br/><span style={{fontSize:11,color:'#9ca3af'}}>Format: <code style={{background:'#1f2937',padding:'1px 4px',borderRadius:2}}>https://www.facebook.com/groups/.../posts/...</code></span>
                      </li>
                      <li>Klik tombol <strong style={{color:'#6ee7b7'}}>SUBMIT</strong></li>
                      <li>Kalau sukses, pesan <em>"Link berhasil disimpan!"</em> muncul</li>
                      <li>Icon di tabel bawah (G1/G2/V) berubah jadi hijau ✅</li>
                    </ol>

                    <h4 style={{color:'#a5f3fc',marginTop:16,fontSize:14}}>Cara dapat link post Facebook:</h4>
                    <ol style={{paddingLeft:20}}>
                      <li>Buka post yang baru kamu posting di Facebook</li>
                      <li>Klik <strong>timestamp</strong> post (misal "5m", "1j") — biasanya di dekat nama user/grup</li>
                      <li>Browser akan nampilin URL lengkap post di address bar</li>
                      <li>Copy URL itu dan paste ke dashboard</li>
                    </ol>

                    <div style={{marginTop:16,padding:12,background:'#064e3b',borderLeft:'3px solid #10b981',borderRadius:4,fontSize:12}}>
                      💡 <strong>Tips</strong>: Submit link <strong>segera setelah posting</strong>, jangan ditunda, biar progress harian kamu akurat.
                    </div>
                  </div>
                )}

                {guideSection === 'rules' && (
                  <div>
                    <h3 style={{color:'#67e8f9',fontSize:18,marginTop:0}}>✅ Aturan Konten</h3>

                    <h4 style={{color:'#6ee7b7',fontSize:14}}>YANG BOLEH (sepakbola):</h4>
                    <ul style={{paddingLeft:20,lineHeight:1.8}}>
                      <li>Post sepakbola (highlight, gol, berita transfer, pemain, klub)</li>
                      <li>Liga Eropa (EPL, La Liga, Serie A, Bundesliga, Ligue 1)</li>
                      <li>Liga Indonesia (Liga 1, Liga 2, piala presiden)</li>
                      <li>Timnas Indonesia / Timnas negara lain</li>
                      <li>Piala dunia, Euro, Champions League, Europa, AFC</li>
                      <li>Post berisi gambar pemain, lapangan, stadion, supporter, jersey</li>
                    </ul>

                    <h4 style={{color:'#fca5a5',marginTop:16,fontSize:14}}>YANG TIDAK BOLEH:</h4>
                    <ul style={{paddingLeft:20,lineHeight:1.8}}>
                      <li>Konten non-sepakbola (resep, drakor, politik, pengajian)</li>
                      <li>Olahraga lain (badminton, basket, voli, F1, MotoGP)</li>
                      <li>Duplikat konten — link yang udah pernah disubmit oleh kamu atau member lain</li>
                      <li>Gambar hasil re-upload dari post Facebook grup lain</li>
                      <li>Spam: pinjol, judi online, investasi bodong</li>
                    </ul>

                    <div style={{marginTop:16,padding:12,background:'#7f1d1d',borderLeft:'3px solid #ef4444',borderRadius:4,fontSize:12}}>
                      ⚠️ <strong>Penting</strong>: Kalau kamu submit konten non-sepakbola, link akan ditolak dashboard, dan kalau sering nyoba, admin bisa tahu lewat history.
                    </div>
                  </div>
                )}

                {guideSection === 'dedup' && (
                  <div>
                    <h3 style={{color:'#67e8f9',fontSize:18,marginTop:0}}>🔍 Sistem Dedup (Anti-Duplikat)</h3>

                    <p>Dashboard punya <strong>3 lapis proteksi</strong> untuk mencegah duplikat konten. Ini kenapa kadang link kamu <strong>ditolak</strong> walau belum pernah submit.</p>

                    <h4 style={{color:'#a5f3fc',marginTop:16,fontSize:14}}>Lapis 1: URL Exact Match</h4>
                    <p>Kalau URL yang kamu submit <strong>persis sama</strong> dengan yang udah pernah disubmit (oleh kamu atau member lain), langsung ditolak.</p>

                    <h4 style={{color:'#a5f3fc',marginTop:16,fontSize:14}}>Lapis 2: Fingerprint URL</h4>
                    <p>Dashboard ekstrak <strong>ID unik</strong> dari URL Facebook (misal fbid, post ID). Kalau ID sama tapi URL-nya beda sedikit (misal ada tambahan parameter), tetap ditolak.</p>
                    <p style={{fontSize:11,color:'#9ca3af'}}>Contoh yang sama: <code>facebook.com/post/123</code> dan <code>facebook.com/post/123?ref=share</code> dianggap sama.</p>

                    <h4 style={{color:'#a5f3fc',marginTop:16,fontSize:14}}>Lapis 3: Visual Hash (pHash)</h4>
                    <p>Dashboard ambil <strong>gambar preview</strong> (og:image) dari post Facebook, lalu buat "sidik jari visual" (perceptual hash). Kalau gambar kamu <strong>mirip visualnya</strong> dengan gambar yang udah pernah disubmit, ditolak.</p>
                    <p style={{fontSize:11,color:'#9ca3af'}}>Ini menangkap kasus: gambar yang sama diposting ulang dengan caption beda, atau hasil re-upload post grup lain.</p>

                    <div style={{marginTop:16,padding:12,background:'#78350f',borderLeft:'3px solid #f59e0b',borderRadius:4,fontSize:12}}>
                      ⚠️ Kalau link kamu ditolak, <strong>cari konten baru</strong> — bukan edit link yang sama dengan menambah `?` atau parameter, itu tetap ketahuan.
                    </div>
                  </div>
                )}

                {guideSection === 'progress' && (
                  <div>
                    <h3 style={{color:'#67e8f9',fontSize:18,marginTop:0}}>📊 Cara Baca Progress</h3>

                    <p>Di tab <strong>Tracking Postingan</strong>, ada tabel "Progress Postingan" yang nampilin status semua grup.</p>

                    <h4 style={{color:'#a5f3fc',marginTop:16,fontSize:14}}>Kolom tabel:</h4>
                    <ul style={{paddingLeft:20,lineHeight:1.8}}>
                      <li><strong>Grup</strong> — nama grup Facebook + klub (AC Milan, Liverpool, dll)</li>
                      <li><strong>Member</strong> — nama member yang ngerjain grup itu</li>
                      <li><strong>Siklus 1-4</strong> — 4 kolom siklus, masing-masing ada ikon <strong>G1 G2 V</strong></li>
                      <li><strong>Status</strong> — berapa siklus yang udah selesai (contoh: 2/4)</li>
                    </ul>

                    <h4 style={{color:'#a5f3fc',marginTop:16,fontSize:14}}>Arti warna ikon:</h4>
                    <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{width:22,height:22,borderRadius:4,background:'#1f2937',color:'#374151',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>G1</span>
                        <span>Kosong — belum disubmit</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{width:22,height:22,borderRadius:4,background:'#065f46',color:'#6ee7b7',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>G1</span>
                        <span>Hijau — udah keisi, klik untuk buka post di Facebook</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{width:22,height:22,borderRadius:4,background:'#3b0764',color:'#c084fc',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>V</span>
                        <span>Ungu — slot video yang udah keisi</span>
                      </div>
                    </div>

                    <h4 style={{color:'#a5f3fc',marginTop:16,fontSize:14}}>Kolom Status (paling kanan):</h4>
                    <ul style={{paddingLeft:20}}>
                      <li><strong style={{color:'#374151'}}>0/4</strong> — Belum mulai</li>
                      <li><strong style={{color:'#60a5fa'}}>1/4</strong> — Baru 1 siklus selesai</li>
                      <li><strong style={{color:'#f59e0b'}}>2/4</strong> — Separuh</li>
                      <li><strong style={{color:'#10b981'}}>4/4</strong> — Complete! 🎉</li>
                    </ul>
                  </div>
                )}

                {guideSection === 'faq' && (
                  <div>
                    <h3 style={{color:'#67e8f9',fontSize:18,marginTop:0}}>💬 FAQ (Pertanyaan Umum)</h3>

                    <div style={{marginTop:16}}>
                      <div style={{fontWeight:700,color:'#a5f3fc',marginBottom:4}}>❓ Kenapa link saya ditolak padahal belum pernah submit?</div>
                      <p style={{marginTop:0,marginBottom:12,color:'#9ca3af'}}>Kemungkinan <strong>member lain udah submit link yang sama</strong>, atau kamu submit gambar yang <strong>visualnya mirip</strong> dengan yang udah ada. Sistem dedup 3 lapis berlaku untuk semua member di semua grup.</p>
                    </div>

                    <div>
                      <div style={{fontWeight:700,color:'#a5f3fc',marginBottom:4}}>❓ Salah submit slot (misalnya G1 harusnya G2), gimana cara fix?</div>
                      <p style={{marginTop:0,marginBottom:12,color:'#9ca3af'}}>Pakai tombol <strong>HAPUS</strong> di form submit. Pilih grup + siklus + jenis yang salah, klik Hapus, lalu submit ulang ke slot yang benar. Member cuma bisa hapus punya sendiri, admin bisa hapus punya siapapun.</p>
                    </div>

                    <div>
                      <div style={{fontWeight:700,color:'#a5f3fc',marginBottom:4}}>❓ Kalau saya lupa submit hari ini, bisa submit untuk tanggal kemarin?</div>
                      <p style={{marginTop:0,marginBottom:12,color:'#9ca3af'}}>Bisa. Di form submit, ada kolom <strong>Tanggal</strong> — pilih tanggal yang kamu mau (bukan hari ini). Tapi hati-hati, jangan backdate terlalu jauh karena merusak statistik.</p>
                    </div>

                    <div>
                      <div style={{fontWeight:700,color:'#a5f3fc',marginBottom:4}}>❓ Bagaimana cara ganti password?</div>
                      <p style={{marginTop:0,marginBottom:12,color:'#9ca3af'}}>Klik <strong>🔑 Password</strong> di pojok kanan atas (di header dashboard). Isi password lama, password baru, konfirmasi, klik Simpan.</p>
                    </div>

                    <div>
                      <div style={{fontWeight:700,color:'#a5f3fc',marginBottom:4}}>❓ Dashboard error / blank putih — apa yang harus dilakukan?</div>
                      <p style={{marginTop:0,marginBottom:12,color:'#9ca3af'}}><strong>Hard refresh</strong> dulu (Ctrl+Shift+R). Kalau masih error, logout dan login ulang. Kalau masih nggak jalan, lapor ke admin.</p>
                    </div>

                    <div>
                      <div style={{fontWeight:700,color:'#a5f3fc',marginBottom:4}}>❓ Kenapa saya nggak lihat semua tab yang admin punya?</div>
                      <p style={{marginTop:0,marginBottom:12,color:'#9ca3af'}}>Member cuma bisa akses: Daftar Grup, Data Mingguan, Tracking Postingan. Tab lain (Overview, Analytics, Kelola User, dll) cuma untuk admin.</p>
                    </div>
                  </div>
                )}

                {guideSection === 'trouble' && (
                  <div>
                    <h3 style={{color:'#67e8f9',fontSize:18,marginTop:0}}>🚨 Troubleshooting</h3>

                    <h4 style={{color:'#fcd34d',marginTop:16,fontSize:14}}>🟡 Submit link tapi nggak muncul di tabel</h4>
                    <ul style={{paddingLeft:20,color:'#9ca3af',fontSize:12}}>
                      <li>Cek tanggal yang dipilih — apakah sesuai hari ini?</li>
                      <li>Hard refresh (Ctrl+Shift+R)</li>
                      <li>Cek apakah pesan error muncul di bawah tombol Submit</li>
                    </ul>

                    <h4 style={{color:'#fcd34d',marginTop:16,fontSize:14}}>🟡 "Konten ini sudah dipakai oleh..."</h4>
                    <ul style={{paddingLeft:20,color:'#9ca3af',fontSize:12}}>
                      <li>Ini karena sistem dedup — link udah dipakai member lain</li>
                      <li>Cari konten lain yang <strong>beneran baru</strong></li>
                      <li>Jangan edit link yang sama (tambah `?`, dll) karena tetap ketahuan</li>
                    </ul>

                    <h4 style={{color:'#fcd34d',marginTop:16,fontSize:14}}>🟡 Login gagal / password salah</h4>
                    <ul style={{paddingLeft:20,color:'#9ca3af',fontSize:12}}>
                      <li>Cek Caps Lock</li>
                      <li>Cek apakah username sudah benar (case-sensitive)</li>
                      <li>Kalau lupa password, hubungi admin untuk reset</li>
                    </ul>

                    <h4 style={{color:'#fcd34d',marginTop:16,fontSize:14}}>🟡 Icon post tidak klik-able di tabel</h4>
                    <ul style={{paddingLeft:20,color:'#9ca3af',fontSize:12}}>
                      <li>Kalau warnanya abu-abu, berarti kosong — tidak ada link untuk dibuka</li>
                      <li>Kalau hijau tapi tidak merespon, browser mungkin blokir popup — izinkan popup untuk dashboard</li>
                    </ul>

                    <div style={{marginTop:20,padding:12,background:'#0c1220',borderLeft:'3px solid #06b6d4',borderRadius:4,fontSize:12}}>
                      💡 <strong>Masih bingung?</strong> Hubungi admin langsung. Kasih tahu masalah yang kamu alami + screenshot kalau bisa.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GANTI PASSWORD */}
      {pwModal && (
        <div onClick={()=>setPwModal(false)} style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(2,6,23,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'linear-gradient(180deg,#0f172a 0%,#020617 100%)',border:'2px solid #0891b2',borderRadius:8,padding:24,maxWidth:400,width:'90%',boxShadow:'0 8px 40px rgba(6,182,212,0.3)'}}>
            <h3 style={{color:'#67e8f9',margin:'0 0 16px 0',fontSize:16,fontWeight:900,textTransform:'uppercase',letterSpacing:1}}>Ganti Password</h3>
            <p style={{color:'#9ca3af',fontSize:12,margin:'0 0 16px 0'}}>Akun: <strong style={{color:'#e0f2fe'}}>{user.name}</strong> ({user.role})</p>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label style={{display:'block',fontSize:11,color:'#67e8f9',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Password Lama</label>
                <input type="password" style={S.input} value={pwOld} onChange={e=>setPwOld(e.target.value)} /></div>
              <div><label style={{display:'block',fontSize:11,color:'#67e8f9',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Password Baru</label>
                <input type="password" style={S.input} value={pwNew} onChange={e=>setPwNew(e.target.value)} /></div>
              <div><label style={{display:'block',fontSize:11,color:'#67e8f9',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Konfirmasi Password Baru</label>
                <input type="password" style={S.input} value={pwConfirm} onChange={e=>setPwConfirm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&changePassword()} /></div>
              {pwMsg && <p style={{fontSize:12,color:pwMsg.includes('berhasil')?'#10b981':'#ef4444',margin:'4px 0'}}>{pwMsg}</p>}
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button onClick={changePassword} style={{...S.btn('#065f46'),flex:1,padding:'10px'}}>Simpan</button>
                <button onClick={()=>{setPwModal(false);setPwOld('');setPwNew('');setPwConfirm('');setPwMsg('');}} style={{...S.btn('#374151'),flex:1,padding:'10px'}}>Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={S.tabs} className="dash-tabs">
        {tabs.map(t => <div key={t.id} style={S.tab(tab===t.id)} onClick={() => { setTab(t.id); if(t.id==='weekly') loadWeeklyStats(wsYear, wsMonth); if(t.id==='posttrack') loadPostTracker(ptPeriod); if(t.id==='botqueue') loadTaskQueue(); if(t.id==='users') loadAutoBackups(); if(t.id==='settings') loadSystemStats(); }}>{t.label}</div>)}
      </div>

      <div style={S.main} className="dash-main">

        {/* WARNING BANNER GLOBAL — member progress < 50% setelah jam 18:00 (muncul di SEMUA tab) */}
        {!isAdmin && user && (() => {
          const today = localDateString();
          const hour = new Date().getHours();
          const target = user.daily_target || 0;
          if (target === 0) return null;
          const count = countGroupsForDate(user.name, today, postTracker);
          const pct = (count / target) * 100;
          const cd = getDeadlineCountdown();
          if (hour >= 18 && pct < 50 && cd) {
            return (
              <div style={{background:'#7f1d1d',border:'2px solid #ef4444',padding:16,borderRadius:12,marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:28}}>⚠️</span>
                <div style={{flex:1}}>
                  <div style={{color:'#fca5a5',fontWeight:700,fontSize:14}}>Peringatan: Target belum tercapai!</div>
                  <div style={{color:'#fecaca',fontSize:12,marginTop:4}}>
                    Kamu baru mencapai <strong>{count}</strong> dari target <strong>{target}</strong> grup ({Math.round(pct)}%).
                    Deadline dalam <strong>{cd.hours}j {cd.minutes}m</strong>. Cepat selesaikan!
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* COUNTDOWN DEADLINE GLOBAL — muncul di SEMUA tab untuk admin & member */}
        {(() => {
          const cd = getDeadlineCountdown();
          if (!cd) return null;
          return (
            <div style={{background:'#1a1a2e',border:'1px solid #2d2d5e',padding:'10px 16px',borderRadius:8,marginBottom:16,display:'flex',alignItems:'center',gap:10,fontSize:13}}>
              <span style={{fontSize:18}}>⏰</span>
              <span style={{color:'#9ca3af'}}>Deadline hari ini:</span>
              <span style={{color:'#FFD700',fontWeight:700}}>{cd.hours} jam {cd.minutes} menit lagi</span>
              <span style={{color:'#6b7280',fontSize:11,marginLeft:'auto'}}>(berakhir jam 23:59)</span>
            </div>
          );
        })()}

        {/* OVERVIEW (admin) */}
        {tab === 'overview' && isAdmin && (
          <>
            {/* BOT HEALTH MONITOR */}
            <div style={{...S.box,marginBottom:24,padding:'16px 20px',border:'1px solid #0891b2'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontSize:13,color:'#67e8f9',fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>🤖 Bot Health Monitor</div>
                  <div style={{fontSize:11,color:'#9ca3af',marginTop:4}}>Status worker bot yang jalan di komputer lokal. Auto-refresh tiap 30 detik.</div>
                </div>
                <button onClick={loadBotHealth} disabled={botHealthLoading} style={{...S.btn('#164e63'),padding:'8px 14px',fontSize:11}}>
                  {botHealthLoading ? '⏳' : '🔄'} Refresh
                </button>
              </div>

              {botHealth.length === 0 && !botHealthLoading && (
                <div style={{padding:'20px',textAlign:'center',background:'#020617',borderRadius:6,border:'1px dashed #1f2937'}}>
                  <div style={{fontSize:13,color:'#9ca3af'}}>Belum ada bot worker yang mengirim heartbeat.</div>
                  <div style={{fontSize:11,color:'#6b7280',marginTop:6}}>Restart bot worker di komputer lokal (bot-worker.js / reels-worker.js) untuk mulai monitoring.</div>
                </div>
              )}

              {botHealth.length > 0 && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:12}}>
                  {botHealth.map(w => {
                    const statusColor = w.status === 'active' ? '#10b981'
                                      : w.status === 'stale' ? '#f59e0b'
                                      : w.status === 'down' ? '#ef4444'
                                      : '#6b7280';
                    const statusBg = w.status === 'active' ? '#064e3b'
                                   : w.status === 'stale' ? '#78350f'
                                   : w.status === 'down' ? '#7f1d1d'
                                   : '#1f2937';
                    const statusEmoji = w.status === 'active' ? '🟢'
                                      : w.status === 'stale' ? '🟡'
                                      : w.status === 'down' ? '🔴'
                                      : '⚫';
                    const statusLabel = w.status === 'active' ? 'ACTIVE'
                                      : w.status === 'stale' ? 'STALE'
                                      : w.status === 'down' ? 'DOWN'
                                      : 'NEVER';
                    const ageText = w.age_seconds !== null
                      ? (w.age_seconds < 60 ? `${w.age_seconds}s ago`
                        : w.age_seconds < 3600 ? `${Math.floor(w.age_seconds / 60)}m ago`
                        : `${Math.floor(w.age_seconds / 3600)}h ago`)
                      : 'never';
                    return (
                      <div key={w.worker_id} style={{background:'#0d1117',border:'1px solid '+statusColor,borderRadius:8,padding:14}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                          <div>
                            <div style={{fontSize:13,fontWeight:800,color:'#e0f2fe'}}>{w.worker_name}</div>
                            <div style={{fontSize:10,color:'#6b7280',marginTop:2}}>ID: {w.worker_id}</div>
                          </div>
                          <span style={{padding:'4px 10px',borderRadius:4,fontSize:10,fontWeight:900,background:statusBg,color:statusColor,border:'1px solid '+statusColor}}>
                            {statusEmoji} {statusLabel}
                          </span>
                        </div>
                        <div style={{fontSize:11,color:'#9ca3af',lineHeight:1.6}}>
                          <div><span style={{color:'#6b7280'}}>Heartbeat:</span> <strong style={{color:statusColor}}>{ageText}</strong></div>
                          {w.current_task && <div><span style={{color:'#6b7280'}}>Sedang:</span> <span style={{color:'#67e8f9'}}>{w.current_task}</span></div>}
                          {!w.current_task && w.status === 'active' && <div style={{color:'#6b7280',fontStyle:'italic'}}>Idle (menunggu task)</div>}
                          {w.last_task_info && <div><span style={{color:'#6b7280'}}>Task terakhir:</span> {w.last_task_info}</div>}
                          <div style={{display:'flex',gap:14,marginTop:6,paddingTop:6,borderTop:'1px solid #1f2937'}}>
                            <span><span style={{color:'#6b7280'}}>Total:</span> <strong style={{color:'#e0f2fe'}}>{w.total_tasks_today || 0}</strong></span>
                            <span style={{color:'#10b981'}}>✓ {w.total_success_today || 0}</span>
                            <span style={{color:'#ef4444'}}>✗ {w.total_failed_today || 0}</span>
                          </div>
                          {w.error_message && (
                            <div style={{marginTop:6,padding:6,background:'#7f1d1d',borderRadius:4,color:'#fca5a5',fontSize:10}}>
                              ⚠ {w.error_message}
                            </div>
                          )}
                          {(w.pid || w.hostname) && (
                            <div style={{marginTop:6,fontSize:9,color:'#374151'}}>
                              {w.hostname && <>📦 {w.hostname}</>} {w.pid && <>· PID {w.pid}</>} {w.version && <>· v{w.version}</>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="responsive-stats" style={{marginBottom:24}}>
              <div style={S.stat}><div style={S.num}>{groups.length}</div><div style={S.label}>Grup</div></div>
              <div style={S.stat}><div style={S.num}>{clubs.length}</div><div style={S.label}>Klub</div></div>
              <div style={S.stat}><div style={S.num}>{todayPosts}</div><div style={S.label}>Post Hari Ini</div></div>
              <div style={S.stat}><div style={S.num}>{totalSuccess}</div><div style={S.label}>Total Berhasil</div></div>
              <div style={S.stat}><div style={S.num}>{links.length}</div><div style={S.label}>Link Disubmit</div></div>
              <div style={S.stat}><div style={S.num}>{users.length}</div><div style={S.label}>Users</div></div>
            </div>
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:16,fontSize:16}}>Aktivitas Terakhir</h3>
              {activity.slice(0, 8).map((a, i) => (
                <div key={i} style={{padding:'10px 14px',borderBottom:'1px solid #1f2937',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><span style={{...S.badge(a.type==='video'?'member':'ok'),marginRight:6}}>{a.type||'news'}</span><span style={{fontSize:13}}>{(a.title||'').substring(0,60)}</span></div>
                  <div style={{textAlign:'right',fontSize:11,color:'#6b7280'}}><span style={S.badge(a.success?'ok':'fail')}>{a.success?'OK':'GAGAL'}</span> {a.team||''}</div>
                </div>
              ))}
              {activity.length===0 && <p style={{color:'#6b7280',fontSize:13}}>Belum ada aktivitas</p>}
            </div>
          </>
        )}

        {/* ANALYTICS (admin) */}
        {tab === 'analytics' && isAdmin && (
          <>
            {/* Summary stats */}
            <div className="responsive-stats" style={{marginBottom:20}}>
              <div style={S.stat}>
                <div style={S.num}>{clubStats.reduce((a,c)=>a+c.trackerCycles,0)}</div>
                <div style={S.label}>Total Siklus</div>
              </div>
              <div style={S.stat}>
                <div style={S.num}>{clubStats.reduce((a,c)=>a+c.trackerCompleted,0)}</div>
                <div style={S.label}>Siklus Selesai</div>
              </div>
              <div style={S.stat}>
                <div style={S.num}>{clubStats.reduce((a,c)=>a+c.memberPosts,0)}</div>
                <div style={S.label}>Total Konten Member</div>
              </div>
              <div style={S.stat}>
                <div style={S.num}>{clubStats.reduce((a,c)=>a+c.botPosts,0)}</div>
                <div style={S.label}>Total Post Bot</div>
              </div>
            </div>

            {/* BAR CHART — Top 10 klub by total konten */}
            {clubStats.length > 0 && (
              <div style={{...S.box,marginBottom:20}}>
                <h3 style={{color:'#FFD700',marginBottom:4,fontSize:16}}>Grafik Performa Klub</h3>
                <p style={{color:'#9ca3af',fontSize:11,margin:'0 0 16px 0'}}>Top 10 klub berdasarkan total konten (member + bot). 30 hari terakhir.</p>
                <div style={{display:'flex',gap:6,alignItems:'flex-end',height:200,padding:'0 4px'}}>
                  {clubStats.slice(0, 10).map((c, i) => {
                    const maxVal = Math.max(...clubStats.slice(0, 10).map(x => x.total)) || 1;
                    const heightPct = (c.total / maxVal) * 100;
                    const completeRate = c.trackerCycles > 0 ? Math.round(c.trackerCompleted / c.trackerCycles * 100) : 0;
                    const barColor = completeRate >= 80 ? '#10b981' : completeRate >= 50 ? '#f59e0b' : completeRate > 0 ? '#ef4444' : '#374151';
                    return (
                      <div key={c.club} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                        <span style={{fontSize:10,color:'#e0f2fe',fontWeight:700}}>{c.total}</span>
                        <div
                          title={`${c.club}: ${c.memberPosts} member + ${c.botPosts} bot = ${c.total} total | Complete: ${completeRate}%`}
                          style={{
                            width:'100%',
                            height:`${Math.max(4, heightPct)}%`,
                            background:`linear-gradient(180deg, ${barColor} 0%, ${barColor}88 100%)`,
                            borderRadius:'4px 4px 0 0',
                            cursor:'pointer',
                            transition:'all 0.3s',
                            minHeight:4,
                            border:'1px solid ' + barColor,
                          }}
                        />
                        <span style={{fontSize:9,color:'#9ca3af',textAlign:'center',lineHeight:1.2,maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={c.club}>
                          {c.club.length > 10 ? c.club.substring(0, 10) + '...' : c.club}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:12,fontSize:10,color:'#9ca3af'}}>
                  <span><span style={{display:'inline-block',width:10,height:10,background:'#10b981',borderRadius:2,marginRight:4}}/>Complete ≥80%</span>
                  <span><span style={{display:'inline-block',width:10,height:10,background:'#f59e0b',borderRadius:2,marginRight:4}}/>Complete 50-79%</span>
                  <span><span style={{display:'inline-block',width:10,height:10,background:'#ef4444',borderRadius:2,marginRight:4}}/>Complete {'<'}50%</span>
                </div>
              </div>
            )}

            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:4,fontSize:16}}>Performa Per Klub</h3>
              <p style={{color:'#9ca3af',fontSize:11,margin:'0 0 16px 0'}}>
                Konten Member dihitung dari Tracking Postingan (gambar1 + gambar2 + video per siklus).
                Data bot dari activity_log. 30 hari terakhir.
              </p>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:760}}>
                  <thead>
                    <tr>
                      <th style={S.th}>Klub</th>
                      <th style={{...S.th,textAlign:'center'}}>Grup</th>
                      <th style={{...S.th,textAlign:'center'}}>Siklus<br/><span style={{fontSize:9,fontWeight:400}}>dikerjakan</span></th>
                      <th style={{...S.th,textAlign:'center'}}>Selesai<br/><span style={{fontSize:9,fontWeight:400}}>4/4 lengkap</span></th>
                      <th style={{...S.th,textAlign:'center'}}>Bot</th>
                      <th style={{...S.th,textAlign:'center'}}>Member</th>
                      <th style={{...S.th,textAlign:'center'}}>Total</th>
                      <th style={{...S.th,minWidth:140}}>Rasio Complete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubStats.map(c => {
                      const completeRate = c.trackerCycles > 0 ? Math.round(c.trackerCompleted/c.trackerCycles*100) : 0;
                      return (
                        <tr key={c.club}>
                          <td style={S.td}><strong style={{color:'#e0f2fe'}}>{c.club}</strong></td>
                          <td style={{...S.td,textAlign:'center'}}>{c.groups}</td>
                          <td style={{...S.td,textAlign:'center',color:'#9ca3af'}}>{c.trackerCycles}</td>
                          <td style={{...S.td,textAlign:'center',color:c.trackerCompleted>0?'#10b981':'#6b7280',fontWeight:700}}>{c.trackerCompleted}</td>
                          <td style={{...S.td,textAlign:'center',color:c.botPosts>0?'#60a5fa':'#6b7280'}}>{c.botPosts}</td>
                          <td style={{...S.td,textAlign:'center',color:c.memberPosts>0?'#67e8f9':'#6b7280',fontWeight:600}}>{c.memberPosts}</td>
                          <td style={{...S.td,textAlign:'center',fontWeight:700,color:'#FFD700'}}>{c.total}</td>
                          <td style={S.td}>
                            <div style={{display:'flex',alignItems:'center',gap:6}}>
                              <div style={{flex:1,height:6,background:'#1f2937',borderRadius:3}}>
                                <div style={{width:`${completeRate}%`,height:'100%',background:completeRate>=80?'#10b981':completeRate>=50?'#f59e0b':completeRate>0?'#ef4444':'#374151',borderRadius:3}}/>
                              </div>
                              <span style={{fontSize:11,minWidth:32,textAlign:'right'}}>{completeRate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {clubStats.length === 0 && (
                      <tr><td colSpan={8} style={{...S.td,textAlign:'center',color:'#6b7280',padding:20}}>Belum ada data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* DATA MINGGUAN (semua role) */}
        {tab === 'weekly' && (
          <>
            {/* Navigasi bulan */}
            <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:20,flexWrap:'wrap'}}>
              <button style={S.btn('#374151')} onClick={() => { const nm = wsMonth === 1 ? 12 : wsMonth - 1; const ny = wsMonth === 1 ? wsYear - 1 : wsYear; setWsMonth(nm); setWsYear(ny); loadWeeklyStats(ny, nm); }}>&#9664; Bulan Sebelumnya</button>
              <h3 style={{color:'#FFD700',fontSize:18,margin:'0 8px'}}>{MONTH_NAMES[wsMonth]} {wsYear}</h3>
              <button style={S.btn('#374151')} onClick={() => { const nm = wsMonth === 12 ? 1 : wsMonth + 1; const ny = wsMonth === 12 ? wsYear + 1 : wsYear; setWsMonth(nm); setWsYear(ny); loadWeeklyStats(ny, nm); }}>Bulan Berikutnya &#9654;</button>
              <span style={{fontSize:12,color:'#6b7280',marginLeft:8}}>{weeklyStats.length} data tercatat</span>
            </div>

            {/* Tabel spreadsheet */}
            <div style={{...S.box,padding:0,overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:800}}>
                <thead>
                  <tr>
                    <th style={{...S.th,position:'sticky',left:0,background:'#1f2937',zIndex:2,minWidth:50}}>#</th>
                    <th style={{...S.th,position:'sticky',left:50,background:'#1f2937',zIndex:2,minWidth:200}}>Nama Group</th>
                    <th style={{...S.th,textAlign:'center',minWidth:100,background:'#1a2744'}}>Minggu ke-1</th>
                    <th style={{...S.th,textAlign:'center',minWidth:100,background:'#1a2744'}}>Minggu ke-2</th>
                    <th style={{...S.th,textAlign:'center',minWidth:100,background:'#1a2744'}}>Minggu ke-3</th>
                    <th style={{...S.th,textAlign:'center',minWidth:100,background:'#1a2744'}}>Minggu ke-4</th>
                    <th style={{...S.th,textAlign:'center',minWidth:100,background:'#1a2744'}}>Minggu ke-5</th>
                    <th style={{...S.th,textAlign:'center',minWidth:100,background:'#162415'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g, idx) => {
                    const total = getGroupTotal(g.id);
                    const hasData = total > 0;
                    return (
                      <tr key={g.id} style={{background: hasData ? 'rgba(16,185,129,0.05)' : 'transparent'}}>
                        <td style={{...S.td,position:'sticky',left:0,background:'#111827',zIndex:1,fontWeight:600,color:'#6b7280'}}>{idx+1}</td>
                        <td style={{...S.td,position:'sticky',left:50,background:'#111827',zIndex:1}}>
                          <div style={{fontWeight:600,fontSize:13}}>{g.name}</div>
                          <div style={{fontSize:11,color:'#6b7280'}}>{g.club}</div>
                        </td>
                        {[1,2,3,4,5].map(week => {
                          const val = getWeekValue(g.id, week);
                          const updater = getWeekUpdater(g.id, week);
                          const isEditing = wsEditing?.groupId === g.id && wsEditing?.week === week;

                          return (
                            <td key={week} style={{...S.td,textAlign:'center',padding:4,minWidth:100}}>
                              {isEditing ? (
                                <div style={{display:'flex',gap:2}}>
                                  <input
                                    type="number"
                                    autoFocus
                                    defaultValue={val}
                                    style={{...S.input,padding:'6px 8px',fontSize:13,textAlign:'center',width:80}}
                                    onKeyDown={(e) => { if (e.key === 'Enter') saveWeekValue(g.id, g.name, week, e.target.value); if (e.key === 'Escape') setWsEditing(null); }}
                                    onBlur={(e) => { if (e.target.value !== String(val)) saveWeekValue(g.id, g.name, week, e.target.value); else setWsEditing(null); }}
                                  />
                                </div>
                              ) : (
                                <div
                                  onClick={() => setWsEditing({groupId: g.id, week})}
                                  style={{cursor:'pointer',padding:'6px 4px',borderRadius:4,minHeight:32,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:'1px solid transparent',transition:'all 0.15s'}}
                                  onMouseEnter={e => e.currentTarget.style.borderColor='#374151'}
                                  onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}
                                >
                                  {val ? (
                                    <>
                                      <span style={{fontWeight:700,fontSize:14,color: parseFloat(val) >= 5000 ? '#10b981' : parseFloat(val) >= 1000 ? '#f59e0b' : '#e5e7eb'}}>{Number(val).toLocaleString('id-ID')}</span>
                                      {updater && <span style={{fontSize:9,color:'#6b7280',marginTop:1}}>{updater}</span>}
                                    </>
                                  ) : (
                                    <span style={{color:'#374151',fontSize:12}}>-</span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td style={{...S.td,textAlign:'center',padding:4,background:'rgba(22,36,21,0.3)'}}>
                          {wsEditing?.groupId === g.id && wsEditing?.week === 6 ? (
                            <input
                              type="number"
                              autoFocus
                              defaultValue={total || ''}
                              style={{...S.input,padding:'6px 8px',fontSize:14,textAlign:'center',width:90,fontWeight:700}}
                              onKeyDown={(e) => { if (e.key === 'Enter') saveWeekValue(g.id, g.name, 6, e.target.value); if (e.key === 'Escape') setWsEditing(null); }}
                              onBlur={(e) => { if (e.target.value !== String(total)) saveWeekValue(g.id, g.name, 6, e.target.value); else setWsEditing(null); }}
                            />
                          ) : (
                            <div
                              onClick={() => setWsEditing({groupId: g.id, week: 6})}
                              style={{cursor:'pointer',padding:'6px 4px',borderRadius:4,minHeight:32,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid transparent'}}
                              onMouseEnter={e => e.currentTarget.style.borderColor='#374151'}
                              onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}
                            >
                              <span style={{fontWeight:700,fontSize:15,color: total >= 10000 ? '#10b981' : total >= 5000 ? '#f59e0b' : total > 0 ? '#e5e7eb' : '#374151'}}>
                                {total > 0 ? Number(total).toLocaleString('id-ID') : '-'}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Performa Member */}
            {isAdmin && (
              <div style={{...S.box,marginTop:24}}>
                <h3 style={{color:'#FFD700',marginBottom:16,fontSize:16}}>Performa Member — {MONTH_NAMES[wsMonth]} {wsYear}</h3>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr><th style={S.th}>#</th><th style={S.th}>Member</th><th style={S.th}>Grup Diisi</th><th style={S.th}>Entri</th><th style={S.th}>Total Nilai</th></tr></thead>
                  <tbody>
                    {getMemberStats().map((m, i) => (
                      <tr key={m.name}>
                        <td style={S.td}>{i+1}</td>
                        <td style={{...S.td,fontWeight:600}}>{m.name}</td>
                        <td style={S.td}>{m.groups}</td>
                        <td style={S.td}>{m.entries}</td>
                        <td style={{...S.td,fontWeight:700,color:'#FFD700'}}>{Number(m.totalValue).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                    {getMemberStats().length === 0 && <tr><td colSpan={5} style={{...S.td,textAlign:'center',color:'#6b7280'}}>Belum ada data</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* TRACKING POSTINGAN */}
        {tab === 'posttrack' && (
          <>
            {/* PROGRESS TARGET — visible untuk admin & member, bisa pilih tanggal */}
            <div style={S.box}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,flexWrap:'wrap',gap:12}}>
                <h3 style={{color:'#FFD700',fontSize:16,margin:0}}>
                  Progress Target {ptPeriod === localDateString() ? 'Hari Ini' : new Date(ptPeriod).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                </h3>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <label style={{fontSize:12,color:'#9ca3af'}}>Tanggal:</label>
                  <input type="date" style={{...S.input,width:180}} value={ptPeriod} onChange={e=>{setPtPeriod(e.target.value);loadPostTracker(e.target.value)}} />
                  <button onClick={()=>{const t=localDateString();setPtPeriod(t);loadPostTracker(t);}} style={{...S.btn('#374151'),padding:'8px 14px',fontSize:12}}>Hari Ini</button>
                  {isAdmin && <button onClick={exportProgressCSV} style={{...S.btn('#065f46'),padding:'8px 14px',fontSize:12}}>Export CSV</button>}
                </div>
              </div>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:16}}>
                Target grup harian per member. Klik nama member untuk lihat riwayat 30 hari. Streak = jumlah hari berturut-turut mencapai target.
              </p>
              {(() => {
                const selectedDateTracker = postTracker.filter(p => p.period === ptPeriod);
                const todayTracker = selectedDateTracker;
                const members = users.filter(u => u.role === 'member');
                return (
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead>
                      <tr>
                        <th style={S.th}>#</th>
                        <th style={S.th}>Member</th>
                        <th style={{...S.th,textAlign:'center'}}>Target</th>
                        <th style={{...S.th,textAlign:'center'}}>Tercapai</th>
                        <th style={{...S.th,textAlign:'center'}}>Progress</th>
                        <th style={{...S.th,textAlign:'center'}}>Kategori</th>
                        <th style={{...S.th,textAlign:'center'}}>Streak</th>
                        <th style={{...S.th,textAlign:'center'}}>Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.length === 0 && (
                        <tr><td colSpan={8} style={{...S.td,textAlign:'center',color:'#6b7280'}}>Belum ada member terdaftar</td></tr>
                      )}
                      {members.map((m, i) => {
                        const target = m.daily_target || 0;
                        const memberPosts = todayTracker.filter(p => p.user_name === m.name);
                        const completedGroups = new Set(memberPosts.map(p => p.group_id)).size;
                        const cat = getTargetCategory(completedGroups, target);
                        const pct = target > 0 ? Math.min(100, Math.round((completedGroups / target) * 100)) : 0;
                        const isMe = !isAdmin && user && m.id === user.id;
                        const streak = computeStreak(m.name, target, postTrackerHistory);
                        const note = targetNotes.find(n => n.user_id === m.id && n.period === ptPeriod);
                        return (
                          <tr key={m.id} style={isMe?{background:'#1a2744'}:undefined}>
                            <td style={S.td}>{i+1}</td>
                            <td style={{...S.td,fontWeight:600,cursor:'pointer',color:'#60a5fa'}} onClick={()=>setHistoryModal(m)}>
                              {m.name}{isMe && <span style={{marginLeft:6,fontSize:10,color:'#FFD700'}}>(Kamu)</span>}
                            </td>
                            <td style={{...S.td,textAlign:'center'}}>{target || '-'}</td>
                            <td style={{...S.td,textAlign:'center',fontWeight:700,color:cat.color}}>{completedGroups}</td>
                            <td style={{...S.td,textAlign:'center'}}>
                              <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
                                <div style={{width:120,height:8,background:'#1f2937',borderRadius:4,overflow:'hidden'}}>
                                  <div style={{width:`${pct}%`,height:'100%',background:cat.color,borderRadius:4}}/>
                                </div>
                                <span style={{fontSize:11,color:cat.color,fontWeight:600,minWidth:35}}>{pct}%</span>
                              </div>
                            </td>
                            <td style={{...S.td,textAlign:'center'}}>
                              <span style={{padding:'4px 12px',borderRadius:6,fontSize:11,fontWeight:700,background:cat.bg,color:cat.color,border:`1px solid ${cat.color}`}}>
                                {cat.label}
                              </span>
                            </td>
                            <td style={{...S.td,textAlign:'center'}}>
                              {streak > 0 ? (
                                <span style={{padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700,background:'#7c2d12',color:'#fb923c'}}>
                                  🔥 {streak} hari
                                </span>
                              ) : <span style={{color:'#6b7280',fontSize:11}}>-</span>}
                            </td>
                            <td style={{...S.td,textAlign:'center',fontSize:11,color:'#9ca3af',maxWidth:150}}>
                              {note ? <span title={note.reason}>{note.reason.substring(0, 25)}{note.reason.length > 25 ? '...' : ''}</span> : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}

              {/* Form catatan untuk member sendiri */}
              {!isAdmin && user && (() => {
                const existingNote = targetNotes.find(n => n.user_id === user.id && n.period === ptPeriod);
                const target = user.daily_target || 0;
                if (target === 0) return null;
                const count = countGroupsForDate(user.name, ptPeriod, postTracker);
                if (count >= target) return null; // target tercapai, tidak perlu catatan
                return (
                  <div style={{marginTop:16,padding:16,background:'#0d1117',borderRadius:8,border:'1px solid #1f2937'}}>
                    <h4 style={{color:'#9ca3af',fontSize:13,marginBottom:8,marginTop:0}}>
                      {existingNote ? 'Edit Catatan/Alasan kamu' : 'Tulis Alasan (kalau target tidak tercapai)'}
                    </h4>
                    <textarea
                      style={{...S.input,minHeight:60,resize:'vertical'}}
                      placeholder="Contoh: Sakit, listrik mati, dll..."
                      value={noteReason || existingNote?.reason || ''}
                      onChange={e=>setNoteReason(e.target.value)}
                    />
                    <div style={{display:'flex',gap:10,marginTop:8,alignItems:'center'}}>
                      <button onClick={()=>saveTargetNote(ptPeriod)} style={{...S.btn('#065f46'),padding:'8px 16px',fontSize:12}}>Simpan Catatan</button>
                      {noteMsg && <span style={{fontSize:12,color:noteMsg.includes('Error')?'#ef4444':'#10b981'}}>{noteMsg}</span>}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* LEADERBOARD MINGGUAN & BULANAN */}
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:8,fontSize:16}}>🏆 Leaderboard Performa Member</h3>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:16}}>
                Ranking berdasarkan rata-rata persentase pencapaian dalam periode tertentu.
              </p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {/* Mingguan */}
                <div style={{background:'#0d1117',borderRadius:8,padding:16,border:'1px solid #1f2937'}}>
                  <h4 style={{color:'#60a5fa',fontSize:14,marginTop:0,marginBottom:12}}>📅 Mingguan (7 hari)</h4>
                  {(() => {
                    const members = users.filter(u => u.role === 'member');
                    const ranked = members
                      .map(m => ({ ...m, avg: computeAvgPerformance(m.name, m.daily_target, postTrackerHistory, 7) }))
                      .sort((a, b) => b.avg - a.avg);
                    return ranked.map((m, i) => {
                      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
                      const cat = getTargetCategory(m.avg, 100);
                      return (
                        <div key={m.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i < ranked.length-1 ? '1px solid #1f2937' : 'none'}}>
                          <span style={{fontSize:18,minWidth:30}}>{medal}</span>
                          <span style={{flex:1,fontSize:13,fontWeight:600}}>{m.name}</span>
                          <div style={{width:100,height:6,background:'#1f2937',borderRadius:3,overflow:'hidden'}}>
                            <div style={{width:`${m.avg}%`,height:'100%',background:cat.color,borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:12,color:cat.color,fontWeight:700,minWidth:40,textAlign:'right'}}>{m.avg}%</span>
                        </div>
                      );
                    });
                  })()}
                </div>
                {/* Bulanan */}
                <div style={{background:'#0d1117',borderRadius:8,padding:16,border:'1px solid #1f2937'}}>
                  <h4 style={{color:'#c084fc',fontSize:14,marginTop:0,marginBottom:12}}>🗓️ Bulanan (30 hari)</h4>
                  {(() => {
                    const members = users.filter(u => u.role === 'member');
                    const ranked = members
                      .map(m => ({ ...m, avg: computeAvgPerformance(m.name, m.daily_target, postTrackerHistory, 30) }))
                      .sort((a, b) => b.avg - a.avg);
                    return ranked.map((m, i) => {
                      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
                      const cat = getTargetCategory(m.avg, 100);
                      return (
                        <div key={m.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i < ranked.length-1 ? '1px solid #1f2937' : 'none'}}>
                          <span style={{fontSize:18,minWidth:30}}>{medal}</span>
                          <span style={{flex:1,fontSize:13,fontWeight:600}}>{m.name}</span>
                          <div style={{width:100,height:6,background:'#1f2937',borderRadius:3,overflow:'hidden'}}>
                            <div style={{width:`${m.avg}%`,height:'100%',background:cat.color,borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:12,color:cat.color,fontWeight:700,minWidth:40,textAlign:'right'}}>{m.avg}%</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* HISTORY MODAL — popup klik nama member */}
            {historyModal && (
              <div onClick={()=>setHistoryModal(null)} style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
                <div onClick={e=>e.stopPropagation()} style={{background:'#111827',border:'1px solid #1f2937',borderRadius:12,padding:24,maxWidth:900,width:'100%',maxHeight:'90vh',overflow:'auto'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                    <h3 style={{color:'#FFD700',fontSize:18,margin:0}}>📊 Riwayat 30 Hari — {historyModal.name}</h3>
                    <button onClick={()=>setHistoryModal(null)} style={{...S.btn('#7f1d1d'),padding:'6px 12px'}}>Tutup</button>
                  </div>
                  {(() => {
                    const target = historyModal.daily_target || 0;
                    const days = [];
                    const now = new Date();
                    for (let i = 0; i < 30; i++) {
                      const d = new Date(now);
                      d.setDate(d.getDate() - i);
                      const dateKey = localDateString(d);
                      const count = countGroupsForDate(historyModal.name, dateKey, postTrackerHistory);
                      const pct = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
                      days.push({ date: dateKey, count, pct, cat: getTargetCategory(count, target) });
                    }

                    // Statistik
                    const totalGroups = days.reduce((s, d) => s + d.count, 0);
                    const avgPct = Math.round(days.reduce((s, d) => s + d.pct, 0) / days.length);
                    const bestDay = days.reduce((b, d) => d.count > b.count ? d : b, days[0]);
                    const worstDay = days.reduce((w, d) => d.count < w.count ? d : w, days[0]);
                    const onTargetDays = days.filter(d => target > 0 && d.count >= target).length;
                    const streak = computeStreak(historyModal.name, target, postTrackerHistory);

                    return (
                      <>
                        {/* Summary cards */}
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,marginBottom:20}}>
                          <div style={{background:'#0d1117',padding:12,borderRadius:8,border:'1px solid #1f2937'}}>
                            <div style={{fontSize:11,color:'#6b7280'}}>Target Harian</div>
                            <div style={{fontSize:20,fontWeight:700,color:'#FFD700'}}>{target || '-'}</div>
                          </div>
                          <div style={{background:'#0d1117',padding:12,borderRadius:8,border:'1px solid #1f2937'}}>
                            <div style={{fontSize:11,color:'#6b7280'}}>Total Grup</div>
                            <div style={{fontSize:20,fontWeight:700,color:'#60a5fa'}}>{totalGroups}</div>
                          </div>
                          <div style={{background:'#0d1117',padding:12,borderRadius:8,border:'1px solid #1f2937'}}>
                            <div style={{fontSize:11,color:'#6b7280'}}>Rata-rata</div>
                            <div style={{fontSize:20,fontWeight:700,color:'#10b981'}}>{avgPct}%</div>
                          </div>
                          <div style={{background:'#0d1117',padding:12,borderRadius:8,border:'1px solid #1f2937'}}>
                            <div style={{fontSize:11,color:'#6b7280'}}>Hari On-Target</div>
                            <div style={{fontSize:20,fontWeight:700,color:'#c084fc'}}>{onTargetDays}/30</div>
                          </div>
                          <div style={{background:'#0d1117',padding:12,borderRadius:8,border:'1px solid #1f2937'}}>
                            <div style={{fontSize:11,color:'#6b7280'}}>Streak Saat Ini</div>
                            <div style={{fontSize:20,fontWeight:700,color:'#fb923c'}}>🔥 {streak}</div>
                          </div>
                          <div style={{background:'#0d1117',padding:12,borderRadius:8,border:'1px solid #1f2937'}}>
                            <div style={{fontSize:11,color:'#6b7280'}}>Hari Terbaik</div>
                            <div style={{fontSize:16,fontWeight:700,color:'#10b981'}}>{bestDay.count} grup</div>
                            <div style={{fontSize:10,color:'#6b7280'}}>{new Date(bestDay.date).toLocaleDateString('id-ID')}</div>
                          </div>
                        </div>

                        {/* Daily bar chart */}
                        <div>
                          <h4 style={{color:'#9ca3af',fontSize:13,marginBottom:10}}>Grafik Harian (30 hari terakhir)</h4>
                          <div style={{display:'flex',gap:3,alignItems:'flex-end',height:120,padding:'0 4px'}}>
                            {days.slice().reverse().map((d, i) => (
                              <div key={i} title={`${d.date}: ${d.count} grup (${d.pct}%)`} style={{flex:1,minWidth:14,height:`${Math.max(4, d.pct)}%`,background:d.cat.color,borderRadius:'3px 3px 0 0',cursor:'pointer',opacity:d.count === 0 ? 0.3 : 1}}/>
                            ))}
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#6b7280',marginTop:6}}>
                            <span>30 hari lalu</span>
                            <span>Hari ini</span>
                          </div>
                        </div>

                        {/* Tabel detail 30 hari */}
                        <div style={{marginTop:20,maxHeight:300,overflow:'auto'}}>
                          <table style={{width:'100%',borderCollapse:'collapse'}}>
                            <thead>
                              <tr>
                                <th style={S.th}>Tanggal</th>
                                <th style={{...S.th,textAlign:'center'}}>Tercapai</th>
                                <th style={{...S.th,textAlign:'center'}}>%</th>
                                <th style={{...S.th,textAlign:'center'}}>Kategori</th>
                              </tr>
                            </thead>
                            <tbody>
                              {days.map(d => (
                                <tr key={d.date}>
                                  <td style={{...S.td,fontSize:12}}>{new Date(d.date).toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short'})}</td>
                                  <td style={{...S.td,textAlign:'center',fontWeight:700,color:d.cat.color}}>{d.count}</td>
                                  <td style={{...S.td,textAlign:'center'}}>{d.pct}%</td>
                                  <td style={{...S.td,textAlign:'center'}}>
                                    <span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:600,background:d.cat.bg,color:d.cat.color}}>{d.cat.label}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Form submit */}
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:8,fontSize:16}}>Submit Postingan</h3>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:16}}>Target per grup: <strong>4 siklus</strong> (2 gambar + 1 video = 1 siklus)</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Grup</label>
                  <select style={S.input} value={ptGroup} onChange={e=>setPtGroup(e.target.value)}>
                    <option value="">Pilih Grup</option>
                    {groups.map(g=><option key={g.id} value={g.id}>{g.name} ({g.club})</option>)}
                  </select>
                </div>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Siklus ke-</label>
                  <select style={S.input} value={ptCycle} onChange={e=>setPtCycle(parseInt(e.target.value))}>
                    <option value={1}>Siklus 1</option><option value={2}>Siklus 2</option>
                    <option value={3}>Siklus 3</option><option value={4}>Siklus 4</option>
                  </select>
                </div>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Jenis</label>
                  <select style={S.input} value={ptType} onChange={e=>setPtType(e.target.value)}>
                    <option value="gambar1">Gambar 1</option><option value="gambar2">Gambar 2</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:10,alignItems:'end'}}>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Link Postingan</label>
                  <input style={S.input} placeholder="https://www.facebook.com/groups/.../posts/..." value={ptLink} onChange={e=>setPtLink(e.target.value)} /></div>
                <button onClick={submitPostLink} style={{...S.btn('#065f46'),padding:'10px 24px'}}>Submit</button>
                <button onClick={deletePostField} style={{...S.btn('#991b1b'),padding:'10px 18px'}} title="Hapus slot yang dipilih di atas (Grup + Siklus + Jenis)">Hapus</button>
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center',marginTop:10}}>
                <label style={{fontSize:12,color:'#9ca3af'}}>Tanggal:</label>
                <input type="date" style={{...S.input,width:180}} value={ptPeriod} onChange={e=>{setPtPeriod(e.target.value);loadPostTracker(e.target.value)}} />
              </div>
              {ptMsg && <p style={{marginTop:8,fontSize:13,color:ptMsg.includes('Error')?'#ef4444':'#10b981'}}>{ptMsg}</p>}
            </div>

            {/* Tabel tracking per grup */}
            <div style={{...S.box,padding:0,overflow:'auto'}}>
              <div style={{padding:'16px 20px',borderBottom:'1px solid #1f2937'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
                  <h3 style={{color:'#FFD700',fontSize:16,margin:0}}>Progress Postingan — {new Date(ptPeriod).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h3>
                  <input style={{...S.input,width:220,fontSize:11}} placeholder="🔍 Cari grup / member..." value={searchTracking} onChange={e=>setSearchTracking(e.target.value)}/>
                </div>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                <thead>
                  <tr>
                    <th style={S.th}>#</th>
                    <th style={{...S.th,minWidth:180}}>Grup</th>
                    <th style={{...S.th,minWidth:60}}>Member</th>
                    <th style={{...S.th,textAlign:'center',background:'#1a2744'}}>Siklus 1<br/><span style={{fontSize:10,fontWeight:400}}>G1 G2 V</span></th>
                    <th style={{...S.th,textAlign:'center',background:'#1a2744'}}>Siklus 2<br/><span style={{fontSize:10,fontWeight:400}}>G1 G2 V</span></th>
                    <th style={{...S.th,textAlign:'center',background:'#1a2744'}}>Siklus 3<br/><span style={{fontSize:10,fontWeight:400}}>G1 G2 V</span></th>
                    <th style={{...S.th,textAlign:'center',background:'#1a2744'}}>Siklus 4<br/><span style={{fontSize:10,fontWeight:400}}>G1 G2 V</span></th>
                    <th style={{...S.th,textAlign:'center',background:'#162415'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.filter(g => {
                    if (!searchTracking) return true;
                    const q = searchTracking.toLowerCase();
                    const memberName = postTracker.find(p => p.group_id === g.id)?.user_name || '';
                    return g.name.toLowerCase().includes(q) || g.club.toLowerCase().includes(q) || memberName.toLowerCase().includes(q);
                  }).map((g, idx) => {
                    const gEntries = postTracker.filter(p => p.group_id === g.id);
                    const completeCycles = gEntries.filter(p => p.is_complete).length;
                    const memberName = gEntries.length > 0 ? gEntries[0].user_name : '-';
                    return (
                      <tr key={g.id}>
                        <td style={S.td}>{idx+1}</td>
                        <td style={S.td}><div style={{fontWeight:600,fontSize:13}}>{g.name}</div><div style={{fontSize:11,color:'#6b7280'}}>{g.club}</div></td>
                        <td style={{...S.td,fontSize:12,color:'#9ca3af'}}>{memberName}</td>
                        {[1,2,3,4].map(cycle => {
                          const entry = gEntries.find(p => p.cycle === cycle);
                          const g1 = entry?.gambar1_link;
                          const g2 = entry?.gambar2_link;
                          const v = entry?.video_link;
                          return (
                            <td key={cycle} style={{...S.td,textAlign:'center',padding:6}}>
                              <div style={{display:'flex',gap:4,justifyContent:'center'}}>
                                <span title={resolveBotLink(g1)||'Belum'} style={{width:22,height:22,borderRadius:4,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,background:g1?'#065f46':'#1f2937',color:g1?'#6ee7b7':'#374151',cursor:g1?'pointer':'default'}} onClick={()=>g1&&window.open(resolveBotLink(g1),'_blank')}>G1</span>
                                <span title={resolveBotLink(g2)||'Belum'} style={{width:22,height:22,borderRadius:4,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,background:g2?'#065f46':'#1f2937',color:g2?'#6ee7b7':'#374151',cursor:g2?'pointer':'default'}} onClick={()=>g2&&window.open(resolveBotLink(g2),'_blank')}>G2</span>
                                <span title={resolveBotLink(v)||'Belum'} style={{width:22,height:22,borderRadius:4,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,background:v?'#3b0764':'#1f2937',color:v?'#c084fc':'#374151',cursor:v?'pointer':'default'}} onClick={()=>v&&window.open(resolveBotLink(v),'_blank')}>V</span>
                              </div>
                            </td>
                          );
                        })}
                        <td style={{...S.td,textAlign:'center'}}>
                          <span style={{fontSize:13,fontWeight:700,color: completeCycles>=4?'#10b981':completeCycles>=2?'#f59e0b':completeCycles>=1?'#60a5fa':'#374151'}}>
                            {completeCycles}/4
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary member (admin) */}
            {isAdmin && (
              <div style={{...S.box,marginTop:24}}>
                <h3 style={{color:'#FFD700',marginBottom:16,fontSize:16}}>Performa Member — {new Date(ptPeriod).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</h3>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr><th style={S.th}>#</th><th style={S.th}>Member</th><th style={S.th}>Grup</th><th style={S.th}>Gambar</th><th style={S.th}>Video</th><th style={S.th}>Siklus Selesai</th><th style={S.th}>Target (4/grup)</th><th style={S.th}>Progress</th></tr></thead>
                  <tbody>
                    {getMemberPostSummary().map((m, i) => {
                      const target = m.groups * 4;
                      const pct = target > 0 ? Math.round(m.completeCycles / target * 100) : 0;
                      return (
                        <tr key={m.name}>
                          <td style={S.td}>{i+1}</td>
                          <td style={{...S.td,fontWeight:600}}>{m.name}</td>
                          <td style={S.td}>{m.groups}</td>
                          <td style={S.td}>{m.gambar}</td>
                          <td style={S.td}>{m.video}</td>
                          <td style={{...S.td,fontWeight:700,color:'#FFD700'}}>{m.completeCycles}</td>
                          <td style={S.td}>{target}</td>
                          <td style={S.td}><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:80,height:6,background:'#1f2937',borderRadius:3}}><div style={{width:`${pct}%`,height:'100%',background:pct>=80?'#10b981':pct>=50?'#f59e0b':'#ef4444',borderRadius:3}}/></div><span style={{fontSize:11}}>{pct}%</span></div></td>
                        </tr>
                      );
                    })}
                    {getMemberPostSummary().length === 0 && <tr><td colSpan={8} style={{...S.td,textAlign:'center',color:'#6b7280'}}>Belum ada data</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* JALANKAN BOT — admin only */}
        {tab === 'botqueue' && isAdmin && (
          <>
            {/* Kelola Akun Bot GRUP */}
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:8,fontSize:16}}>Kelola Akun Bot Grup</h3>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:16}}>Tambah, edit, atau hapus akun Facebook untuk bot grup. Akun bot reels dikelola di tab "Reels Bot".</p>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:10,marginBottom:10,alignItems:'end'}}>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>ID Akun (nomor HP/email)</label>
                  <input style={S.input} placeholder="895375028123" value={bgId} onChange={e=>setBgId(e.target.value)} /></div>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Nama Profil</label>
                  <input style={S.input} placeholder="Nasywa Zahra" value={bgName} onChange={e=>setBgName(e.target.value)} /></div>
                {bgEditing ? (
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={updateGrupAccount} style={{...S.btn('#065f46'),padding:'10px 14px'}}>Simpan</button>
                    <button onClick={()=>{setBgEditing(null);setBgId('');setBgName('');setBgNotes('');}} style={{...S.btn('#374151'),padding:'10px 14px'}}>Batal</button>
                  </div>
                ) : (
                  <button onClick={addGrupAccount} style={{...S.btn('#065f46'),padding:'10px 18px'}}>Tambah</button>
                )}
              </div>
              <div style={{marginBottom:10}}>
                <input style={S.input} placeholder="Catatan (opsional)" value={bgNotes} onChange={e=>setBgNotes(e.target.value)} />
              </div>
              {bgMsg && <p style={{fontSize:13,color:bgMsg.includes('Error')?'#ef4444':'#10b981'}}>{bgMsg}</p>}

              {/* Tabel akun grup */}
              <table style={{width:'100%',borderCollapse:'collapse',marginTop:16}}>
                <thead>
                  <tr>
                    <th style={S.th}>#</th>
                    <th style={S.th}>Nama</th>
                    <th style={S.th}>ID Akun</th>
                    <th style={S.th}>🔗 Partner (cycle 3-4)</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Total Post</th>
                    <th style={S.th}>Catatan</th>
                    <th style={S.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {botAccounts.filter(a => a.account_type === 'grup' || a.account_type === 'both').map((a, i) => {
                    const grupAccs = botAccounts.filter(x => (x.account_type === 'grup' || x.account_type === 'both') && x.account_id !== a.account_id);
                    const partner = a.partner_account_id ? botAccounts.find(x => x.account_id === a.partner_account_id) : null;
                    return (
                    <tr key={a.id}>
                      <td style={S.td}>{i+1}</td>
                      <td style={{...S.td,fontWeight:600}}>{a.account_name}</td>
                      <td style={{...S.td,fontSize:12,color:'#9ca3af'}}>{a.account_id}</td>
                      <td style={{...S.td,fontSize:12}}>
                        <select
                          value={a.partner_account_id || ''}
                          onChange={e => setAccountPartner(a.account_id, e.target.value)}
                          style={{background:partner?'#1e3a8a':'#0d1117',border:`1px solid ${partner?'#60a5fa':'#1e293b'}`,borderRadius:4,padding:'3px 6px',fontSize:11,color:partner?'#dbeafe':'#9ca3af',cursor:'pointer',width:'100%'}}>
                          <option value="">— Tidak Ada —</option>
                          {grupAccs.map(x => (
                            <option key={x.id} value={x.account_id}>🔗 {x.account_name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={S.td}>
                        <span onClick={()=>toggleBotAccount(a.id,a.is_active)} style={{cursor:'pointer',padding:'2px 8px',borderRadius:4,fontSize:11,fontWeight:600,background:a.is_active?'#065f46':'#7f1d1d',color:a.is_active?'#6ee7b7':'#fca5a5'}}>
                          {a.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={{...S.td,textAlign:'center'}}>{a.total_posts || 0}</td>
                      <td style={{...S.td,fontSize:12,color:'#6b7280'}}>{a.notes || '-'}</td>
                      <td style={S.td}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>startEditGrupAccount(a)} style={{...S.btn('#1e3a5f'),fontSize:11,padding:'4px 8px'}}>Edit</button>
                          <button onClick={()=>deleteBotAccount(a.id)} style={{...S.btn('#7f1d1d'),fontSize:11,padding:'4px 8px'}}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                  {botAccounts.filter(a => a.account_type === 'grup' || a.account_type === 'both').length === 0 && <tr><td colSpan={8} style={{...S.td,textAlign:'center',color:'#6b7280'}}>Belum ada akun grup. Tambahkan di atas.</td></tr>}
                </tbody>
              </table>
            </div>

            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:8,fontSize:16}}>Buat Tugas Posting</h3>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:16}}>Pilih akun bot grup, pilih grup tujuan, bot akan posting atas nama akun tersebut.</p>

              {/* Selector akun bot grup */}
              <label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:8}}>Pilih Akun Bot Grup</label>
              {grupAccounts.length === 0 ? (
                <p style={{color:'#fbbf24',fontSize:13,padding:12,background:'#1a1a2e',borderRadius:8,border:'1px solid #2d2d5e',marginBottom:16}}>
                  Belum ada akun grup aktif. Tambahkan di section atas.
                </p>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:`repeat(auto-fill, minmax(220px, 1fr))`,gap:10,marginBottom:16}}>
                  {grupAccounts.map(acc => {
                    const partner = acc.partner_account_id
                      ? grupAccounts.find(a => a.account_id === acc.partner_account_id)
                      : null;
                    return (
                      <div key={acc.id} onClick={()=>selectGrupAccount(acc.account_id)} style={{cursor:'pointer',background:tqAccountId===acc.account_id?'#1e3a5f':'#1a1a2e',border:`2px solid ${tqAccountId===acc.account_id?'#60a5fa':'#2d2d5e'}`,borderRadius:10,padding:12,position:'relative'}}>
                        <div style={{fontSize:14,fontWeight:700,color:tqAccountId===acc.account_id?'#60a5fa':'#e5e7eb'}}>{acc.account_name}</div>
                        <div style={{fontSize:11,color:'#6b7280'}}>ID: {acc.account_id}</div>
                        <div style={{fontSize:10,color:'#6b7280'}}>Total: {acc.total_posts || 0} posting</div>
                        {partner && (
                          <div style={{marginTop:6,padding:'3px 8px',background:'#1e3a8a',border:'1px solid #60a5fa',borderRadius:6,fontSize:10,color:'#dbeafe',fontWeight:600,display:'inline-block'}}>
                            🔗 Partner: {partner.account_name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Nama Member (pilih dari daftar user)</label>
                  <select style={S.input} value={tqMember} onChange={e=>setTqMember(e.target.value)}>
                    <option value="">— Pilih Member —</option>
                    {users.map(u => (
                      <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Jenis Posting</label>
                  <select style={S.input} value={tqType} onChange={e=>setTqType(e.target.value)}>
                    <option value="full">2 Berita + 1 Video (Full)</option>
                    <option value="news">2 Berita Saja</option>
                    <option value="video">1 Video Saja</option>
                  </select>
                </div>
              </div>

              {/* Pilih Siklus (target_cycle) */}
              <div style={{marginBottom:12}}>
                <label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Siklus Target</label>
                <select style={S.input} value={tqCycle} onChange={e=>setTqCycle(e.target.value)}>
                  <option value="auto">Auto (bot pilih siklus berikutnya yang belum selesai)</option>
                  <option value="1">Siklus 1 — paksa post ke cycle 1</option>
                  <option value="2">Siklus 2 — paksa post ke cycle 2</option>
                  <option value="3">Siklus 3 — paksa post ke cycle 3</option>
                  <option value="4">Siklus 4 — paksa post ke cycle 4</option>
                </select>
                <p style={{fontSize:11,color:'#6b7280',marginTop:4}}>
                  💡 Auto = bot otomatis isi slot kosong di cycle terdekat. Manual = override ke cycle spesifik (override slot di cycle itu kalau sudah ada).
                </p>
              </div>

              <label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:8}}>Pilih Grup ({tqGroups.length} dipilih)</label>
              <div style={{marginBottom:10}}>
                <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:13,color:'#FFD700',marginBottom:8}}>
                  <input type="checkbox" checked={tqSelectAll} onChange={toggleSelectAll} /> Pilih Semua Grup
                </label>
              </div>
              <div style={{maxHeight:300,overflowY:'auto',background:'#0d1117',borderRadius:8,padding:8,border:'1px solid #1f2937'}}>
                {groups.map(g => (
                  <label key={g.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 8px',cursor:'pointer',fontSize:13,borderRadius:4,background:tqGroups.includes(g.id)?'#1a2744':'transparent'}}>
                    <input type="checkbox" checked={tqGroups.includes(g.id)} onChange={()=>toggleGroupSelect(g.id)} />
                    <span style={{color:tqGroups.includes(g.id)?'#60a5fa':'#9ca3af'}}>{g.name}</span>
                    <span style={{fontSize:11,color:'#6b7280',marginLeft:'auto'}}>{g.club}</span>
                  </label>
                ))}
              </div>

              {/* Status Siklus Hari Ini (untuk grup yang dipilih) */}
              {tqGroups.length > 0 && Object.keys(tqCycleStatus).length > 0 && (
                <div style={{marginTop:14,padding:10,background:'#0d1117',borderRadius:8,border:'1px solid #1f2937'}}>
                  <div style={{fontSize:12,color:'#FFD700',marginBottom:8,fontWeight:600}}>📊 Status Siklus Hari Ini ({localDateString()})</div>
                  <div style={{maxHeight:200,overflowY:'auto'}}>
                    {tqGroups.map(gid => {
                      const grp = groups.find(g => g.id === gid);
                      const stat = tqCycleStatus[gid] || {};
                      return (
                        <div key={gid} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',fontSize:12,borderBottom:'1px solid #1f2937'}}>
                          <span style={{flex:'0 0 180px',color:'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{grp?.name || gid}</span>
                          {[1,2,3,4].map(c => {
                            const s = stat[c] || {g1:false,g2:false,v:false};
                            const filled = (s.g1?1:0) + (s.g2?1:0) + (s.v?1:0);
                            const color = filled === 3 ? '#10b981' : filled > 0 ? '#f59e0b' : '#374151';
                            return (
                              <span key={c} title={`Cycle ${c}: G1=${s.g1?'✓':'✗'} G2=${s.g2?'✓':'✗'} V=${s.v?'✓':'✗'}`}
                                style={{flex:'0 0 auto',padding:'2px 8px',borderRadius:4,background:`${color}22`,border:`1px solid ${color}`,color,fontSize:11,fontWeight:600}}>
                                C{c} {filled}/3
                              </span>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{display:'flex',gap:10,marginTop:16,flexWrap:'wrap',alignItems:'center'}}>
                <button onClick={createTasks} style={{...S.btn('#065f46'),padding:'12px 32px',fontSize:14}}>Buat {tqGroups.length} Tugas {tqCycle !== 'auto' ? `(→ Cycle ${tqCycle})` : ''}</button>
                <span style={{color:'#6b7280',fontSize:12}}>atau</span>
                <button
                  onClick={previewBulkTasks}
                  disabled={tqBulkBusy}
                  title="1 klik bikin 4 cycle × semua grup yang udah di-setup primary_account, auto-distribute pair (cycle 1+2 ke akun A, 3+4 ke partner)"
                  style={{...S.btn('#7c3aed'),padding:'12px 24px',fontSize:14,opacity:tqBulkBusy?0.6:1}}
                >
                  {tqBulkBusy ? '⏳ Memproses...' : '🚀 Bulk Generate Today'}
                </button>
              </div>
              <p style={{marginTop:8,fontSize:11,color:'#6b7280'}}>
                💡 <b>Bulk Generate</b> pakai member <code style={{color:'#a78bfa'}}>{tqMember || '(belum dipilih)'}</code> &amp; tipe <code style={{color:'#a78bfa'}}>{tqType}</code>. Auto-distribute: cycle 1+2 ke primary, cycle 3+4 ke partner. Grup tanpa primary akun otomatis di-skip.
              </p>
              {tqMsg && <p style={{marginTop:10,fontSize:13,color:tqMsg.includes('Error')?'#ef4444':'#10b981'}}>{tqMsg}</p>}
            </div>

            {/* MODAL: Bulk Generate Preview */}
            {tqBulkPreview && (
              <div onClick={()=>setTqBulkPreview(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
                <div onClick={e=>e.stopPropagation()} style={{background:'#0f172a',border:'2px solid #7c3aed',borderRadius:12,padding:24,maxWidth:720,width:'100%',maxHeight:'85vh',overflow:'auto'}}>
                  <h3 style={{color:'#a78bfa',marginTop:0,marginBottom:8,fontSize:18}}>🚀 Bulk Generate Preview</h3>
                  <p style={{color:'#9ca3af',fontSize:13,marginTop:0,marginBottom:16}}>
                    Member: <b style={{color:'#e5e7eb'}}>{tqMember}</b> · Tipe: <b style={{color:'#e5e7eb'}}>{tqType}</b>
                  </p>

                  {/* Summary stats */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
                    <div style={{background:'#064e3b',padding:12,borderRadius:8,textAlign:'center'}}>
                      <div style={{fontSize:24,fontWeight:700,color:'#10b981'}}>{tqBulkPreview.tasks.length}</div>
                      <div style={{fontSize:11,color:'#a7f3d0'}}>Tugas akan dibuat</div>
                    </div>
                    <div style={{background:'#422006',padding:12,borderRadius:8,textAlign:'center'}}>
                      <div style={{fontSize:24,fontWeight:700,color:'#f59e0b'}}>{tqBulkPreview.skipped.length}</div>
                      <div style={{fontSize:11,color:'#fde68a'}}>Skip (sudah ada hari ini)</div>
                    </div>
                    <div style={{background:'#3f1d1d',padding:12,borderRadius:8,textAlign:'center'}}>
                      <div style={{fontSize:24,fontWeight:700,color:'#ef4444'}}>{tqBulkPreview.unmapped.length}</div>
                      <div style={{fontSize:11,color:'#fca5a5'}}>Grup belum di-setup</div>
                    </div>
                  </div>

                  {/* Distribution per pair */}
                  {tqBulkPreview.tasks.length > 0 && (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:12,color:'#9ca3af',marginBottom:8,fontWeight:600}}>Distribusi per akun:</div>
                      <div style={{background:'#1f2937',padding:10,borderRadius:8,fontSize:12,color:'#e5e7eb'}}>
                        {Object.entries(
                          tqBulkPreview.tasks.reduce((m, t) => { m[t.account_name] = (m[t.account_name] || 0) + 1; return m; }, {})
                        ).map(([name, count]) => (
                          <div key={name} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}>
                            <span>👤 {name}</span>
                            <span style={{color:'#a78bfa',fontWeight:600}}>{count} tugas</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unmapped warning */}
                  {tqBulkPreview.unmapped.length > 0 && (
                    <div style={{marginBottom:16,padding:10,background:'#3f1d1d',borderRadius:8,fontSize:12,color:'#fca5a5'}}>
                      <div style={{fontWeight:600,marginBottom:6}}>⚠️ {tqBulkPreview.unmapped.length} grup di-skip — belum di-setup primary_account_id:</div>
                      <div style={{maxHeight:100,overflow:'auto'}}>
                        {tqBulkPreview.unmapped.slice(0, 10).map((u, i) => (
                          <div key={i} style={{padding:'2px 0'}}>• {u.name} <span style={{color:'#7f1d1d',fontSize:11}}>({u.reason})</span></div>
                        ))}
                        {tqBulkPreview.unmapped.length > 10 && <div style={{color:'#7f1d1d',fontStyle:'italic'}}>...dan {tqBulkPreview.unmapped.length - 10} grup lain</div>}
                      </div>
                      <div style={{marginTop:6,fontSize:11,fontStyle:'italic',color:'#fde68a'}}>💡 Setup primary akun grup di tab "Daftar Grup" → kolom "Akun Bot Utama"</div>
                    </div>
                  )}

                  {/* Skipped existing */}
                  {tqBulkPreview.skipped.length > 0 && (
                    <div style={{marginBottom:16,padding:10,background:'#422006',borderRadius:8,fontSize:12,color:'#fde68a'}}>
                      <div style={{fontWeight:600,marginBottom:6}}>⏭️ {tqBulkPreview.skipped.length} cycle udah ada task hari ini (skip):</div>
                      <div style={{maxHeight:80,overflow:'auto',fontSize:11}}>
                        {tqBulkPreview.skipped.slice(0, 12).map((s, i) => (
                          <span key={i} style={{display:'inline-block',background:'#78350f',padding:'2px 6px',borderRadius:4,marginRight:4,marginBottom:4}}>{s.groupName} C{s.cycle}</span>
                        ))}
                        {tqBulkPreview.skipped.length > 12 && <span style={{color:'#fbbf24',fontStyle:'italic'}}>...+{tqBulkPreview.skipped.length - 12}</span>}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:16,paddingTop:16,borderTop:'1px solid #1f2937'}}>
                    <button onClick={()=>setTqBulkPreview(null)} disabled={tqBulkBusy} style={{...S.btn('#374151'),padding:'10px 20px',fontSize:13}}>Batal</button>
                    <button
                      onClick={confirmBulkTasks}
                      disabled={tqBulkBusy || tqBulkPreview.tasks.length === 0}
                      style={{...S.btn('#7c3aed'),padding:'10px 24px',fontSize:13,opacity:(tqBulkBusy || tqBulkPreview.tasks.length === 0)?0.5:1}}
                    >
                      {tqBulkBusy ? '⏳ Inserting...' : `✅ Konfirmasi & Buat ${tqBulkPreview.tasks.length} Tugas`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Daftar tugas */}
            <div style={S.box}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h3 style={{color:'#FFD700',fontSize:16,margin:0}}>Antrian Tugas</h3>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={loadTaskQueue} style={{...S.btn('#374151'),padding:'6px 14px',fontSize:12}}>Refresh</button>
                  <button onClick={clearDoneTasks} style={{...S.btn('#7f1d1d'),padding:'6px 14px',fontSize:12}}>Hapus Selesai</button>
                </div>
              </div>

              {/* Stats */}
              <div style={{display:'flex',gap:16,marginBottom:16,fontSize:13}}>
                <span style={{color:'#f59e0b'}}>Pending: {taskQueue.filter(t=>t.status==='pending').length}</span>
                <span style={{color:'#60a5fa'}}>Running: {taskQueue.filter(t=>t.status==='running').length}</span>
                <span style={{color:'#10b981'}}>Done: {taskQueue.filter(t=>t.status==='done').length}</span>
                <span style={{color:'#ef4444'}}>Failed: {taskQueue.filter(t=>t.status==='failed').length}</span>
              </div>

              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={S.th}>Akun Bot</th><th style={S.th}>Member</th><th style={S.th}>Grup</th><th style={S.th}>Klub</th><th style={S.th}>Jenis</th><th style={S.th}>Status</th><th style={S.th}>Waktu</th><th style={S.th}>Aksi</th></tr></thead>
                <tbody>
                  {taskQueue.map(t => (
                    <tr key={t.id}>
                      <td style={{...S.td,fontSize:12,color:'#60a5fa',fontWeight:600}}>{t.account_name || '-'}</td>
                      <td style={{...S.td,fontWeight:600}}>{t.member_name}</td>
                      <td style={S.td}>{t.group_name}</td>
                      <td style={{...S.td,fontSize:12,color:'#9ca3af'}}>{t.club}</td>
                      <td style={S.td}><span style={S.badge(t.task_type==='full'?'ok':t.task_type==='news'?'approved':'member')}>{t.task_type==='full'?'2G+1V':t.task_type==='news'?'2 Berita':'1 Video'}</span></td>
                      <td style={S.td}><span style={S.badge(t.status==='done'?'ok':t.status==='running'?'approved':t.status==='failed'?'fail':'pending')}>{t.status}</span></td>
                      <td style={{...S.td,fontSize:11,color:'#6b7280'}}>{t.completed_at?new Date(t.completed_at).toLocaleString('id-ID'):t.started_at?'Running...':new Date(t.created_at).toLocaleString('id-ID')}</td>
                      <td style={S.td}>{t.status!=='running'&&<button onClick={()=>deleteTask(t.id)} style={{...S.btn('#7f1d1d'),padding:'3px 8px',fontSize:11}}>Hapus</button>}</td>
                    </tr>
                  ))}
                  {taskQueue.length===0 && <tr><td colSpan={8} style={{...S.td,textAlign:'center',color:'#6b7280'}}>Belum ada tugas. Buat tugas di atas.</td></tr>}
                </tbody>
              </table>
            </div>

            <div style={{...S.box,background:'#0d1117',border:'1px solid #374151'}}>
              <p style={{fontSize:13,color:'#9ca3af'}}>
                <strong style={{color:'#FFD700'}}>Cara kerja:</strong><br/>
                <span style={{fontSize:11}}>1. Tambahkan akun bot grup di section atas (sekali saja)</span><br/>
                <span style={{fontSize:11}}>2. Save cookies akun: <code style={{background:'#1f2937',padding:'2px 6px',borderRadius:4,fontSize:11}}>node src/save-cookies-grup.js [ID_AKUN] "[Nama]"</code></span><br/>
                <span style={{fontSize:11}}>3. Pilih akun → pilih grup → klik Buat Tugas</span><br/>
                <span style={{fontSize:11}}>4. Jalankan bot worker: <code style={{background:'#1f2937',padding:'2px 6px',borderRadius:4,fontSize:11}}>node src/bot-worker.js</code></span><br/>
                <span style={{fontSize:11,color:'#10b981'}}>Bot akan otomatis pakai akun yang dipilih saat posting.</span>
              </p>
            </div>
          </>
        )}

        {/* REELS BOT — admin only */}
        {tab === 'reelsbot' && isAdmin && (
          <>
            {/* Kelola Akun Bot — per Platform (FB Reels / TikTok / IG) */}
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:8,fontSize:16}}>Kelola Akun Bot — Per Platform</h3>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:16}}>Tambah akun untuk platform spesifik. Akun FB Reels = post ke beranda FB. TikTok = upload ke TikTok. Instagram = upload ke IG Reels.</p>

              {/* Form tambah/edit */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10,alignItems:'end'}}>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Platform</label>
                  <select style={S.input} value={baType} onChange={e=>setBaType(e.target.value)}>
                    <option value="reels">📘 Facebook Reels</option>
                    <option value="tiktok">🎵 TikTok</option>
                    <option value="ig">📷 Instagram</option>
                    <option value="x">𝕏 Twitter / X</option>
                  </select>
                </div>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>ID Akun</label>
                  <input style={S.input} placeholder={baType==='reels'?'89654516608':baType==='tiktok'?'artezi9090@gmail.com':baType==='x'?'username_x':'artezi9090'} value={baId} onChange={e=>setBaId(e.target.value)} /></div>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Nama Profil</label>
                  <input style={S.input} placeholder="Bima Pratama" value={baName} onChange={e=>setBaName(e.target.value)} /></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:10,marginBottom:10,alignItems:'end'}}>
                <input style={S.input} placeholder="Catatan (opsional)" value={baNotes} onChange={e=>setBaNotes(e.target.value)} />
                {baEditing ? (
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={updateBotAccount} style={{...S.btn('#065f46'),padding:'10px 14px'}}>Simpan</button>
                    <button onClick={()=>{setBaEditing(null);setBaId('');setBaName('');setBaNotes('');}} style={{...S.btn('#374151'),padding:'10px 14px'}}>Batal</button>
                  </div>
                ) : (
                  <button onClick={addBotAccount} style={{...S.btn('#065f46'),padding:'10px 18px'}}>+ Tambah</button>
                )}
              </div>
              {baMsg && <p style={{fontSize:13,color:baMsg.includes('Error')?'#ef4444':'#10b981'}}>{baMsg}</p>}

              {/* 4 Tabel per platform */}
              {[
                { type:'reels', label:'📘 Facebook Reels', color:'#1877F2', filter:a=>a.account_type==='reels'||a.account_type==='both' },
                { type:'tiktok', label:'🎵 TikTok', color:'#00f2ea', filter:a=>a.account_type==='tiktok' },
                { type:'ig', label:'📷 Instagram', color:'#E4405F', filter:a=>a.account_type==='ig' },
                { type:'x', label:'𝕏 Twitter / X', color:'#ffffff', filter:a=>a.account_type==='x' },
              ].map(section => {
                const accs = botAccounts.filter(section.filter);
                return (
                  <div key={section.type} style={{marginTop:20,border:`1px solid ${section.color}33`,borderRadius:8,padding:12,background:'#0d1117'}}>
                    <h4 style={{color:section.color,fontSize:14,marginBottom:10}}>{section.label} ({accs.length} akun)</h4>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead>
                        <tr>
                          <th style={S.th}>#</th>
                          <th style={S.th}>Nama</th>
                          <th style={S.th}>ID Akun</th>
                          <th style={S.th}>Status</th>
                          <th style={S.th}>Total Post</th>
                          <th style={S.th}>Catatan</th>
                          <th style={S.th}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accs.map((a, i) => (
                          <tr key={a.id}>
                            <td style={S.td}>{i+1}</td>
                            <td style={{...S.td,fontWeight:600}}>{a.account_name}</td>
                            <td style={{...S.td,fontSize:12,color:'#9ca3af'}}>{a.account_id}</td>
                            <td style={S.td}>
                              <span onClick={()=>toggleBotAccount(a.id,a.is_active)} style={{cursor:'pointer',padding:'2px 8px',borderRadius:4,fontSize:11,fontWeight:600,background:a.is_active?'#065f46':'#7f1d1d',color:a.is_active?'#6ee7b7':'#fca5a5'}}>
                                {a.is_active ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </td>
                            <td style={{...S.td,textAlign:'center'}}>{a.total_posts || 0}</td>
                            <td style={{...S.td,fontSize:12,color:'#6b7280'}}>{a.notes || '-'}</td>
                            <td style={S.td}>
                              <div style={{display:'flex',gap:4}}>
                                <button onClick={()=>startEditAccount(a)} style={{...S.btn('#1e3a5f'),fontSize:11,padding:'4px 8px'}}>Edit</button>
                                <button onClick={()=>deleteBotAccount(a.id)} style={{...S.btn('#7f1d1d'),fontSize:11,padding:'4px 8px'}}>Hapus</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {accs.length === 0 && <tr><td colSpan={7} style={{...S.td,textAlign:'center',color:'#6b7280',fontSize:12}}>Belum ada akun {section.label.replace(/[📘🎵📷]/g,'').trim()}. Pilih platform di atas → tambah akun.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* Buat Tugas Reels */}
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:8,fontSize:16}}>Buat Tugas Reels — Video Highlight ke Beranda</h3>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:16}}>
                Pilih akun reels untuk generate video 2 menit + watermark ColokNet → posting ke beranda.
              </p>

              {reelsAccounts.length === 0 ? (
                <p style={{color:'#fbbf24',fontSize:13,padding:16,background:'#1a1a2e',borderRadius:8,border:'1px solid #2d2d5e'}}>
                  Belum ada akun tipe "Reels" atau "Keduanya" yang aktif. Tambahkan akun di atas.
                </p>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(reelsAccounts.length, 3)}, 1fr)`,gap:16,marginBottom:20}}>
                  {reelsAccounts.map(acc => (
                    <div key={acc.id} style={{background:'#1a1a2e',border:'1px solid #2d2d5e',borderRadius:12,padding:16}}>
                      <div style={{fontSize:15,fontWeight:700,color:'#e5e7eb'}}>{acc.account_name}</div>
                      <div style={{fontSize:12,color:'#6b7280',marginBottom:4}}>ID: {acc.account_id}</div>
                      <div style={{fontSize:11,color:'#6b7280',marginBottom:12}}>Total: {acc.total_posts || 0} posting</div>
                      <button onClick={()=>createReelsTask(acc.account_id, acc.account_name)} style={{...S.btn('#7c3aed'),background:'#2d1b69',color:'#c084fc',width:'100%',textAlign:'center'}}>
                        Buat Tugas Reels
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Platform checkboxes */}
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:8}}>Platform posting:</label>
                <div style={{display:'flex',gap:16}}>
                  {[
                    { key: 'facebook', label: 'Facebook', color: '#1877F2', icon: '📘' },
                    { key: 'tiktok', label: 'TikTok', color: '#00f2ea', icon: '🎵' },
                    { key: 'instagram', label: 'Instagram', color: '#E4405F', icon: '📷' },
                    { key: 'x', label: 'Twitter / X', color: '#ffffff', icon: '𝕏' },
                  ].map(p => (
                    <label key={p.key} onClick={()=>setReelsPlatforms(prev=>({...prev,[p.key]:!prev[p.key]}))}
                      style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'8px 16px',borderRadius:8,
                        background:reelsPlatforms[p.key]?'#1a1a2e':'#0d1117',
                        border:`2px solid ${reelsPlatforms[p.key]?p.color:'#374151'}`}}>
                      <span style={{fontSize:16}}>{p.icon}</span>
                      <span style={{fontSize:13,fontWeight:600,color:reelsPlatforms[p.key]?p.color:'#6b7280'}}>{p.label}</span>
                      {p.key==='instagram' && <span style={{fontSize:9,color:'#10b981'}}>(auto-chain)</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Keyword pencarian (opsional, kosongkan = random)</label>
                <input style={S.input} placeholder="Contoh: messi goals, premier league highlights" value={reelsKeyword} onChange={e=>setReelsKeyword(e.target.value)} />
              </div>

              {reelsMsg && <p style={{marginTop:8,fontSize:13,color:reelsMsg.includes('Error')||reelsMsg.includes('Pilih')?'#ef4444':'#10b981'}}>{reelsMsg}</p>}

              <div style={{marginTop:20,padding:16,background:'#0d1117',borderRadius:8,border:'1px solid #1f2937'}}>
                <h4 style={{color:'#9ca3af',fontSize:13,marginBottom:8}}>Cara Kerja:</h4>
                <ul style={{color:'#6b7280',fontSize:12,margin:0,paddingLeft:16,lineHeight:1.8}}>
                  <li>Bot cari video highlight bola di YouTube (2-10 menit)</li>
                  <li>Crop portrait 9:16 (1080x1920) + watermark ColokNet</li>
                  <li>Background music + translate judul ke Bahasa Indonesia</li>
                  <li>Posting ke beranda Facebook akun yang dipilih</li>
                  <li>Auto mode: setiap 3 jam bergantian akun aktif</li>
                  <li>Save cookies dulu: <code style={{color:'#60a5fa'}}>node src/save-cookies-reels.js [ID_AKUN]</code></li>
                  <li>Jalankan manual: <code style={{color:'#60a5fa'}}>node src/reels-worker.js</code></li>
                </ul>
              </div>
            </div>

            {/* Daftar tugas reels */}
            <div style={S.box}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h3 style={{color:'#FFD700',fontSize:16,margin:0}}>Riwayat Tugas Reels</h3>
                <button onClick={loadReelsTasks} style={S.btn('#374151')}>Refresh</button>
              </div>

              {reelsTasks.length === 0 ? (
                <p style={{color:'#6b7280',textAlign:'center',padding:20}}>Belum ada tugas reels</p>
              ) : (
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      <th style={S.th}>#</th>
                      <th style={S.th}>Akun</th>
                      <th style={S.th}>Platform</th>
                      <th style={S.th}>Keyword</th>
                      <th style={S.th}>Status</th>
                      <th style={S.th}>Hasil</th>
                      <th style={S.th}>Waktu</th>
                      <th style={S.th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reelsTasks.map((t, i) => {
                      const platforms = t.platforms || ['facebook'];
                      let resultInfo = '';
                      try { resultInfo = t.result_url ? JSON.stringify(JSON.parse(t.result_url)) : ''; } catch(e) { resultInfo = t.result_url || ''; }
                      return (
                      <tr key={t.id}>
                        <td style={S.td}>{i+1}</td>
                        <td style={{...S.td,fontWeight:600}}>{t.account_name}</td>
                        <td style={S.td}>
                          <div style={{display:'flex',gap:4}}>
                            {platforms.includes('facebook') && <span title="Facebook" style={{fontSize:12}}>📘</span>}
                            {platforms.includes('tiktok') && <span title="TikTok" style={{fontSize:12}}>🎵</span>}
                            {platforms.includes('instagram') && <span title="Instagram" style={{fontSize:12}}>📷</span>}
                            {platforms.includes('x') && <span title="Twitter / X" style={{fontSize:12}}>𝕏</span>}
                          </div>
                        </td>
                        <td style={{...S.td,fontSize:12,color:'#9ca3af'}}>{t.keyword || 'random'}</td>
                        <td style={S.td}>
                          <span style={S.badge(t.status === 'done' ? 'ok' : t.status === 'failed' ? 'fail' : t.status === 'running' ? 'approved' : 'pending')}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{...S.td,fontSize:10,color:'#6b7280',maxWidth:150}}>{resultInfo.substring(0, 50)}</td>
                        <td style={{...S.td,fontSize:12,color:'#6b7280'}}>{new Date(t.created_at).toLocaleString('id-ID')}</td>
                        <td style={S.td}>
                          <button onClick={()=>deleteReelsTask(t.id)} style={{...S.btn('#7f1d1d'),fontSize:11,padding:'4px 8px'}}>Hapus</button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* GROUPS (semua) */}
        {tab === 'groups' && (
          <>
            {/* Form tambah grup (admin only) */}
            {isAdmin && (
              <div style={S.box}>
                <h3 style={{color:'#FFD700',marginBottom:16,fontSize:16}}>Tambah Grup Baru</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
                  <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Nama Klub</label><input style={S.input} placeholder="Real Madrid" value={grpClub} onChange={e=>setGrpClub(e.target.value)} /></div>
                  <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Nama Grup</label><input style={S.input} placeholder="Info Seputar Real Madrid" value={grpName} onChange={e=>setGrpName(e.target.value)} /></div>
                  <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Liga</label>
                    <select style={S.input} value={grpLeague} onChange={e=>setGrpLeague(e.target.value)}>
                      {['La Liga','Premier League','Serie A','Bundesliga','Ligue 1','Liga 1','Timnas','Pemain','Lainnya'].map(l=><option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr auto',gap:10,alignItems:'end'}}>
                  <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>URL Grup Facebook</label><input style={S.input} placeholder="https://www.facebook.com/groups/123456" value={grpUrl} onChange={e=>setGrpUrl(e.target.value)} /></div>
                  <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>ID (opsional)</label><input style={S.input} placeholder="auto" value={grpId} onChange={e=>setGrpId(e.target.value)} /></div>
                  <button onClick={addGroup} style={{...S.btn('#065f46'),padding:'10px 24px',marginBottom:0}}>Tambah</button>
                </div>
                {grpMsg && <p style={{marginTop:10,fontSize:13,color:grpMsg.includes('Error')?'#ef4444':'#10b981'}}>{grpMsg}</p>}
              </div>
            )}

            <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
              <select style={S.input} value={leagueFilter} onChange={e=>setLeagueFilter(e.target.value)}>
                <option value="">Semua Liga</option>
                {['La Liga','Premier League','Serie A','Bundesliga','Ligue 1','Liga 1','Timnas','Pemain','Lainnya'].map(l=><option key={l} value={l}>{l}</option>)}
              </select>
              <input style={{...S.input,maxWidth:200}} placeholder="Cari grup..." value={search} onChange={e=>setSearch(e.target.value)} />
              <span style={{fontSize:12,color:'#6b7280',alignSelf:'center'}}>{filteredGroups.length} grup</span>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',background:'#111827',borderRadius:12,overflow:'hidden',border:'1px solid #1f2937'}}>
              <thead><tr><th style={S.th}>#</th><th style={S.th}>Nama Grup</th><th style={S.th}>Klub</th><th style={S.th}>Liga</th>{isAdmin && <th style={S.th} title="Akun bot A (admin/moderator) untuk Bulk Task Generate. Cycle 3+4 otomatis ke partner-nya.">Akun Bot Utama</th>}{isAdmin && <th style={S.th} title="Tema visual fallback canvas saat berita gak cukup">Tema Fallback</th>}{isAdmin && <th style={S.th} title="Bot self-driven posting per grup. Master switch harus aktif juga.">Auto-Post</th>}{isAdmin && <th style={S.th}>Aksi</th>}</tr></thead>
              <tbody>
                {filteredGroups.map((g, i) => (
                  <tr key={g.id}>
                    {editingGroup?.id === g.id ? (
                      <>
                        <td style={S.td}>{i+1}</td>
                        <td style={S.td}><input style={{...S.input,padding:'4px 8px',fontSize:12}} value={editingGroup.name} onChange={e=>setEditingGroup({...editingGroup,name:e.target.value})} /></td>
                        <td style={S.td}><input style={{...S.input,padding:'4px 8px',fontSize:12}} value={editingGroup.club} onChange={e=>setEditingGroup({...editingGroup,club:e.target.value})} /></td>
                        <td style={S.td}>
                          <select style={{...S.input,padding:'4px 8px',fontSize:12}} value={editingGroup.league} onChange={e=>setEditingGroup({...editingGroup,league:e.target.value})}>
                            {['La Liga','Premier League','Serie A','Bundesliga','Ligue 1','Liga 1','Timnas','Pemain','Lainnya'].map(l=><option key={l} value={l}>{l}</option>)}
                          </select>
                        </td>
                        {isAdmin && <td style={S.td}>
                          <select
                            style={{...S.input,padding:'4px 8px',fontSize:11}}
                            value={g.primary_account_id || ''}
                            onChange={e => setGroupPrimaryAccount(g.id, e.target.value)}
                          >
                            <option value="">— Belum di-set —</option>
                            {botAccounts.map(a => (
                              <option key={a.account_id} value={a.account_id}>
                                {a.account_name}{a.partner_account_id ? ' (pair)' : ''}
                              </option>
                            ))}
                          </select>
                        </td>}
                        {isAdmin && <td style={S.td}>
                          <select
                            style={{...S.input,padding:'4px 8px',fontSize:11,minWidth:130}}
                            value={g.fallback_theme || 'cinematic'}
                            onChange={e => setGroupFallbackTheme(g.id, e.target.value)}
                          >
                            <option value="cinematic">🎬 Cinematic</option>
                            <option value="neon">✨ Neon</option>
                            <option value="sport_magazine">🏆 Sport Magazine</option>
                            <option value="3d_text">🎮 3D Text</option>
                            <option value="minimalist">🌅 Minimalist</option>
                          </select>
                        </td>}
                        {isAdmin && <td style={S.td}><span style={{fontSize:11,color:'#6b7280'}}>—</span></td>}
                        {isAdmin && <td style={S.td}>
                          <button onClick={saveEditGroup} style={{...S.btn('#065f46'),padding:'3px 8px',fontSize:11,marginRight:4}}>Simpan</button>
                          <button onClick={()=>setEditingGroup(null)} style={{...S.btn('#374151'),padding:'3px 8px',fontSize:11}}>Batal</button>
                        </td>}
                      </>
                    ) : (
                      <>
                        <td style={S.td}>{i+1}</td>
                        <td style={S.td}><a href={g.url} target="_blank" style={S.link}>{g.name}</a></td>
                        <td style={S.td}>{g.club}</td>
                        <td style={S.td}><span style={{...S.badge('ok'),background:LEAGUE_COLORS[g.league]?'#1e3a5f':'#1f2937'}}>{g.league}</span></td>
                        {isAdmin && <td style={S.td}>
                          <select
                            style={{...S.input,padding:'4px 8px',fontSize:11,minWidth:140}}
                            value={g.primary_account_id || ''}
                            onChange={e => setGroupPrimaryAccount(g.id, e.target.value)}
                            title={g.primary_account_id ? `Akun bot utama untuk grup ini` : 'Belum di-setup — Bulk Generate akan skip grup ini'}
                          >
                            <option value="">— Belum di-set —</option>
                            {botAccounts.map(a => (
                              <option key={a.account_id} value={a.account_id}>
                                {a.account_name}{a.partner_account_id ? ' (pair)' : ''}
                              </option>
                            ))}
                          </select>
                        </td>}
                        {isAdmin && <td style={S.td}>
                          <select
                            style={{...S.input,padding:'4px 8px',fontSize:11,minWidth:130}}
                            value={g.fallback_theme || 'cinematic'}
                            onChange={e => setGroupFallbackTheme(g.id, e.target.value)}
                            title="Tema visual saat berita & archive sama-sama gak cukup"
                          >
                            <option value="cinematic">🎬 Cinematic</option>
                            <option value="neon">✨ Neon</option>
                            <option value="sport_magazine">🏆 Sport Magazine</option>
                            <option value="3d_text">🎮 3D Text</option>
                            <option value="minimalist">🌅 Minimalist</option>
                          </select>
                        </td>}
                        {isAdmin && <td style={S.td}>
                          <div style={{display:'flex',gap:6,alignItems:'center'}}>
                            <label style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',fontSize:11}} title="Toggle: bot auto-post untuk grup ini (master switch juga harus ON)">
                              <input type="checkbox" checked={!!g.auto_post_enabled} onChange={e=>setGroupAutoPost(g.id, e.target.checked)} />
                              <span style={{color:g.auto_post_enabled?'#10b981':'#6b7280'}}>{g.auto_post_enabled?'ON':'OFF'}</span>
                            </label>
                            <input type="number" min="1" max="24"
                              style={{...S.input,padding:'4px 6px',fontSize:11,width:50}}
                              value={g.posting_interval_hours || 2}
                              onChange={e=>setGroupInterval(g.id, e.target.value)}
                              title="Interval (jam) antar auto-post" />
                            <span style={{fontSize:10,color:'#6b7280'}}>jam</span>
                          </div>
                        </td>}
                        {isAdmin && <td style={S.td}>
                          <button onClick={()=>startEditGroup(g)} style={{...S.btn('#1e3a5f'),padding:'3px 8px',fontSize:11,marginRight:4}}>Edit</button>
                          <button onClick={()=>deleteGroup(g.id)} style={{...S.btn('#7f1d1d'),padding:'3px 8px',fontSize:11}}>Hapus</button>
                        </td>}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* SUBMIT LINK */}
        {tab === 'submitlink' && (
          <>
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:16,fontSize:16}}>Submit Link Postingan</h3>
              <p style={{color:'#9ca3af',fontSize:13,marginBottom:20}}>Masukkan link postingan Facebook yang sudah kamu buat di grup.</p>
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:13,color:'#9ca3af',marginBottom:6}}>Pilih Grup</label>
                <select style={S.input} value={linkGroup} onChange={e=>setLinkGroup(e.target.value)}>
                  {groups.map(g=><option key={g.id} value={g.id}>{g.name} ({g.club})</option>)}
                </select>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:13,color:'#9ca3af',marginBottom:6}}>Link Postingan Facebook</label>
                <input style={S.input} placeholder="https://www.facebook.com/groups/.../posts/..." value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} />
              </div>
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:13,color:'#9ca3af',marginBottom:6}}>Catatan (opsional)</label>
                <textarea style={{...S.input,minHeight:60,resize:'vertical'}} placeholder="Contoh: Berita transfer Mbappe" value={linkNote} onChange={e=>setLinkNote(e.target.value)} />
              </div>
              <button onClick={submitLink} style={{...S.btn('#065f46'),width:'100%',textAlign:'center',padding:14}}>Submit Link</button>
              {linkMsg && <p style={{marginTop:12,fontSize:13,color:linkMsg.includes('Error')?'#ef4444':'#10b981'}}>{linkMsg}</p>}
            </div>

            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:16,fontSize:16}}>{isAdmin?'Semua Link Disubmit':'Link Kamu'}</h3>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={S.th}>Grup</th><th style={S.th}>Link</th><th style={S.th}>Catatan</th><th style={S.th}>Status</th><th style={S.th}>User</th><th style={S.th}>Waktu</th>{isAdmin&&<th style={S.th}>Aksi</th>}</tr></thead>
                <tbody>
                  {links.map(l => (
                    <tr key={l.id}>
                      <td style={S.td}>{l.group_name||l.group_id}</td>
                      <td style={S.td}><a href={l.link} target="_blank" style={S.link}>{l.link.substring(0,45)}...</a></td>
                      <td style={{...S.td,fontSize:12}}>{l.note||'-'}</td>
                      <td style={S.td}><span style={S.badge(l.status)}>{l.status}</span></td>
                      <td style={{...S.td,fontSize:12}}>{l.user_name}</td>
                      <td style={{...S.td,fontSize:11,color:'#6b7280'}}>{l.created_at?new Date(l.created_at).toLocaleString('id-ID'):''}</td>
                      {isAdmin && <td style={S.td}>
                        <button onClick={()=>updateLinkStatus(l.id,'approved')} style={{...S.btn('#065f46'),padding:'3px 8px',fontSize:11,marginRight:4}}>Approve</button>
                        <button onClick={()=>updateLinkStatus(l.id,'rejected')} style={{...S.btn('#7f1d1d'),padding:'3px 8px',fontSize:11,marginRight:4}}>Reject</button>
                        <button onClick={()=>deleteLink(l.id)} style={{...S.btn('#7f1d1d'),padding:'3px 8px',fontSize:11}}>Hapus</button>
                      </td>}
                    </tr>
                  ))}
                  {links.length===0 && <tr><td colSpan={isAdmin?7:6} style={{...S.td,textAlign:'center',color:'#6b7280'}}>Belum ada link</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* USER MANAGEMENT (admin) */}
        {tab === 'users' && isAdmin && (
          <>
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:16,fontSize:16}}>Tambah Member</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:10,alignItems:'end'}}>
                <div><label style={{display:'block',fontSize:13,color:'#9ca3af',marginBottom:6}}>Username</label><input style={S.input} value={newUser} onChange={e=>setNewUser(e.target.value)} /></div>
                <div><label style={{display:'block',fontSize:13,color:'#9ca3af',marginBottom:6}}>Password</label><input style={S.input} value={newPass} onChange={e=>setNewPass(e.target.value)} /></div>
                <div><label style={{display:'block',fontSize:13,color:'#9ca3af',marginBottom:6}}>Nama</label><input style={S.input} value={newName} onChange={e=>setNewName(e.target.value)} /></div>
                <button onClick={addUser} style={{...S.btn('#065f46'),padding:'10px 20px'}}>Tambah</button>
              </div>
              {userMsg && <p style={{marginTop:12,fontSize:13,color:userMsg.includes('Error')?'#ef4444':'#10b981'}}>{userMsg}</p>}
            </div>
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:16,fontSize:16}}>Daftar User</h3>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:12}}>Edit target grup harian per member langsung di kolom Target. Tekan Enter atau klik di luar untuk simpan.</p>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={S.th}>Username</th><th style={S.th}>Nama</th><th style={S.th}>Role</th><th style={S.th}>Target Grup/Hari</th><th style={S.th}>Dibuat</th><th style={S.th}>Aksi</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={S.td}>{u.username}</td>
                      <td style={S.td}>{u.name}</td>
                      <td style={S.td}><span style={S.badge(u.role)}>{u.role}</span></td>
                      <td style={S.td}>
                        {u.role === 'member' ? (
                          <input
                            type="number"
                            min="0"
                            defaultValue={u.daily_target || 0}
                            style={{...S.input,width:80,padding:'6px 10px'}}
                            onBlur={async (e) => {
                              const val = parseInt(e.target.value) || 0;
                              if (val !== (u.daily_target || 0)) {
                                await supabase.from('users').update({ daily_target: val }).eq('id', u.id);
                                loadData();
                              }
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                          />
                        ) : (
                          <span style={{color:'#6b7280',fontSize:12}}>-</span>
                        )}
                      </td>
                      <td style={{...S.td,fontSize:12,color:'#6b7280'}}>{u.created_at?new Date(u.created_at).toLocaleDateString('id-ID'):''}</td>
                      <td style={S.td}>{u.username==='admin'?<span style={{color:'#6b7280',fontSize:11}}>Owner</span>:<button onClick={()=>deleteUser(u.id)} style={{...S.btn('#7f1d1d'),padding:'3px 8px',fontSize:11}}>Hapus</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BACKUP & RESTORE */}
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:8,fontSize:16}}>💾 Backup & Restore</h3>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:16}}>
                Backup semua data (users, groups, bot_accounts, posting_tracker, target_notes, dll) ke file JSON.
                Simpan file ini ke Google Drive / komputer untuk jaga-jaga.
              </p>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                {/* Backup */}
                <div style={{background:'#0d1117',border:'1px solid #1f2937',borderRadius:8,padding:16}}>
                  <h4 style={{color:'#60a5fa',fontSize:14,marginTop:0,marginBottom:8}}>📥 Download Backup</h4>
                  <p style={{color:'#6b7280',fontSize:12,marginBottom:12}}>
                    Export semua data dashboard ke 1 file JSON. Bisa di-upload ke Google Drive manual.
                  </p>
                  <button onClick={downloadBackup} disabled={backingUp} style={{...S.btn('#1e3a5f'),background:'#1e40af',color:'#fff',width:'100%',padding:'12px',fontSize:14,opacity:backingUp?0.5:1,cursor:backingUp?'wait':'pointer'}}>
                    {backingUp ? '⏳ Membuat backup...' : '📥 Download Backup Sekarang'}
                  </button>
                </div>

                {/* Restore */}
                <div style={{background:'#0d1117',border:'1px solid #1f2937',borderRadius:8,padding:16}}>
                  <h4 style={{color:'#fb923c',fontSize:14,marginTop:0,marginBottom:8}}>📤 Upload & Restore</h4>
                  <p style={{color:'#6b7280',fontSize:12,marginBottom:12}}>
                    Pilih file backup JSON untuk restore. Data existing akan di-overwrite berdasarkan ID.
                  </p>
                  <label style={{...S.btn('#7c2d12'),background:'#9a3412',color:'#fff',width:'100%',padding:'12px',fontSize:14,display:'block',textAlign:'center',cursor:restoring?'wait':'pointer',opacity:restoring?0.5:1}}>
                    {restoring ? '⏳ Restoring...' : '📤 Pilih File Backup'}
                    <input
                      type="file"
                      accept=".json,application/json"
                      style={{display:'none'}}
                      disabled={restoring}
                      onChange={e => e.target.files?.[0] && uploadRestore(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              {backupMsg && <p style={{fontSize:13,color:backupMsg.includes('Error')?'#ef4444':'#10b981',marginBottom:12}}>{backupMsg}</p>}

              {/* Stats terakhir backup/restore */}
              {backupStats && typeof backupStats === 'object' && (
                <div style={{background:'#0d1117',border:'1px solid #1f2937',borderRadius:8,padding:12,fontSize:12}}>
                  <div style={{color:'#9ca3af',marginBottom:8,fontWeight:600}}>Detail per tabel:</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
                    {Object.entries(backupStats).filter(([k]) => k !== 'total').map(([name, stat]) => (
                      <div key={name} style={{background:'#1a1a2e',padding:'6px 10px',borderRadius:4,display:'flex',justifyContent:'space-between'}}>
                        <span style={{color:'#9ca3af'}}>{name}</span>
                        <span style={{color:stat.error ? '#ef4444' : '#10b981',fontWeight:600}}>{stat.count ?? stat.restored ?? 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AUTO BACKUP HISTORY (Vercel Cron) */}
              <div style={{marginTop:20,padding:16,background:'#0d1117',border:'1px solid #0891b2',borderRadius:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                  <div>
                    <h4 style={{color:'#67e8f9',fontSize:14,margin:0,fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>⏰ Auto Backup Harian</h4>
                    <p style={{fontSize:11,color:'#9ca3af',margin:'4px 0 0 0'}}>Vercel Cron otomatis backup ke tabel backups_log setiap 02:00 WIB. Disimpan 30 backup terakhir.</p>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={loadAutoBackups} disabled={autoBackupsLoading} style={{...S.btn('#164e63'),padding:'8px 14px',fontSize:11}}>
                      {autoBackupsLoading ? '⏳ Loading...' : '🔄 Refresh'}
                    </button>
                    <button onClick={triggerManualBackup} style={{...S.btn('#065f46'),padding:'8px 14px',fontSize:11}}>
                      ⚡ Backup Sekarang
                    </button>
                  </div>
                </div>

                {autoBackups.length === 0 && !autoBackupsLoading && (
                  <p style={{fontSize:12,color:'#6b7280',textAlign:'center',padding:12}}>
                    Belum ada auto backup. Klik <strong>Refresh</strong> untuk cek, atau <strong>Backup Sekarang</strong> untuk trigger manual.
                  </p>
                )}

                {autoBackups.length > 0 && (
                  <div style={{maxHeight:300,overflow:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                      <thead>
                        <tr>
                          <th style={{...S.th,fontSize:10}}>Tanggal</th>
                          <th style={{...S.th,fontSize:10}}>Tipe</th>
                          <th style={{...S.th,fontSize:10,textAlign:'right'}}>Total Row</th>
                          <th style={{...S.th,fontSize:10,textAlign:'right'}}>Ukuran</th>
                          <th style={{...S.th,fontSize:10}}>Status</th>
                          <th style={{...S.th,fontSize:10}}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {autoBackups.map(b => {
                          const totalRows = Object.values(b.row_counts || {}).reduce((a, c) => a + (c || 0), 0);
                          const sizeKB = ((b.size_bytes || 0) / 1024).toFixed(1);
                          return (
                            <tr key={b.id}>
                              <td style={{...S.td,fontSize:11}}>{new Date(b.created_at).toLocaleString('id-ID')}</td>
                              <td style={{...S.td,fontSize:11}}>
                                <span style={{padding:'2px 6px',borderRadius:3,fontSize:9,fontWeight:700,background:b.trigger_type==='auto'?'#164e63':'#7c2d12',color:b.trigger_type==='auto'?'#67e8f9':'#fb923c'}}>
                                  {(b.trigger_type || 'auto').toUpperCase()}
                                </span>
                              </td>
                              <td style={{...S.td,fontSize:11,textAlign:'right',color:'#e0f2fe'}}>{totalRows.toLocaleString('id-ID')}</td>
                              <td style={{...S.td,fontSize:11,textAlign:'right',color:'#9ca3af'}}>{sizeKB} KB</td>
                              <td style={{...S.td,fontSize:10}}>
                                {b.error ? <span style={{color:'#ef4444'}} title={b.error}>⚠ Error</span> : <span style={{color:'#10b981'}}>✓ OK</span>}
                              </td>
                              <td style={{...S.td,fontSize:11}}>
                                <button onClick={()=>downloadAutoBackup(b.id)} style={{...S.btn('#1e40af'),padding:'4px 10px',fontSize:10}}>📥 Download</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{marginTop:12,padding:10,background:'#020617',border:'1px solid #1f2937',borderRadius:6,fontSize:10,color:'#6b7280'}}>
                  <strong style={{color:'#67e8f9'}}>Setup yang diperlukan:</strong>
                  <ol style={{margin:'4px 0 0 16px',padding:0}}>
                    <li>Jalankan SQL <code style={{background:'#1f2937',padding:'0 3px',borderRadius:2}}>003_backups_log.sql</code> di Supabase SQL Editor</li>
                    <li>Tambah env var <code style={{background:'#1f2937',padding:'0 3px',borderRadius:2}}>CRON_SECRET</code> di Vercel (opsional, untuk manual trigger)</li>
                    <li>Deploy dashboard — Vercel Cron otomatis aktif dari <code style={{background:'#1f2937',padding:'0 3px',borderRadius:2}}>vercel.json</code></li>
                  </ol>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ACTIVITY LOG (admin) */}
        {tab === 'activity' && isAdmin && (() => {
          // Combine activity_log (bot) + posting_tracker (member manual) → satu timeline
          const botEntries = (activity || []).map(a => ({
            key: `bot-${a.id}`,
            type: 'bot',
            timestamp: a.created_at,
            title: a.title || 'Untitled',
            subtitle: a.team || '',
            success: a.success,
            icon: '🤖',
            action: a.type || 'post',
          }));

          // Member submissions — setiap field gambar1/gambar2/video dianggap 1 entry
          const memberEntries = [];
          for (const p of postTrackerHistory || []) {
            if (p.gambar1_link && p.gambar1_at) {
              memberEntries.push({
                key: `member-${p.id}-g1`,
                type: 'member',
                timestamp: p.gambar1_at,
                title: `${p.user_name} submit Gambar 1 untuk ${p.group_name}`,
                subtitle: `Siklus ${p.cycle} · ${p.period}`,
                success: true,
                icon: '👤',
                action: 'submit',
                link: p.gambar1_link,
              });
            }
            if (p.gambar2_link && p.gambar2_at) {
              memberEntries.push({
                key: `member-${p.id}-g2`,
                type: 'member',
                timestamp: p.gambar2_at,
                title: `${p.user_name} submit Gambar 2 untuk ${p.group_name}`,
                subtitle: `Siklus ${p.cycle} · ${p.period}`,
                success: true,
                icon: '👤',
                action: 'submit',
                link: p.gambar2_link,
              });
            }
            if (p.video_link && p.video_at) {
              memberEntries.push({
                key: `member-${p.id}-v`,
                type: 'member',
                timestamp: p.video_at,
                title: `${p.user_name} submit Video untuk ${p.group_name}`,
                subtitle: `Siklus ${p.cycle} · ${p.period}`,
                success: true,
                icon: '👤',
                action: 'submit',
                link: p.video_link,
              });
            }
          }

          // Gabung + sort terbaru dulu
          const allEntries = [...botEntries, ...memberEntries]
            .filter(e => e.timestamp)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          const filtered = allEntries
            .filter(e => activityFilter === 'all' || e.type === activityFilter)
            .filter(e => {
              if (!searchActivity) return true;
              const q = searchActivity.toLowerCase();
              return e.title.toLowerCase().includes(q) || e.subtitle.toLowerCase().includes(q);
            });

          return (
            <>
              {/* Filter + stats */}
              <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
                <input style={{...S.input,width:220,fontSize:11}} placeholder="🔍 Cari member / grup..." value={searchActivity} onChange={e=>setSearchActivity(e.target.value)}/>
                <div style={{display:'flex',gap:6}}>
                  {[
                    { id: 'all', label: `Semua (${allEntries.length})` },
                    { id: 'member', label: `👤 Member (${memberEntries.length})` },
                    { id: 'bot', label: `🤖 Bot (${botEntries.length})` },
                  ].map(f => (
                    <button key={f.id} onClick={()=>setActivityFilter(f.id)} style={{
                      padding:'8px 14px',fontSize:11,borderRadius:4,border:'1px solid #1f2937',cursor:'pointer',
                      background: activityFilter === f.id ? '#0c4a6e' : '#111827',
                      color: activityFilter === f.id ? '#67e8f9' : '#9ca3af',
                      fontWeight: activityFilter === f.id ? 700 : 400,
                    }}>{f.label}</button>
                  ))}
                </div>
                <span style={{fontSize:11,color:'#6b7280',marginLeft:'auto'}}>Menampilkan {Math.min(filtered.length, 200)} dari {filtered.length} entri</span>
              </div>

              <div style={{background:'#111827',borderRadius:12,overflow:'hidden',border:'1px solid #1f2937'}}>
                {filtered.slice(0, 200).map(e => (
                  <div key={e.key} style={{padding:'12px 16px',borderBottom:'1px solid #1f2937',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                        <span style={{fontSize:14}}>{e.icon}</span>
                        <span style={{
                          padding:'2px 8px',
                          borderRadius:3,
                          fontSize:9,
                          fontWeight:700,
                          textTransform:'uppercase',
                          letterSpacing:1,
                          background: e.type === 'bot' ? '#1e3a5f' : '#064e3b',
                          color: e.type === 'bot' ? '#60a5fa' : '#6ee7b7',
                        }}>{e.type === 'bot' ? 'BOT' : 'MEMBER'}</span>
                        {e.action && <span style={{fontSize:9,color:'#6b7280'}}>{e.action}</span>}
                      </div>
                      <div style={{fontSize:13,color:'#e0f2fe',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.title}</div>
                      {e.subtitle && <div style={{fontSize:10,color:'#6b7280',marginTop:2}}>{e.subtitle}</div>}
                    </div>
                    <div style={{textAlign:'right',fontSize:10,color:'#6b7280',minWidth:140,flexShrink:0}}>
                      {e.success ? (
                        <span style={{...S.badge('ok'),fontSize:9}}>OK</span>
                      ) : (
                        <span style={{...S.badge('fail'),fontSize:9}}>GAGAL</span>
                      )}
                      <br/>
                      <span>{new Date(e.timestamp).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                      {e.link && <> · <a href={e.link} target="_blank" rel="noreferrer" style={{color:'#67e8f9',textDecoration:'none'}}>lihat</a></>}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <div style={{padding:30,textAlign:'center',color:'#6b7280'}}>Belum ada aktivitas {activityFilter !== 'all' ? `untuk tipe ${activityFilter}` : ''}</div>}
              </div>
            </>
          );
        })()}

        {/* BOT STATS TAB (admin) — Bot Grup + Bot Reels */}
        {tab === 'botstats' && isAdmin && (() => {
          // Renderer reusable untuk 1 section bot (grup atau reels)
          const renderBotSection = (botType, data, targetLabel) => {
            const titleIcon = botType === 'grup' ? '🤖' : '🎬';
            const titleText = botType === 'grup' ? 'BOT GRUP — Posting ke Grup FB' : 'BOT REELS — Posting ke Beranda (FB/TikTok/IG/X)';
            return (
              <div style={{marginBottom:32,paddingBottom:24,borderBottom:'2px solid #1f2937'}}>
                <h3 style={{color:botType==='grup'?'#67e8f9':'#fbbf24',fontSize:16,margin:'0 0 12px 0',fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>
                  {titleIcon} {titleText}
                </h3>

                {/* Summary cards */}
                <div className="responsive-stats" style={{marginBottom:16}}>
                  <div style={{...S.stat,border:'1px solid #10b981'}}>
                    <div style={{...S.num,color:'#10b981'}}>{data.summary.totalDone}</div>
                    <div style={S.label}>✅ Sukses</div>
                  </div>
                  <div style={{...S.stat,border:'1px solid #ef4444'}}>
                    <div style={{...S.num,color:'#ef4444'}}>{data.summary.totalFailed}</div>
                    <div style={S.label}>❌ Gagal</div>
                  </div>
                  <div style={{...S.stat,border:'1px solid #f59e0b'}}>
                    <div style={{...S.num,color:'#f59e0b'}}>{data.summary.totalPending}</div>
                    <div style={S.label}>⏳ Pending/Running</div>
                  </div>
                  <div style={{...S.stat,border:'1px solid #67e8f9'}}>
                    <div style={{...S.num,color:'#67e8f9'}}>{data.summary.successRate}%</div>
                    <div style={S.label}>📈 Success Rate</div>
                  </div>
                </div>

                {/* Per-akun */}
                <div style={{...S.box,marginBottom:16}}>
                  <h4 style={{color:'#67e8f9',fontSize:13,margin:'0 0 10px 0',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>👤 Per-Akun Success Rate</h4>
                  {data.accounts.length === 0 ? (
                    <p style={{fontSize:12,color:'#6b7280'}}>Belum ada data 7 hari terakhir.</p>
                  ) : (
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                        <thead><tr>
                          <th style={S.th}>Akun</th>
                          <th style={S.th}>Total</th>
                          <th style={S.th}>✅ Done</th>
                          <th style={S.th}>❌ Failed</th>
                          <th style={S.th}>⏳ Pending</th>
                          <th style={S.th}>Success Rate</th>
                          <th style={S.th}>Visualisasi</th>
                        </tr></thead>
                        <tbody>
                          {data.accounts.map(a => {
                            const barColor = a.successRate >= 80 ? '#10b981' : a.successRate >= 50 ? '#f59e0b' : a.successRate > 0 ? '#ef4444' : '#374151';
                            return (
                              <tr key={a.account_id}>
                                <td style={{...S.td,fontWeight:700}}>{a.account_name}</td>
                                <td style={S.td}>{a.total}</td>
                                <td style={{...S.td,color:'#10b981'}}>{a.done}</td>
                                <td style={{...S.td,color:'#ef4444'}}>{a.failed}</td>
                                <td style={{...S.td,color:'#f59e0b'}}>{a.pending}</td>
                                <td style={{...S.td,fontWeight:800,color:barColor}}>{a.successRate}%</td>
                                <td style={{...S.td,minWidth:200}}>
                                  <div style={{position:'relative',height:18,background:'#1f2937',borderRadius:4,overflow:'hidden'}}>
                                    <div style={{position:'absolute',top:0,left:0,height:'100%',width:`${a.successRate}%`,background:barColor,transition:'width 0.3s'}} />
                                    <span style={{position:'absolute',top:0,left:6,fontSize:10,fontWeight:700,color:'#fff',lineHeight:'18px',textShadow:'0 0 4px rgba(0,0,0,0.8)'}}>{a.done}/{a.total}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Top 5 errors */}
                <div style={{...S.box,marginBottom:16}}>
                  <h4 style={{color:'#67e8f9',fontSize:13,margin:'0 0 10px 0',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>🔥 Top 5 Error Reasons</h4>
                  {data.errors.length === 0 ? (
                    <p style={{fontSize:12,color:'#6b7280'}}>Tidak ada error 7 hari terakhir 🎉</p>
                  ) : (
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                      <thead><tr><th style={S.th}>Error Message</th><th style={S.th}>Count</th></tr></thead>
                      <tbody>
                        {data.errors.map((e, i) => (
                          <tr key={i}>
                            <td style={{...S.td,color:'#fca5a5',fontFamily:'monospace',fontSize:11}}>{e.msg}</td>
                            <td style={{...S.td,fontWeight:800,color:'#ef4444'}}>{e.count}×</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Recent 10 failures */}
                <div style={{...S.box}}>
                  <h4 style={{color:'#67e8f9',fontSize:13,margin:'0 0 10px 0',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>📋 Recent 10 Failures</h4>
                  {data.recentFails.length === 0 ? (
                    <p style={{fontSize:12,color:'#6b7280'}}>Tidak ada failure 7 hari terakhir 🎉</p>
                  ) : (
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                        <thead><tr>
                          <th style={S.th}>Waktu</th>
                          <th style={S.th}>Akun</th>
                          <th style={S.th}>{targetLabel}</th>
                          <th style={S.th}>{botType==='grup'?'Klub':'Keyword'}</th>
                          <th style={S.th}>Reason</th>
                        </tr></thead>
                        <tbody>
                          {data.recentFails.map((f, i) => (
                            <tr key={i}>
                              <td style={{...S.td,fontSize:11,color:'#9ca3af'}}>{f.time ? new Date(f.time).toLocaleString('id-ID', { dateStyle:'short', timeStyle:'short' }) : '-'}</td>
                              <td style={{...S.td,fontWeight:700}}>{f.account}</td>
                              <td style={S.td}>{f.target}</td>
                              <td style={{...S.td,fontSize:11,color:'#9ca3af'}}>{f.club}</td>
                              <td style={{...S.td,color:'#fca5a5',fontFamily:'monospace',fontSize:11,maxWidth:300}}>{f.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          };

          return (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
                <div>
                  <h3 style={{color:'#67e8f9',fontSize:15,margin:0,fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>📊 Bot Performance — Last 7 Days</h3>
                  <p style={{fontSize:11,color:'#9ca3af',margin:'4px 0 0 0'}}>Stats Bot Grup (task_queue) + Bot Reels (reels_tasks). Auto-refresh saat buka tab.</p>
                </div>
                <button onClick={loadBotStats} style={{...S.btn('#164e63'),padding:'6px 12px',fontSize:11}}>🔄 Refresh</button>
              </div>

              {renderBotSection('grup', botStatsData.grup, 'Grup')}
              {renderBotSection('reels', botStatsData.reels, 'Platform')}
            </>
          );
        })()}

        {/* PENGATURAN TAB (admin) */}
        {tab === 'settings' && isAdmin && (
          <>
            {settingsMsg && <p style={{fontSize:13,color:settingsMsg.includes('Gagal')||settingsMsg.includes('Error')?'#ef4444':'#10b981',marginBottom:16}}>{settingsMsg}</p>}

            {/* SECTION 0: AUTONOMOUS POSTING MASTER SWITCH */}
            <div style={{...S.box,marginBottom:20,border:autoMasterSwitch?'2px solid #10b981':'2px solid #ef4444'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:280}}>
                  <h3 style={{color:'#67e8f9',fontSize:15,margin:'0 0 6px 0',fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>🤖 Autonomous Posting (Master Switch)</h3>
                  <p style={{fontSize:12,color:'#9ca3af',margin:'0 0 8px 0'}}>
                    Bot mandiri auto-create posting task tiap interval per grup, tanpa user intervensi.
                    {autoMasterSwitch ? (
                      <span style={{color:'#10b981',fontWeight:700}}> ✅ AKTIF — bot self-driven</span>
                    ) : (
                      <span style={{color:'#ef4444',fontWeight:700}}> ⛔ DORMANT — bot manual mode (default)</span>
                    )}
                  </p>
                  <p style={{fontSize:11,color:'#6b7280',margin:0}}>
                    Triple safety: master ON + grup auto_post_enabled=true + interval lewat. Aman dimainkan satu-per-satu.
                  </p>
                </div>
                <button onClick={toggleAutoMasterSwitch}
                  style={{...S.btn(autoMasterSwitch?'#7f1d1d':'#065f46'),padding:'12px 24px',fontSize:13,fontWeight:800}}>
                  {autoMasterSwitch ? '⛔ MATIKAN' : '▶ AKTIFKAN'}
                </button>
              </div>
            </div>

            {/* SECTION 1: BOT ACCOUNTS QUICK VIEW (read-only view + toggle) */}
            <div style={{...S.box,marginBottom:20}}>
              <h3 style={{color:'#67e8f9',fontSize:15,margin:'0 0 6px 0',fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>🤖 Bot Accounts Quick View</h3>
              <p style={{fontSize:12,color:'#9ca3af',margin:'0 0 16px 0'}}>Toggle aktif/inactive akun bot dengan cepat. Untuk CRUD lengkap (tambah/edit/hapus), pakai tab <strong>Jalankan Bot</strong> atau <strong>Reels Bot</strong>.</p>

              {/* Filter */}
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                {['all','grup','reels','both'].map(f => (
                  <button key={f} onClick={()=>setBotAccFilter(f)} style={{
                    padding:'6px 12px',fontSize:11,borderRadius:4,border:'1px solid #1f2937',cursor:'pointer',
                    background: botAccFilter === f ? '#0c4a6e' : '#111827',
                    color: botAccFilter === f ? '#67e8f9' : '#9ca3af',
                    fontWeight: botAccFilter === f ? 700 : 400,
                    textTransform:'uppercase',letterSpacing:1,
                  }}>{f === 'all' ? 'Semua' : f}</button>
                ))}
              </div>

              {/* Tabel bot accounts */}
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead>
                    <tr>
                      <th style={S.th}>Account ID</th>
                      <th style={S.th}>Nama</th>
                      <th style={S.th}>Tipe</th>
                      <th style={S.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {botAccounts
                      .filter(acc => botAccFilter === 'all' || acc.account_type === botAccFilter)
                      .map(acc => (
                        <tr key={acc.id}>
                          <td style={{...S.td,fontFamily:'monospace',fontSize:11}}>{acc.account_id}</td>
                          <td style={{...S.td,fontWeight:600}}>{acc.account_name}</td>
                          <td style={S.td}>
                            <span style={{padding:'2px 8px',borderRadius:3,fontSize:9,fontWeight:700,background:'#0c4a6e',color:'#67e8f9',textTransform:'uppercase'}}>{acc.account_type}</span>
                          </td>
                          <td style={S.td}>
                            <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:11}}>
                              <input type="checkbox" checked={!!acc.is_active} onChange={()=>toggleBotAccount(acc.id, acc.is_active)}/>
                              <span style={{color:acc.is_active?'#10b981':'#ef4444'}}>{acc.is_active ? 'Active' : 'Inactive'}</span>
                            </label>
                          </td>
                        </tr>
                      ))}
                    {botAccounts.length === 0 && (
                      <tr><td colSpan={4} style={{...S.td,textAlign:'center',color:'#6b7280',padding:20}}>Belum ada akun bot.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: SYSTEM ACTIONS */}
            <div style={{...S.box,marginBottom:20}}>
              <h3 style={{color:'#67e8f9',fontSize:15,margin:'0 0 6px 0',fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>⚡ System Actions</h3>
              <p style={{fontSize:12,color:'#9ca3af',margin:'0 0 16px 0'}}>Tombol-tombol admin untuk maintenance database.</p>

              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:12}}>
                <div style={{background:'#0d1117',border:'1px solid #1f2937',borderRadius:6,padding:14}}>
                  <div style={{fontSize:12,color:'#67e8f9',fontWeight:700,marginBottom:4}}>🔄 Reset Worker Counters</div>
                  <p style={{fontSize:10,color:'#9ca3af',margin:'0 0 10px 0'}}>Reset counter harian (total/success/failed) untuk semua bot worker ke 0.</p>
                  <button onClick={resetWorkerCounters} style={{...S.btn('#164e63'),padding:'8px 14px',fontSize:11,width:'100%'}}>Reset Sekarang</button>
                </div>

                <div style={{background:'#0d1117',border:'1px solid #1f2937',borderRadius:6,padding:14}}>
                  <div style={{fontSize:12,color:'#67e8f9',fontWeight:700,marginBottom:4}}>🗑 Cleanup Chat Lama</div>
                  <p style={{fontSize:10,color:'#9ca3af',margin:'0 0 10px 0'}}>Hapus pesan chat yang umurnya lebih dari 30 hari.</p>
                  <button onClick={cleanupOldChat} style={{...S.btn('#7c2d12'),padding:'8px 14px',fontSize:11,width:'100%'}}>Cleanup</button>
                </div>

                <div style={{background:'#0d1117',border:'1px solid #1f2937',borderRadius:6,padding:14}}>
                  <div style={{fontSize:12,color:'#67e8f9',fontWeight:700,marginBottom:4}}>🗑 Cleanup Backup Lama</div>
                  <p style={{fontSize:10,color:'#9ca3af',margin:'0 0 10px 0'}}>Hapus backup lebih lama dari 30 terbaru (otomatis juga jalan harian).</p>
                  <button onClick={cleanupOldBackups} style={{...S.btn('#7c2d12'),padding:'8px 14px',fontSize:11,width:'100%'}}>Cleanup</button>
                </div>

                <div style={{background:'#0d1117',border:'1px solid #1f2937',borderRadius:6,padding:14}}>
                  <div style={{fontSize:12,color:'#67e8f9',fontWeight:700,marginBottom:4}}>⚡ Backup Sekarang</div>
                  <p style={{fontSize:10,color:'#9ca3af',margin:'0 0 10px 0'}}>Trigger backup manual sekarang (buka tab Kelola User untuk lihat hasilnya).</p>
                  <button onClick={triggerManualBackup} style={{...S.btn('#065f46'),padding:'8px 14px',fontSize:11,width:'100%'}}>Backup Now</button>
                </div>
              </div>
            </div>

            {/* SECTION 3: DATABASE STATISTICS */}
            <div style={{...S.box,marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div>
                  <h3 style={{color:'#67e8f9',fontSize:15,margin:'0 0 4px 0',fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>📊 Database Statistics</h3>
                  <p style={{fontSize:12,color:'#9ca3af',margin:0}}>Statistik total row per tabel.</p>
                </div>
                <button onClick={loadSystemStats} style={{...S.btn('#164e63'),padding:'8px 14px',fontSize:11}}>🔄 Refresh</button>
              </div>
              {!systemStats && <p style={{fontSize:12,color:'#6b7280'}}>Memuat statistik...</p>}
              {systemStats && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10}}>
                  {[
                    { label: '👥 Users', key: 'users' },
                    { label: '🏟 Groups', key: 'groups' },
                    { label: '📝 Posting Tracker', key: 'posting_tracker' },
                    { label: '🔗 Link Submissions', key: 'link_submissions' },
                    { label: '📋 Activity Log', key: 'activity_log' },
                    { label: '💬 Chat Messages', key: 'chat_messages' },
                    { label: '🔔 Notifications', key: 'notifications' },
                    { label: '💾 Backups', key: 'backups' },
                  ].map(s => (
                    <div key={s.key} style={{background:'#0d1117',border:'1px solid #1f2937',borderRadius:6,padding:12}}>
                      <div style={{fontSize:11,color:'#9ca3af'}}>{s.label}</div>
                      <div style={{fontSize:20,fontWeight:900,color:'#67e8f9',marginTop:4}}>{(systemStats[s.key] || 0).toLocaleString('id-ID')}</div>
                    </div>
                  ))}
                  <div style={{background:'#0d1117',border:'1px solid #0891b2',borderRadius:6,padding:12}}>
                    <div style={{fontSize:11,color:'#9ca3af'}}>💾 Total Backup Size</div>
                    <div style={{fontSize:20,fontWeight:900,color:'#67e8f9',marginTop:4}}>{systemStats.backups_size_kb?.toLocaleString('id-ID') || 0} KB</div>
                  </div>
                </div>
              )}
            </div>

            {/* Info box */}
            <div style={{padding:14,background:'#0d1117',border:'1px solid #1f2937',borderRadius:8,fontSize:11,color:'#6b7280'}}>
              <strong style={{color:'#67e8f9'}}>💡 Tips admin:</strong>
              <ul style={{margin:'6px 0 0 20px',padding:0}}>
                <li>Matikan akun bot yang lagi bermasalah daripada hapus — biar history tetap terjaga</li>
                <li>Cleanup chat + backup lama sebulan sekali untuk hemat storage Supabase</li>
                <li>Reset worker counter setiap pergantian hari kalau mau statistik harian fresh</li>
              </ul>
            </div>
          </>
        )}

      </div>
    </>
  );
}
