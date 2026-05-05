'use client';
/**
 * Preview HUD — Sci-fi tactical dashboard preview
 * Standalone route /preview-hud, gak nyentuh main dashboard.
 *
 * Theme: Mix Midnight Stadium (navy/green/gold) + HUD cyan + tactical frames.
 * Animasi: rotating rings, pulsing core, scanning lines, count-up, drifting stars,
 * blinking sector codes, animated bars, scrolling activity stream.
 *
 * Data source: real Supabase (groups + posting_tracker), graceful fallback
 * kalau gagal load (preview tetep render dengan placeholder).
 */
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

// ── Theme tokens (mix Midnight Stadium + HUD) ──
const C = {
  bg: '#040714',           // deeper navy than Midnight Stadium
  surface: '#0B1120',
  cyan: '#22D3EE',         // primary HUD
  cyanDim: '#0e7490',
  cyanGlow: 'rgba(34, 211, 238, 0.4)',
  green: '#22C55E',        // Midnight Stadium primary
  gold: '#F59E0B',
  red: '#EF4444',
  text: '#E5E7EB',
  textDim: '#94A3B8',
  textFaint: '#475569',
  grid: 'rgba(34, 211, 238, 0.08)',
};

// ── Local date helper ──
const localDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// ── Count-up hook (RAF, ease-out cubic, prefers-reduced-motion) ──
function useCountUp(end, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (typeof end !== 'number' || isNaN(end)) { setV(end || 0); return; }
    if (end === 0) { setV(0); return; }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setV(end); return;
    }
    const t0 = performance.now();
    let id;
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(end * eased));
      if (p < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [end, duration]);
  return v;
}

