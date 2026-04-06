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
  const [wsEditing, setWsEditing] = useState(null); // {groupId, week, value}
  const [wsSaving, setWsSaving] = useState(false);

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
      const { data: u } = await supabase.from('users').select('id,username,name,role,created_at');
      setUsers(u || []);
    } else {
      const { data: l } = await supabase.from('link_submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setLinks(l || []);
    }
  };

  const submitLink = async () => {
    if (!linkUrl.trim()) { setLinkMsg('Link wajib diisi!'); return; }
    const grp = groups.find(g => g.id === linkGroup);
    await supabase.from('link_submissions').insert({
      user_id: user.id, user_name: user.name, group_id: linkGroup,
      group_name: grp?.name || '', link: linkUrl.trim(), note: linkNote.trim(),
      status: 'approved',
    });
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

  const getGroupTotal = (groupId) => {
    return weeklyStats.filter(w => w.group_id === groupId).reduce((sum, w) => sum + (parseFloat(w.value) || 0), 0);
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

  if (!user) return <LoginScreen onLogin={login} />;

  const isAdmin = user.role === 'admin';
  const adminTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'weekly', label: 'Data Mingguan' },
    { id: 'groups', label: `Grup (${groups.length})` },
    { id: 'submitlink', label: 'Link Postingan' },
    { id: 'users', label: 'Kelola User' },
    { id: 'activity', label: 'Activity Log' },
  ];
  const memberTabs = [
    { id: 'groups', label: 'Daftar Grup' },
    { id: 'weekly', label: 'Data Mingguan' },
    { id: 'submitlink', label: 'Submit Link' },
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
        {tabs.map(t => <div key={t.id} style={S.tab(tab===t.id)} onClick={() => { setTab(t.id); if(t.id==='weekly') loadWeeklyStats(wsYear, wsMonth); }}>{t.label}</div>)}
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
                        <td style={{...S.td,textAlign:'center',fontWeight:700,fontSize:15,color: total >= 10000 ? '#10b981' : total >= 5000 ? '#f59e0b' : total > 0 ? '#e5e7eb' : '#374151',background:'rgba(22,36,21,0.3)'}}>
                          {total > 0 ? Number(total).toLocaleString('id-ID') : '-'}
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
                    <td style={S.td}>{i+1}</td>
                    <td style={S.td}><a href={g.url} target="_blank" style={S.link}>{g.name}</a></td>
                    <td style={S.td}>{g.club}</td>
                    <td style={S.td}><span style={{...S.badge('ok'),background:LEAGUE_COLORS[g.league]?'#1e3a5f':'#1f2937'}}>{g.league}</span></td>
                    {isAdmin && <td style={S.td}><button onClick={()=>deleteGroup(g.id)} style={{...S.btn('#7f1d1d'),padding:'3px 8px',fontSize:11}}>Hapus</button></td>}
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
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={S.th}>Username</th><th style={S.th}>Nama</th><th style={S.th}>Role</th><th style={S.th}>Dibuat</th><th style={S.th}>Aksi</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}><td style={S.td}>{u.username}</td><td style={S.td}>{u.name}</td><td style={S.td}><span style={S.badge(u.role)}>{u.role}</span></td>
                    <td style={{...S.td,fontSize:12,color:'#6b7280'}}>{u.created_at?new Date(u.created_at).toLocaleDateString('id-ID'):''}</td>
                    <td style={S.td}>{u.username==='admin'?<span style={{color:'#6b7280',fontSize:11}}>Owner</span>:<button onClick={()=>deleteUser(u.id)} style={{...S.btn('#7f1d1d'),padding:'3px 8px',fontSize:11}}>Hapus</button>}</td></tr>
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
