'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    const dateKey = d.toISOString().split('T')[0];
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
    const dateKey = d.toISOString().split('T')[0];
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
    const { data } = await supabase.from('users').select('*').eq('username', u).eq('password', p).single();
    if (data) onLogin(data);
    else setErr('Username atau password salah');
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
  const [tqMsg, setTqMsg] = useState('');
  const [tqSelectAll, setTqSelectAll] = useState(false);
  const [tqAccountId, setTqAccountId] = useState(''); // Akun bot grup yang dipilih

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
  const [ptPeriod, setPtPeriod] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Check saved session
    const saved = localStorage.getItem('fb-dash-user');
    if (saved) { const u = JSON.parse(saved); setUser(u); setTab(u.role === 'admin' ? 'overview' : 'groups'); }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user]);

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
    const { error } = await supabase.from('users').insert({ username: newUser, password: newPass, name: newName || newUser, role: 'member' });
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
    const startDate = start.toISOString().split('T')[0];
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
    a.download = `progress_target_${new Date().toISOString().split('T')[0]}.csv`;
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
      a.download = `backup_fbgroup_${new Date().toISOString().split('T')[0]}.json`;
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

  // CRUD akun grup khusus (di tab Jalankan Bot)
  const addGrupAccount = async () => {
    if (!bgId || !bgName) { setBgMsg('ID dan Nama wajib diisi!'); return; }
    const { error } = await supabase.from('bot_accounts').insert({
      account_id: bgId.trim(), account_name: bgName.trim(),
      account_type: 'grup', notes: bgNotes.trim() || null,
    });
    if (error) setBgMsg('Error: ' + error.message);
    else { setBgMsg(`Akun grup "${bgName}" ditambahkan!`); setBgId(''); setBgName(''); setBgNotes(''); loadData(); }
  };

  const updateGrupAccount = async () => {
    if (!bgEditing) return;
    await supabase.from('bot_accounts').update({
      account_id: bgId.trim(), account_name: bgName.trim(),
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
      account_id: baId.trim(), account_name: baName.trim(),
      account_type: baType, notes: baNotes.trim() || null,
    });
    if (error) setBaMsg('Error: ' + error.message);
    else { setBaMsg(`Akun "${baName}" ditambahkan!`); setBaId(''); setBaName(''); setBaNotes(''); loadData(); }
  };

  const updateBotAccount = async () => {
    if (!baEditing) return;
    await supabase.from('bot_accounts').update({
      account_id: baId.trim(), account_name: baName.trim(),
      account_type: baType, notes: baNotes.trim() || null,
    }).eq('id', baEditing);
    setBaEditing(null); setBaId(''); setBaName(''); setBaNotes(''); setBaMsg('Akun diupdate!'); loadData();
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
    setBaEditing(a.id); setBaId(a.account_id); setBaName(a.account_name); setBaType(a.account_type); setBaNotes(a.notes || '');
  };

  // Reels Bot state
  const [reelsTasks, setReelsTasks] = useState([]);
  const [reelsKeyword, setReelsKeyword] = useState('');
  const [reelsMsg, setReelsMsg] = useState('');
  const [reelsPlatforms, setReelsPlatforms] = useState({ facebook: true, tiktok: false, instagram: false });

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

  const today = new Date().toISOString().split('T')[0];
  const todayLinks = links.filter(l => l.created_at?.startsWith(today) && l.status === 'approved').length;
  const todayBot = activity.filter(a => a.created_at?.startsWith(today) && a.success).length;
  const todayPosts = todayLinks + todayBot;
  const totalSuccess = activity.filter(a => a.success).length + links.filter(l => l.status === 'approved').length;

  // Analytics — gabungan dari activity_log + link_submissions
  const clubs = [...new Set(groups.map(g => g.club))].sort();
  const clubStats = clubs.map(c => {
    const clubGroups = groups.filter(g => g.club === c);
    const clubGroupIds = clubGroups.map(g => g.id);
    // Hitung dari activity_log (bot)
    const botPosts = activity.filter(a => a.team === c);
    // Hitung dari link_submissions (member manual)
    const memberPosts = links.filter(l => clubGroupIds.includes(l.group_id) && l.status === 'approved');
    const total = botPosts.length + memberPosts.length;
    const success = botPosts.filter(a => a.success).length + memberPosts.length;
    return { club: c, groups: clubGroups.length, total, success, memberPosts: memberPosts.length, botPosts: botPosts.length };
  }).sort((a, b) => b.total - a.total);

  return (
    <>
      {/* NAV */}
      <div style={S.nav}>
        <h1 style={S.h1}>Football Bot Dashboard</h1>
        <div style={{display:'flex',gap:12,alignItems:'center',fontSize:13}}>
          <span style={{color:'#9ca3af'}}>{user.name}</span>
          <span style={S.badge(user.role)}>{user.role}</span>
          <a onClick={logout} style={{color:'#ef4444',cursor:'pointer'}}>Logout</a>
        </div>
      </div>

      {/* TABS */}
      <div style={S.tabs}>
        {tabs.map(t => <div key={t.id} style={S.tab(tab===t.id)} onClick={() => { setTab(t.id); if(t.id==='weekly') loadWeeklyStats(wsYear, wsMonth); if(t.id==='posttrack') loadPostTracker(ptPeriod); if(t.id==='botqueue') loadTaskQueue(); }}>{t.label}</div>)}
      </div>

      <div style={S.main}>

        {/* WARNING BANNER GLOBAL — member progress < 50% setelah jam 18:00 (muncul di SEMUA tab) */}
        {!isAdmin && user && (() => {
          const today = new Date().toISOString().split('T')[0];
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
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:24}}>
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
          <div style={S.box}>
            <h3 style={{color:'#FFD700',marginBottom:16,fontSize:16}}>Performa Per Klub</h3>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={S.th}>Klub</th><th style={S.th}>Grup</th><th style={S.th}>Bot</th><th style={S.th}>Member</th><th style={S.th}>Total</th><th style={S.th}>Rasio</th></tr></thead>
              <tbody>
                {clubStats.map(c => {
                  const r = c.total > 0 ? Math.round(c.success/c.total*100) : 0;
                  return (
                    <tr key={c.club}><td style={S.td}><strong>{c.club}</strong></td><td style={S.td}>{c.groups}</td><td style={S.td}>{c.botPosts}</td><td style={S.td}>{c.memberPosts}</td><td style={S.td}>{c.total}</td>
                    <td style={S.td}><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:60,height:6,background:'#1f2937',borderRadius:3}}><div style={{width:`${r}%`,height:'100%',background:r>=80?'#10b981':r>=50?'#f59e0b':'#ef4444',borderRadius:3}}/></div><span style={{fontSize:11}}>{r}%</span></div></td></tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
                  Progress Target {ptPeriod === new Date().toISOString().split('T')[0] ? 'Hari Ini' : new Date(ptPeriod).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                </h3>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <label style={{fontSize:12,color:'#9ca3af'}}>Tanggal:</label>
                  <input type="date" style={{...S.input,width:180}} value={ptPeriod} onChange={e=>{setPtPeriod(e.target.value);loadPostTracker(e.target.value)}} />
                  <button onClick={()=>{const t=new Date().toISOString().split('T')[0];setPtPeriod(t);loadPostTracker(t);}} style={{...S.btn('#374151'),padding:'8px 14px',fontSize:12}}>Hari Ini</button>
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
                      const dateKey = d.toISOString().split('T')[0];
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
              <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:10,alignItems:'end'}}>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Link Postingan</label>
                  <input style={S.input} placeholder="https://www.facebook.com/groups/.../posts/..." value={ptLink} onChange={e=>setPtLink(e.target.value)} /></div>
                <button onClick={submitPostLink} style={{...S.btn('#065f46'),padding:'10px 24px'}}>Submit</button>
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
                <h3 style={{color:'#FFD700',fontSize:16,margin:0}}>Progress Postingan — {new Date(ptPeriod).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h3>
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
                  {groups.map((g, idx) => {
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
                                <span title={g1||'Belum'} style={{width:22,height:22,borderRadius:4,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,background:g1?'#065f46':'#1f2937',color:g1?'#6ee7b7':'#374151',cursor:g1?'pointer':'default'}} onClick={()=>g1&&window.open(g1,'_blank')}>G1</span>
                                <span title={g2||'Belum'} style={{width:22,height:22,borderRadius:4,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,background:g2?'#065f46':'#1f2937',color:g2?'#6ee7b7':'#374151',cursor:g2?'pointer':'default'}} onClick={()=>g2&&window.open(g2,'_blank')}>G2</span>
                                <span title={v||'Belum'} style={{width:22,height:22,borderRadius:4,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,background:v?'#3b0764':'#1f2937',color:v?'#c084fc':'#374151',cursor:v?'pointer':'default'}} onClick={()=>v&&window.open(v,'_blank')}>V</span>
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
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Total Post</th>
                    <th style={S.th}>Catatan</th>
                    <th style={S.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {botAccounts.filter(a => a.account_type === 'grup' || a.account_type === 'both').map((a, i) => (
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
                          <button onClick={()=>startEditGrupAccount(a)} style={{...S.btn('#1e3a5f'),fontSize:11,padding:'4px 8px'}}>Edit</button>
                          <button onClick={()=>deleteBotAccount(a.id)} style={{...S.btn('#7f1d1d'),fontSize:11,padding:'4px 8px'}}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {botAccounts.filter(a => a.account_type === 'grup' || a.account_type === 'both').length === 0 && <tr><td colSpan={7} style={{...S.td,textAlign:'center',color:'#6b7280'}}>Belum ada akun grup. Tambahkan di atas.</td></tr>}
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
                  {grupAccounts.map(acc => (
                    <div key={acc.id} onClick={()=>selectGrupAccount(acc.account_id)} style={{cursor:'pointer',background:tqAccountId===acc.account_id?'#1e3a5f':'#1a1a2e',border:`2px solid ${tqAccountId===acc.account_id?'#60a5fa':'#2d2d5e'}`,borderRadius:10,padding:12}}>
                      <div style={{fontSize:14,fontWeight:700,color:tqAccountId===acc.account_id?'#60a5fa':'#e5e7eb'}}>{acc.account_name}</div>
                      <div style={{fontSize:11,color:'#6b7280'}}>ID: {acc.account_id}</div>
                      <div style={{fontSize:10,color:'#6b7280'}}>Total: {acc.total_posts || 0} posting</div>
                    </div>
                  ))}
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

              <div style={{display:'flex',gap:10,marginTop:16}}>
                <button onClick={createTasks} style={{...S.btn('#065f46'),padding:'12px 32px',fontSize:14}}>Buat {tqGroups.length} Tugas</button>
              </div>
              {tqMsg && <p style={{marginTop:10,fontSize:13,color:tqMsg.includes('Error')?'#ef4444':'#10b981'}}>{tqMsg}</p>}
            </div>

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
            {/* Kelola Akun Bot REELS */}
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:8,fontSize:16}}>Kelola Akun Bot Reels</h3>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:16}}>Tambah, edit, atau hapus akun Facebook untuk bot reels (posting ke beranda). Akun bot grup dikelola di tab "Jalankan Bot".</p>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:10,marginBottom:10,alignItems:'end'}}>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>ID Akun (nomor HP/email)</label>
                  <input style={S.input} placeholder="89654516608" value={baId} onChange={e=>setBaId(e.target.value)} /></div>
                <div><label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Nama Profil</label>
                  <input style={S.input} placeholder="Bima Pratama" value={baName} onChange={e=>setBaName(e.target.value)} /></div>
                {baEditing ? (
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>{setBaType('reels');updateBotAccount();}} style={{...S.btn('#065f46'),padding:'10px 14px'}}>Simpan</button>
                    <button onClick={()=>{setBaEditing(null);setBaId('');setBaName('');setBaNotes('');}} style={{...S.btn('#374151'),padding:'10px 14px'}}>Batal</button>
                  </div>
                ) : (
                  <button onClick={()=>{setBaType('reels');addBotAccount();}} style={{...S.btn('#065f46'),padding:'10px 18px'}}>Tambah</button>
                )}
              </div>
              <div style={{marginBottom:10}}>
                <input style={S.input} placeholder="Catatan (opsional)" value={baNotes} onChange={e=>setBaNotes(e.target.value)} />
              </div>
              {baMsg && <p style={{fontSize:13,color:baMsg.includes('Error')?'#ef4444':'#10b981'}}>{baMsg}</p>}

              {/* Tabel akun — HANYA AKUN REELS */}
              <table style={{width:'100%',borderCollapse:'collapse',marginTop:16}}>
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
                  {botAccounts.filter(a => a.account_type === 'reels' || a.account_type === 'both').map((a, i) => (
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
                  {botAccounts.filter(a => a.account_type === 'reels' || a.account_type === 'both').length === 0 && <tr><td colSpan={7} style={{...S.td,textAlign:'center',color:'#6b7280'}}>Belum ada akun reels. Tambahkan di atas.</td></tr>}
                </tbody>
              </table>
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
                  ].map(p => (
                    <label key={p.key} onClick={()=>setReelsPlatforms(prev=>({...prev,[p.key]:!prev[p.key]}))}
                      style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'8px 16px',borderRadius:8,
                        background:reelsPlatforms[p.key]?'#1a1a2e':'#0d1117',
                        border:`2px solid ${reelsPlatforms[p.key]?p.color:'#374151'}`,opacity:p.key==='instagram'?0.5:1}}>
                      <span style={{fontSize:16}}>{p.icon}</span>
                      <span style={{fontSize:13,fontWeight:600,color:reelsPlatforms[p.key]?p.color:'#6b7280'}}>{p.label}</span>
                      {p.key==='instagram' && <span style={{fontSize:9,color:'#6b7280'}}>(segera)</span>}
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
              <thead><tr><th style={S.th}>#</th><th style={S.th}>Nama Grup</th><th style={S.th}>Klub</th><th style={S.th}>Liga</th>{isAdmin && <th style={S.th}>Aksi</th>}</tr></thead>
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

              <div style={{marginTop:16,padding:12,background:'#0d1117',border:'1px solid #1f2937',borderRadius:8,fontSize:11,color:'#6b7280'}}>
                <strong style={{color:'#FFD700'}}>Auto Backup ke Google Drive:</strong> Untuk backup otomatis harian,
                pakai script lokal di komputer kamu (<code style={{background:'#1f2937',padding:'1px 4px',borderRadius:3}}>scripts/auto-backup.js</code>) via Windows Task Scheduler.
                Script akan download backup dari dashboard dan upload ke Google Drive otomatis.
              </div>
            </div>
          </>
        )}

        {/* ACTIVITY LOG (admin) */}
        {tab === 'activity' && isAdmin && (
          <div style={{background:'#111827',borderRadius:12,overflow:'hidden',border:'1px solid #1f2937'}}>
            {activity.slice(0,100).map((a,i) => (
              <div key={i} style={{padding:'10px 14px',borderBottom:'1px solid #1f2937',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><span style={{...S.badge(a.type==='video'?'member':'ok'),marginRight:6,fontSize:10}}>{a.type||'news'}</span><span style={{fontSize:13}}>{(a.title||'').substring(0,65)}</span></div>
                <div style={{textAlign:'right',fontSize:11,color:'#6b7280'}}><span style={S.badge(a.success?'ok':'fail')}>{a.success?'OK':'GAGAL'}</span><br/>{a.team||''} &middot; {a.created_at?new Date(a.created_at).toLocaleString('id-ID'):''}</div>
              </div>
            ))}
            {activity.length===0 && <div style={{padding:20,textAlign:'center',color:'#6b7280'}}>Belum ada aktivitas</div>}
          </div>
        )}

      </div>
    </>
  );
}