// ── Star field background (canvas) ──
function StarField() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    let raf;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      r: Math.random() * 1.6 + 0.3,
      vy: Math.random() * 0.08 + 0.02,
      o: Math.random() * 0.6 + 0.2,
      tw: Math.random() * 0.02,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      stars.forEach(s => {
        s.y += s.vy;
        s.o += s.tw; if (s.o > 0.9 || s.o < 0.1) s.tw *= -1;
        if (s.y > cv.height) { s.y = 0; s.x = Math.random() * cv.width; }
        ctx.fillStyle = `rgba(34, 211, 238, ${s.o})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.7 }} />;
}

// ── Corner brackets (decorative tactical frame) ──
function CornerBrackets() {
  const arm = 28;
  const stroke = 2;
  const c = C.cyan;
  const corner = (pos) => {
    const base = { position: 'absolute', width: arm, height: arm, borderColor: c, pointerEvents: 'none' };
    if (pos === 'tl') return { ...base, top: 12, left: 12, borderTop: `${stroke}px solid ${c}`, borderLeft: `${stroke}px solid ${c}` };
    if (pos === 'tr') return { ...base, top: 12, right: 12, borderTop: `${stroke}px solid ${c}`, borderRight: `${stroke}px solid ${c}` };
    if (pos === 'bl') return { ...base, bottom: 12, left: 12, borderBottom: `${stroke}px solid ${c}`, borderLeft: `${stroke}px solid ${c}` };
    if (pos === 'br') return { ...base, bottom: 12, right: 12, borderBottom: `${stroke}px solid ${c}`, borderRight: `${stroke}px solid ${c}` };
  };
  return <>
    <div style={corner('tl')} /><div style={corner('tr')} />
    <div style={corner('bl')} /><div style={corner('br')} />
  </>;
}

// ── Sector code label (blinking [XX]) ──
function SectorCode({ code, color = C.cyan }) {
  return (
    <span style={{
      fontFamily: 'Menlo, Consolas, monospace',
      fontSize: 10, color, letterSpacing: 1, padding: '1px 6px',
      border: `1px solid ${color}66`,
      background: 'rgba(0,0,0,0.4)',
      animation: 'hud-blink 3s infinite',
    }}>[{code}]</span>
  );
}

// ── Tactical panel (sector frame with corner accents) ──
function Panel({ title, code, color = C.cyan, children, style = {} }) {
  return (
    <div style={{
      position: 'relative',
      background: 'rgba(11, 17, 32, 0.7)',
      border: `1px solid ${color}33`,
      backdropFilter: 'blur(8px)',
      padding: 12,
      ...style,
    }}>
      {/* Inner corner accents */}
      <div style={{ position: 'absolute', top: -1, left: -1, width: 12, height: 12, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ position: 'absolute', top: -1, right: -1, width: 12, height: 12, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 12, height: 12, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      {(title || code) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 11, color, letterSpacing: 1.5, fontFamily: 'Menlo, Consolas, monospace', textTransform: 'uppercase' }}>
          <span>{title}</span>
          {code && <SectorCode code={code} color={color} />}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Rotating concentric rings (HUD circle reticle) ──
function HudReticle({ size = 240, value = 0, label = 'TARGET' }) {
  const cnt = useCountUp(value, 1600);
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      {/* Outer ring rotating slow */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, animation: 'hud-spin-slow 24s linear infinite' }}>
        <circle cx={size/2} cy={size/2} r={size/2 - 8} fill="none" stroke={C.cyan} strokeWidth="1" strokeDasharray="2 6" opacity="0.6"/>
      </svg>
      {/* Mid ring rotating reverse */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, animation: 'hud-spin-reverse 16s linear infinite' }}>
        <circle cx={size/2} cy={size/2} r={size/2 - 26} fill="none" stroke={C.cyan} strokeWidth="1" opacity="0.8"/>
        <circle cx={size/2} cy={8} r="3" fill={C.cyan}/>
        <circle cx={size/2} cy={size - 8} r="3" fill={C.cyan}/>
      </svg>
      {/* Inner ring with tick marks */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, animation: 'hud-spin-slow 36s linear infinite' }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const r1 = size/2 - 44;
          const r2 = size/2 - 38;
          return <line key={i} x1={size/2 + Math.cos(a) * r1} y1={size/2 + Math.sin(a) * r1} x2={size/2 + Math.cos(a) * r2} y2={size/2 + Math.sin(a) * r2} stroke={C.cyan} strokeWidth="1" opacity={i % 6 === 0 ? 1 : 0.5}/>;
        })}
      </svg>
      {/* Crosshair */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
        <line x1={size/2} y1="20" x2={size/2} y2="44" stroke={C.cyan} strokeWidth="1.5"/>
        <line x1={size/2} y1={size - 44} x2={size/2} y2={size - 20} stroke={C.cyan} strokeWidth="1.5"/>
        <line x1="20" y1={size/2} x2="44" y2={size/2} stroke={C.cyan} strokeWidth="1.5"/>
        <line x1={size - 44} y1={size/2} x2={size - 20} y2={size/2} stroke={C.cyan} strokeWidth="1.5"/>
      </svg>
      {/* Center pulsing core */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.cyan} 0%, ${C.cyanGlow} 40%, transparent 70%)`,
          animation: 'hud-pulse 2.4s ease-in-out infinite',
          marginBottom: 8,
        }} />
        <div style={{ fontSize: 36, fontWeight: 800, color: C.cyan, fontFamily: 'Menlo, Consolas, monospace', letterSpacing: 1, textShadow: `0 0 20px ${C.cyanGlow}` }}>
          {String(cnt).padStart(3, '0')}
        </div>
        <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Animated bar chart (cyan glow, rise animation) ──
