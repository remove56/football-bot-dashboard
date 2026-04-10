'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ============================================================
// STYLES
// ============================================================
const S = {
  nav: { background:'#111827',borderBottom:'1px solid #1f2937',padding:'12px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100 },
  h1: { fontSize:20,background:'linear-gradient(135deg,#FFD700,#FF6B00)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:700 },
  tabs: { display:'flex',gap:8,padding:'14px 24px',background:'#0d1117',borderBottom:'1px solid #1f2937',flexWrap:'wrap' },
  tab: (a) => ({ padding:'8px 16px',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600,color:a?'#FFD700':'#6b7280',background:a?'#1a1a2e':'#1f2937',border:`1px solid ${a?'#FFD700':'transparent'}` }),
  main: { padding:24,maxWidth:1400,margin:'0 auto' },
  box: { background:'#111827',border:'1px solid #1f2937',borderRadius:12,padding:24,marginBottom:24 },
  stat: { background:'#111827',border:'1px solid #1f2937',borderRadius:12,padding:18 },
  num: { fontSize:28,fontWeight:700,color:'#FFD700' },
  label: { fontSize:12,color:'#6b7280',marginTop:4 },
  input: { width:'100%',padding:'10px 14px',background:'#1f2937',border:'1px solid #374151',borderRadius:8,color:'#fff',fontSize:14 },
  btn: (c) => ({ padding:'10px 16px',border:`1px solid ${c||'#374151'}`,borderRadius:8,background:'#1f2937',color:'#e5e7eb',fontSize:13,fontWeight:600,cursor:'pointer' }),
  badge: (c) => ({ padding:'2px 8px',borderRadius:4,fontSize:11,fontWeight:600,...({ok:{background:'#065f46',color:'#6ee7b7'},fail:{background:'#7f1d1d',color:'#fca5a5'},pending:{background:'#78350f',color:'#fbbf24'},approved:{background:'#065f46',color:'#6ee7b7'},rejected:{background:'#7f1d1d',color:'#fca5a5'},admin:{background:'#7f1d1d',color:'#fca5a5'},member:{background:'#1e3a5f',color:'#60a5fa'}}[c]||{background:'#1e3a5f',color:'#60a5fa'}) }),
  th: { background:'#1f2937',padding:'10px 14px',textAlign:'left',fontSize:12,color:'#9ca3af',fontWeight:600 },
  td: { padding:'10px 14px',borderTop:'1px solid #1f2937',fontSize:13 },
  link: { color:'#60a5fa',textDecoration:'none' },
};

const LEAGUE_COLORS = {'La Liga':'#60a5fa','Premier League':'#c084fc','Serie A':'#86efac','Bundesliga':'#fbbf24','Ligue 1':'#a5b4fc','Liga 1':'#fca5a5','Timnas':'#fca5a5','Pemain':'#6ee7b7'};

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
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh'}}>
      <div style={{background:'#111827',border:'1px solid #1f2937',borderRadius:16,padding:48,width:400}}>
        <h1 style={{...S.h1,fontSize:28,textAlign:'center',marginBottom:8}}>Football Bot Dashboard</h1>
        <p style={{color:'#6b7280',fontSize:14,textAlign:'center',marginBottom:32}}>Masukkan kredensial</p>
        {err && <div style={{background:'#7f1d1d',color:'#fca5a5',padding:10,borderRadius:8,textAlign:'center',marginBottom:16,fontSize:14}}>{err}</div>}
        <div style={{marginBottom:20}}>
          <label style={{display:'block',fontSize:13,color:'#9ca3af',marginBottom:6}}>Username</label>
          <input style={S.input} value={u} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} />
        </div>
        <div style={{marginBottom:20}}>
          <label style={{display:'block',fontSize:13,color:'#9ca3af',marginBottom:6}}>Password</label>
          <input style={S.input} type="password" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} />
        </div>
        <button onClick={login} style={{width:'100%',padding:14,background:'linear-gradient(135deg,#FFD700,#FF8C00)',border:'none',borderRadius:8,color:'#000',fontSize:16,fontWeight:700,cursor:'pointer'}}>Login</button>
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

  // Posting tracker
  const [postTracker, setPostTracker] = useState([]);
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
    // Ini menangkap konten yang SAMA meski URL di-edit/potong/ganti parameter
    if (fingerprint) {
      const { data: fpMatch } = await supabase
        .from('content_registry')
        .select('user_name, group_name, original_url, created_at')
        .eq('fingerprint', fingerprint)
        .limit(1);

      if (fpMatch && fpMatch.length > 0) {
        const d = fpMatch[0];
        const isOwnContent = d.user_name === user.name;
        if (!isOwnContent) {
          setPtMsg(`Konten ini sudah dipakai oleh "${d.user_name}" di "${d.group_name}". Tidak boleh menggunakan konten yang sama dengan member lain!`);
          return;
        }
        // Kalau konten sendiri tapi beda grup → juga blokir (anti duplikat antar grup)
        const grp = groups.find(g => g.id === ptGroup);
        if (d.group_name !== (grp?.name || '')) {
          setPtMsg(`Kamu sudah menggunakan konten ini di "${d.group_name}". Gunakan konten berbeda untuk setiap grup!`);
          return;
        }
      }
    }

    // ── CEK 3: pHash — deteksi gambar SAMA meski di-save & upload ulang ──
    // Hanya untuk gambar (bukan video), cek visual similarity via API
    if (ptType === 'gambar1' || ptType === 'gambar2') {
      setPtMsg('Memeriksa keaslian gambar...');
      try {
        const res = await fetch('/api/check-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: linkTrimmed, userName: user.name }),
        });
        const result = await res.json();
        if (result.isDuplicate && result.isOtherMember) {
          setPtMsg(`DITOLAK: ${result.message}`);
          return;
        }
        if (result.isDuplicate && result.match) {
          setPtMsg(`Peringatan: Gambar mirip ${result.similarity}% dengan posting di "${result.match.group}". Gunakan gambar berbeda!`);
          return;
        }
      } catch (e) {
        // Kalau API error, lanjut tanpa pHash check (jangan block posting)
        console.warn('pHash check failed:', e.message);
      }
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

    // ── Simpan pHash gambar ke image_hashes (untuk deteksi visual duplikat) ──
    if (ptType === 'gambar1' || ptType === 'gambar2') {
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
            content_type: 'gambar',
            source: 'member',
          });
        }
      } catch (e) { /* silent — hash sudah di-check sebelumnya */ }
    }

    setPtLink(''); setPtMsg('Link berhasil disimpan!');
    loadPostTracker(ptPeriod);
  };

  const deletePostEntry = async (id) => {
    if (!confirm('Hapus entry ini?')) return;
    await supabase.from('posting_tracker').delete().eq('id', id);
    loadPostTracker(ptPeriod);
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

  // Dynamic accounts — dari database
  const reelsAccounts = botAccounts.filter(a => (a.account_type === 'reels' || a.account_type === 'both') && a.is_active);
  const grupAccounts = botAccounts.filter(a => (a.account_type === 'grup' || a.account_type === 'both') && a.is_active);

  const loadReelsTasks = async () => {
    const { data } = await supabase.from('reels_tasks').select('*').order('created_at', { ascending: false }).limit(50);
    setReelsTasks(data || []);
  };

  const createReelsTask = async (accountId, accountName) => {
    const { error } = await supabase.from('reels_tasks').insert({
      account_id: accountId,
      account_name: accountName,
      keyword: reelsKeyword || null,
      status: 'pending',
    });
    if (error) setReelsMsg('Error: ' + error.message);
    else { setReelsMsg(`Tugas reels dibuat untuk ${accountName}!`); loadReelsTasks(); }
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
            {/* PROGRESS TARGET HARI INI — visible untuk admin & member */}
            <div style={S.box}>
              <h3 style={{color:'#FFD700',marginBottom:8,fontSize:16}}>Progress Target Hari Ini</h3>
              <p style={{color:'#9ca3af',fontSize:12,marginBottom:16}}>
                Target grup harian per member. Kategori berdasarkan persentase pencapaian: Sangat Bagus (100%) / Bagus (70-99%) / Sedang (50-69%) / Buruk (40-49%) / Sangat Buruk (&lt;40%).
              </p>
              {(() => {
                const today = new Date().toISOString().split('T')[0];
                const todayTracker = postTracker.filter(p => p.period === today);
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
                      </tr>
                    </thead>
                    <tbody>
                      {members.length === 0 && (
                        <tr><td colSpan={6} style={{...S.td,textAlign:'center',color:'#6b7280'}}>Belum ada member terdaftar</td></tr>
                      )}
                      {members.map((m, i) => {
                        const target = m.daily_target || 0;
                        const memberPosts = todayTracker.filter(p => p.user_name === m.name);
                        const completedGroups = new Set(memberPosts.map(p => p.group_id)).size;
                        const cat = getTargetCategory(completedGroups, target);
                        const pct = target > 0 ? Math.min(100, Math.round((completedGroups / target) * 100)) : 0;
                        const isMe = !isAdmin && user && m.id === user.id;
                        return (
                          <tr key={m.id} style={isMe?{background:'#1a2744'}:undefined}>
                            <td style={S.td}>{i+1}</td>
                            <td style={{...S.td,fontWeight:600}}>{m.name}{isMe && <span style={{marginLeft:6,fontSize:10,color:'#FFD700'}}>(Kamu)</span>}</td>
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>

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

              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:12,color:'#9ca3af',marginBottom:4}}>Keyword pencarian (opsional, kosongkan = random)</label>
                <input style={S.input} placeholder="Contoh: messi goals, premier league highlights" value={reelsKeyword} onChange={e=>setReelsKeyword(e.target.value)} />
              </div>

              {reelsMsg && <p style={{marginTop:8,fontSize:13,color:reelsMsg.includes('Error')?'#ef4444':'#10b981'}}>{reelsMsg}</p>}

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
                      <th style={S.th}>Keyword</th>
                      <th style={S.th}>Status</th>
                      <th style={S.th}>Waktu</th>
                      <th style={S.th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reelsTasks.map((t, i) => (
                      <tr key={t.id}>
                        <td style={S.td}>{i+1}</td>
                        <td style={{...S.td,fontWeight:600}}>{t.account_name}</td>
                        <td style={{...S.td,fontSize:12,color:'#9ca3af'}}>{t.keyword || 'random'}</td>
                        <td style={S.td}>
                          <span style={S.badge(t.status === 'done' ? 'ok' : t.status === 'failed' ? 'fail' : 'pending')}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{...S.td,fontSize:12,color:'#6b7280'}}>{new Date(t.created_at).toLocaleString('id-ID')}</td>
                        <td style={S.td}>
                          <button onClick={()=>deleteReelsTask(t.id)} style={{...S.btn('#7f1d1d'),fontSize:11,padding:'4px 8px'}}>Hapus</button>
                        </td>
                      </tr>
                    ))}
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
