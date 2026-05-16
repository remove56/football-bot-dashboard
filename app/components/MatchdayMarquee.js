'use client';
import React, { useState, useEffect } from 'react';

/**
 * MatchdayMarquee — running text scrolling at top of dashboard.
 * Always visible (di luar tab), kasih reminder visual matchday hari ini.
 * Auto-refresh data tiap 60 detik.
 */

const S = {
  bar: {
    background: 'linear-gradient(90deg, rgba(11,17,32,0.85), rgba(17,24,39,0.85), rgba(11,17,32,0.85))',
    borderTop: '1px solid rgba(34,211,238,0.20)',
    borderBottom: '1px solid rgba(34,197,94,0.25)',
    padding: '10px 0',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: 'inset 0 0 18px rgba(34,197,94,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  prefix: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    background: 'linear-gradient(90deg, rgba(34,197,94,0.30), rgba(34,197,94,0))',
    color: '#22C55E',
    fontFamily: 'Menlo, Consolas, "Courier New", monospace',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    zIndex: 2,
  },
  inner: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    fontSize: 14,
    fontWeight: 600,
    color: '#E5E7EB',
    paddingLeft: '180px', // space for prefix label
    animation: 'matchdayMarqueeScroll 45s linear infinite',
    fontFamily: 'Menlo, Consolas, "Courier New", monospace',
    letterSpacing: 0.3,
  },
  vs: { color: '#F59E0B', fontWeight: 900, padding: '0 6px' },
  empty: {
    padding: '10px 24px 10px 180px',
    color: '#9CA3AF',
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: 'Menlo, Consolas, "Courier New", monospace',
  },
};

function formatKickoff(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  });
}

export default function MatchdayMarquee() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/matchday', { cache: 'no-store' });
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setFixtures(json.fixtures || []);
    } catch (e) {
      // silent fail — marquee non-critical
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000); // 60s refresh
    return () => clearInterval(id);
  }, []);

  if (loading && fixtures.length === 0) return null; // hide while initial load
  if (fixtures.length === 0) return null; // hide kalau no fixtures

  const items = fixtures.flatMap((f, idx) => [
    <span key={`fx-${idx}`}>
      🔥 {formatKickoff(f.kickoff)} WIB&nbsp;
      <strong>{f.home}</strong><span style={S.vs}>VS</span><strong>{f.away}</strong>
      &nbsp;📍 {f.venue || '—'}&nbsp;[{f.competition}]
    </span>,
    <span key={`sep-${idx}`}>&nbsp;&nbsp;&nbsp;⚽&nbsp;&nbsp;&nbsp;</span>,
  ]);

  // Repeat items 2x untuk seamless loop
  const doubledItems = [...items, ...items];

  return (
    <div style={S.bar}>
      <style>{`
        @keyframes matchdayMarqueeScroll {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(-50%, 0); }
        }
      `}</style>
      <div style={S.prefix}>⚽ MATCHDAY HARI INI</div>
      <div style={S.inner}>{doubledItems}</div>
    </div>
  );
}
