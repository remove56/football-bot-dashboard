'use client';
import React, { useState, useEffect, useRef } from 'react';

/**
 * MatchdayMarquee — running text scrolling.
 * Pakai JavaScript-driven animation (requestAnimationFrame), bukan CSS keyframes.
 * Reliable di semua browser + bypass Next.js style transform issues.
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
    padding: '0 24px 0 16px',
    background: 'linear-gradient(90deg, rgba(11,17,32,0.95) 70%, rgba(11,17,32,0) 100%)',
    color: '#22C55E',
    fontFamily: 'Menlo, Consolas, "Courier New", monospace',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    zIndex: 2,
    pointerEvents: 'none',
  },
  scrollWrap: {
    paddingLeft: '180px',
    overflow: 'hidden',
  },
  scrollContent: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    fontSize: 14,
    fontWeight: 600,
    color: '#E5E7EB',
    fontFamily: 'Menlo, Consolas, "Courier New", monospace',
    letterSpacing: 0.3,
    willChange: 'transform',
    transform: 'translateX(0)',
  },
  vs: { color: '#F59E0B', fontWeight: 900, padding: '0 6px' },
  item: { paddingRight: 40 },
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
  const scrollRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/matchday', { cache: 'no-store' });
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setFixtures(json.fixtures || []);
    } catch (e) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  // JS-driven scroll animation — manipulate transform tiap frame
  useEffect(() => {
    if (fixtures.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;

    const speed = 60; // pixels per second
    let offset = 0;
    let lastTime;
    let rafId;

    function tick(now) {
      if (lastTime === undefined) lastTime = now;
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      offset -= speed * dt;

      // Reset saat lewatin 50% width (karena content di-doubled, 50% = 1 set full)
      const halfWidth = el.scrollWidth / 2;
      if (Math.abs(offset) >= halfWidth && halfWidth > 0) {
        offset = 0;
      }

      el.style.transform = `translateX(${offset}px)`;
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [fixtures]);

  if (loading && fixtures.length === 0) return null;
  if (fixtures.length === 0) return null;

  const itemElements = fixtures.map((f, idx) => (
    <span key={`fx-${idx}`} style={S.item}>
      🔥 {formatKickoff(f.kickoff)} WIB&nbsp;
      <strong>{f.home}</strong><span style={S.vs}>VS</span><strong>{f.away}</strong>
      &nbsp;📍 {f.venue || '—'}&nbsp;[{f.competition}]
      &nbsp;&nbsp;⚽
    </span>
  ));

  // Duplicate items untuk seamless loop
  const doubledItems = [
    ...itemElements,
    ...itemElements.map((el, i) => React.cloneElement(el, { key: `dup-${i}` })),
  ];

  return (
    <div style={S.bar}>
      <div style={S.prefix}>⚽ MATCHDAY HARI INI</div>
      <div style={S.scrollWrap}>
        <div ref={scrollRef} style={S.scrollContent}>{doubledItems}</div>
      </div>
    </div>
  );
}