function BarChart({ data, color = C.cyan, accent = C.green }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 100, padding: '0 4px' }}>
      {data.map((d, i) => {
        const h = (d.value / max) * 100;
        const isHigh = d.value >= max * 0.7;
        return (
          <div key={i} title={`${d.label}: ${d.value}`} style={{
            flex: 1, minWidth: 6,
            height: `${Math.max(2, h)}%`,
            background: `linear-gradient(180deg, ${isHigh ? accent : color}, ${color}55)`,
            boxShadow: `0 0 8px ${isHigh ? accent : color}66`,
            animation: `hud-bar-rise 0.8s ease-out ${i * 30}ms both`,
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -2, left: 0, right: 0, height: 2, background: isHigh ? accent : color, boxShadow: `0 0 6px ${isHigh ? accent : color}` }} />
          </div>
        );
      })}
    </div>
  );
}

// ── Circular gauge (cycle progress) ──
function CircularGauge({ value, max = 4, size = 80, label, color = C.cyan }) {
  const pct = Math.min(value / max, 1);
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}22`} strokeWidth="3"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 4px ${color})` }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: 'Menlo, Consolas, monospace' }}>{value}/{max}</div>
        {label && <div style={{ fontSize: 9, color: C.textDim, marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}

// ── Scrolling activity stream (terminal-style) ──
function ActivityStream({ events }) {
  return (
    <div style={{ maxHeight: 220, overflow: 'hidden', position: 'relative', fontFamily: 'Menlo, Consolas, monospace', fontSize: 11 }}>
      <div style={{ animation: events.length > 8 ? `hud-scroll ${events.length * 2}s linear infinite` : 'none' }}>
        {events.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: `1px dashed ${C.cyan}11`, color: C.text }}>
            <span style={{ color: C.cyanDim, minWidth: 50 }}>{e.time}</span>
            <span style={{ color: e.color || C.cyan, minWidth: 60 }}>{e.tag}</span>
            <span style={{ color: C.textDim, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Waveform (animated audio-spectrum-like) ──
function Waveform({ color = C.cyan }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center', height: 60, padding: '0 4px' }}>
      {Array.from({ length: 36 }).map((_, i) => (
        <div key={i} style={{
          flex: 1, minWidth: 2,
          background: color,
          height: `${30 + Math.sin(i * 0.5) * 20}%`,
          animation: `hud-wave 1.${i % 9}s ease-in-out infinite alternate`,
          animationDelay: `${i * 30}ms`,
          boxShadow: `0 0 4px ${color}`,
        }}/>
      ))}
    </div>
  );
}

// ── Scanning line overlay ──
function ScanLine() {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: 0, height: 2,
      background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
      animation: 'hud-scan 4s ease-in-out infinite',
      boxShadow: `0 0 12px ${C.cyan}`,
      pointerEvents: 'none',
    }}/>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function PreviewHud() {
  const [tab, setTab] = useState('overview'); // overview | tracking | analytics
  const [groups, setGroups] = useState([]);
  const [postTracker, setPostTracker] = useState([]);
  const [history30d, setHistory30d] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const today = localDateString();
        const [grpRes, ptRes, histRes] = await Promise.all([
          supabase.from('groups').select('*').order('name'),
          supabase.from('posting_tracker').select('*').eq('period', today),
          supabase.from('posting_tracker').select('period, is_complete, group_id').gte('period', new Date(Date.now() - 30*86400e3).toISOString().slice(0,10)),
        ]);
        setGroups(grpRes.data || []);
        setPostTracker(ptRes.data || []);
        setHistory30d(histRes.data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Stats
  const totalGroups = groups.length;
  const completeToday = postTracker.filter(p => p.is_complete).length;
  const inProgress = postTracker.filter(p => !p.is_complete && (p.gambar1_link || p.gambar2_link || p.video_link)).length;
  const pendingGroups = totalGroups - new Set(postTracker.map(p => p.group_id)).size;
  const completionPct = totalGroups ? Math.round((completeToday / (totalGroups * 4)) * 100) : 0;

  // Daily history → chart data
  const dailyMap = {};
  history30d.forEach(p => {
    if (!dailyMap[p.period]) dailyMap[p.period] = 0;
    if (p.is_complete) dailyMap[p.period]++;
  });
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return { label: key.slice(5), value: dailyMap[key] || 0 };
  });

  // Per-group cycle status
  const groupStatus = groups.slice(0, 12).map(g => {
    const entries = postTracker.filter(p => p.group_id === g.id);
    const complete = entries.filter(e => e.is_complete).length;
    return { ...g, cycleComplete: complete, cycleTotal: 4 };
  });

  // Activity events from postTracker
  const events = postTracker
    .filter(p => p.gambar1_link || p.gambar2_link || p.video_link)
    .slice(0, 20)
    .map(p => ({
      time: new Date(p.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      tag: p.is_complete ? 'COMPLETE' : 'IN-PROG',
      color: p.is_complete ? C.green : C.gold,
      msg: `${p.group_name || 'GROUP'} · S${p.cycle} · ${p.user_name || 'member'}`,
    }));
  const activityEvents = events.length ? events : [
    { time: '--:--', tag: 'IDLE', color: C.textDim, msg: 'Awaiting telemetry...' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at center, ${C.surface} 0%, ${C.bg} 100%)`,
      color: C.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes hud-spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes hud-spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes hud-pulse {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 20px ${C.cyanGlow}; }
          50% { transform: scale(1.15); opacity: 0.8; box-shadow: 0 0 40px ${C.cyan}; }
        }
        @keyframes hud-blink { 0%, 90%, 100% { opacity: 1; } 95% { opacity: 0.3; } }
        @keyframes hud-bar-rise { from { height: 0; opacity: 0; } to { opacity: 1; } }
        @keyframes hud-scroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes hud-wave {
          from { height: 10%; }
          to { height: 100%; }
        }
        @keyframes hud-scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes hud-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .hud-fade { animation: hud-fade-in 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <StarField />
      <CornerBrackets />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.cyan}22` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `radial-gradient(circle, ${C.cyan}, ${C.cyanDim})`,
            boxShadow: `0 0 20px ${C.cyanGlow}`,
            animation: 'hud-pulse 2s ease-in-out infinite',
          }}/>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.cyan, letterSpacing: 2, fontFamily: 'Menlo, Consolas, monospace' }}>FOOTBALL.BOT.HUD</div>
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1 }}>TACTICAL MONITORING SYSTEM v4.0 — PREVIEW</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['overview', 'tracking', 'analytics'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? `${C.cyan}22` : 'transparent',
              border: `1px solid ${tab === t ? C.cyan : C.cyan + '44'}`,
              color: tab === t ? C.cyan : C.textDim,
              padding: '8px 18px',
              fontFamily: 'Menlo, Consolas, monospace',
              fontSize: 11,
              letterSpacing: 1.5,
              cursor: 'pointer',
              textTransform: 'uppercase',
              boxShadow: tab === t ? `0 0 12px ${C.cyanGlow}` : 'none',
              transition: 'all 0.2s',
            }}>
              [{t.substring(0, 4)}]
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'right', fontFamily: 'Menlo, Consolas, monospace' }}>
          <div style={{ fontSize: 18, color: C.cyan, letterSpacing: 1 }}>{now.toLocaleTimeString('id-ID')}</div>
          <div style={{ fontSize: 10, color: C.textDim }}>{now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ position: 'relative', zIndex: 1, padding: 24 }}>
        {tab === 'overview' && (
          <div className="hud-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 16 }}>
            {/* LEFT — stats column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Panel title="System Status" code="01" color={C.green}>
                <ScanLine />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <StatCell label="GROUPS" value={totalGroups} color={C.cyan}/>
                  <StatCell label="COMPLETE" value={completeToday} color={C.green}/>
                  <StatCell label="IN-PROG" value={inProgress} color={C.gold}/>
                  <StatCell label="PENDING" value={pendingGroups} color={C.red}/>
                </div>
              </Panel>

              <Panel title="Cycle Telemetry" code="02">
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
                  <CircularGauge value={completeToday} max={totalGroups || 4} size={70} label="DONE" color={C.green}/>
                  <CircularGauge value={inProgress} max={totalGroups || 4} size={70} label="ACTIVE" color={C.gold}/>
                  <CircularGauge value={pendingGroups} max={totalGroups || 4} size={70} label="WAIT" color={C.red}/>
                </div>
              </Panel>

              <Panel title="Bandwidth" code="03">
                <Waveform color={C.cyan}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textDim, marginTop: 6, fontFamily: 'Menlo, Consolas, monospace' }}>
                  <span>RX: {(Math.random() * 120).toFixed(1)} kb/s</span>
                  <span>TX: {(Math.random() * 80).toFixed(1)} kb/s</span>
                </div>
              </Panel>
            </div>

            {/* CENTER — main reticle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Panel title="Mission Status" code="00" color={C.cyan} style={{ minHeight: 380 }}>
                <ScanLine />
                <HudReticle size={300} value={completionPct} label="COMPLETION %"/>
                <div style={{ marginTop: 12, padding: '10px 0', borderTop: `1px dashed ${C.cyan}33`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontFamily: 'Menlo, Consolas, monospace', fontSize: 11 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: C.cyan, fontSize: 16, fontWeight: 700 }}>{loading ? '--' : totalGroups}</div>
                    <div style={{ color: C.textDim, fontSize: 9, letterSpacing: 1 }}>TARGETS</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: C.green, fontSize: 16, fontWeight: 700 }}>{loading ? '--' : completeToday}</div>
                    <div style={{ color: C.textDim, fontSize: 9, letterSpacing: 1 }}>HIT</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: C.gold, fontSize: 16, fontWeight: 700 }}>{loading ? '--' : inProgress}</div>
                    <div style={{ color: C.textDim, fontSize: 9, letterSpacing: 1 }}>ACTIVE</div>
                  </div>
                </div>
              </Panel>

              <Panel title="Daily Throughput — Last 14d" code="04">
                <BarChart data={last14Days} color={C.cyan} accent={C.green}/>
              </Panel>
            </div>

            {/* RIGHT — activity + map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Panel title="Activity Stream" code="05" color={C.gold}>
                <ScanLine />
                <ActivityStream events={activityEvents}/>
              </Panel>

              <Panel title="Group Sectors" code="06">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, maxHeight: 200, overflow: 'auto' }}>
                  {groupStatus.slice(0, 6).map((g, i) => (
                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: `${C.cyan}08`, border: `1px solid ${C.cyan}22`, fontFamily: 'Menlo, Consolas, monospace', fontSize: 11 }}>
                      <span style={{ color: C.text }}>[{String(i+1).padStart(2,'0')}] {g.name?.substring(0, 18)}</span>
                      <span style={{ color: g.cycleComplete >= 4 ? C.green : g.cycleComplete >= 2 ? C.gold : C.red }}>{g.cycleComplete}/4</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {tab === 'tracking' && (
          <div className="hud-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {groupStatus.map((g, i) => (
              <Panel key={g.id} title={g.name?.substring(0, 24) || `GROUP ${i+1}`} code={String(i+1).padStart(2, '0')} color={g.cycleComplete >= 4 ? C.green : g.cycleComplete >= 2 ? C.gold : C.cyan}>
                <ScanLine />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <CircularGauge value={g.cycleComplete} max={4} size={90} label="CYCLES" color={g.cycleComplete >= 4 ? C.green : g.cycleComplete >= 2 ? C.gold : C.cyan}/>
                  <div style={{ flex: 1, fontFamily: 'Menlo, Consolas, monospace', fontSize: 10 }}>
                    <div style={{ color: C.textDim, marginBottom: 4 }}>CLUB: <span style={{ color: C.text }}>{g.club || '—'}</span></div>
                    <div style={{ color: C.textDim, marginBottom: 4 }}>LEAGUE: <span style={{ color: C.text }}>{g.league || '—'}</span></div>
                    <div style={{ color: C.textDim }}>STATUS: <span style={{ color: g.cycleComplete >= 4 ? C.green : C.gold }}>{g.cycleComplete >= 4 ? 'COMPLETE' : 'IN-PROGRESS'}</span></div>
                  </div>
                </div>
                {/* Cycle indicator dots */}
                <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'center' }}>
                  {[1,2,3,4].map(c => (
                    <div key={c} style={{
                      width: 24, height: 24, borderRadius: 4,
                      border: `1px solid ${c <= g.cycleComplete ? (g.cycleComplete >= 4 ? C.green : C.gold) : C.cyanDim}`,
                      background: c <= g.cycleComplete ? (g.cycleComplete >= 4 ? `${C.green}33` : `${C.gold}33`) : 'transparent',
                      color: c <= g.cycleComplete ? (g.cycleComplete >= 4 ? C.green : C.gold) : C.textFaint,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontFamily: 'Menlo, Consolas, monospace', fontWeight: 700,
                    }}>{c}</div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        )}

        {tab === 'analytics' && (
          <div className="hud-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Panel title="Throughput — 14 Days" code="A1" color={C.cyan} style={{ gridColumn: 'span 2' }}>
              <ScanLine />
              <BarChart data={last14Days} color={C.cyan} accent={C.green}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: C.textDim, fontFamily: 'Menlo, Consolas, monospace' }}>
                <span>14 DAYS AGO</span>
                <span>TODAY</span>
              </div>
            </Panel>

            <Panel title="Spectrum Analysis" code="A2" color={C.gold}>
              <Waveform color={C.gold}/>
              <div style={{ marginTop: 12, fontFamily: 'Menlo, Consolas, monospace', fontSize: 10, color: C.textDim }}>
                <div>FREQ.PEAK: 8.4 kHz</div>
                <div>AVG.AMP: -12 dB</div>
                <div>SAMPLES: 4096/s</div>
              </div>
            </Panel>

            <Panel title="Performance Vector" code="A3" color={C.green}>
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px 0' }}>
                <CircularGauge value={completionPct} max={100} size={100} label="COMPLETE %" color={C.green}/>
                <CircularGauge value={Math.min(activityEvents.length, 100)} max={100} size={100} label="EVENTS" color={C.cyan}/>
              </div>
            </Panel>

            <Panel title="Live Telemetry" code="A4" color={C.cyan} style={{ gridColumn: 'span 2' }}>
              <ScanLine />
              <ActivityStream events={activityEvents}/>
            </Panel>
          </div>
        )}
      </div>

      {/* Footer status bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '6px 32px', borderTop: `1px solid ${C.cyan}33`, background: 'rgba(4,7,20,0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Menlo, Consolas, monospace', fontSize: 10, color: C.textDim, zIndex: 2 }}>
        <span>SYS: <span style={{ color: C.green }}>ONLINE</span> · LINK: <span style={{ color: C.green }}>SECURE</span> · DB: <span style={{ color: loading ? C.gold : C.green }}>{loading ? 'SYNC...' : 'CONNECTED'}</span></span>
        <span>FOOTBALL.BOT.HUD v4.0 · PREVIEW MODE · <a href="/" style={{ color: C.cyan, textDecoration: 'none' }}>← BACK TO MAIN</a></span>
      </div>
    </div>
  );
}

// Stat cell helper
function StatCell({ label, value, color }) {
  const v = useCountUp(value, 1200);
  return (
    <div style={{ padding: '10px 8px', background: `${color}08`, border: `1px solid ${color}33` }}>
      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, fontFamily: 'Menlo, Consolas, monospace' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: 'Menlo, Consolas, monospace', textShadow: `0 0 12px ${color}66`, marginTop: 2 }}>{String(v).padStart(2, '0')}</div>
    </div>
  );
}
