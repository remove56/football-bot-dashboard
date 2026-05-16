'use client';
import React, { useState, useEffect } from 'react';

/**
 * MatchdayTab — Phase 5.1 dashboard component.
 *
 * Shows running text ticker + table of all matchday-ready groups.
 * All status = MANUAL (user post sendiri). Suggested account shown as info.
 *
 * Auto-refresh: 30 detik via setInterval.
 *
 * Match styling: navy + cyan HUD + green pitch + gold accent (S object).
 */

const S = {
  // Marquee scrolling bar
  marqueeBar: {
    background: 'linear-gradient(90deg, rgba(34,197,94,0.20), rgba(245,158,11,0.20), rgba(34,197,94,0.20))',
    border: '1px solid rgba(34,211,238,0.35)',
    borderRadius: 4,
    padding: '14px 0',
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    boxShadow: '0 0 24px rgba(34,211,238,0.15), inset 0 0 24px rgba(34,197,94,0.06)',
  },
  marqueeInner: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    fontSize: 16,
    fontWeight: 700,
    color: '#E5E7EB',
    paddingLeft: '100%',
    animation: 'matchdayScroll 60s linear infinite',
    fontFamily: 'Menlo, Consolas, "Courier New", monospace',
    letterSpacing: 0.5,
  },
  vs: { color: '#F59E0B', fontWeight: 900, padding: '0 8px' },

  // Stat cards
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 },
  stat: (color) => ({
    background: 'rgba(17,24,39,0.55)',
    border: `1px solid ${color}`,
    borderLeft: `4px solid ${color}`,
    borderRadius: 4,
    padding: '14px 18px',
    boxShadow: 'inset 0 0 18px rgba(34,211,238,0.04)',
    backdropFilter: 'blur(8px)',
  }),
  statNum: { fontSize: 32, fontWeight: 900, color: '#E5E7EB', lineHeight: 1, fontFamily: 'Menlo, Consolas, "Courier New", monospace' },
  statLabel: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 },

  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'rgba(17,24,39,0.45)',
    border: '1px solid rgba(34,211,238,0.30)',
    borderRadius: 4,
    overflow: 'hidden',
    backdropFilter: 'blur(8px)',
  },
  th: {
    padding: '12px 14px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: '#22D3EE',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    background: 'rgba(11,17,32,0.55)',
    borderBottom: '1px solid rgba(34,211,238,0.30)',
    fontFamily: 'Menlo, Consolas, "Courier New", monospace',
  },
  td: {
    padding: '12px 14px',
    fontSize: 13,
    color: '#E5E7EB',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  badgeManual: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 700,
    background: 'rgba(245,158,11,0.15)',
    color: '#F59E0B',
    border: '1px solid rgba(245,158,11,0.35)',
    letterSpacing: 0.8,
  },
  code: {
    background: 'rgba(34,211,238,0.10)',
    color: '#22D3EE',
    padding: '2px 6px',
    borderRadius: 3,
    fontSize: 12,
    fontFamily: 'Menlo, Consolas, "Courier New", monospace',
  },

  // Empty + meta + help
  empty: { textAlign: 'center', padding: 48, color: '#9CA3AF', fontStyle: 'italic' },
  meta: { fontSize: 12, color: '#9CA3AF', marginBottom: 14 },
  helpBox: {
    marginTop: 18,
    padding: 14,
    background: 'rgba(17,24,39,0.45)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 4,
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 1.7,
  },
  link: { color: '#22D3EE', textDecoration: 'none' },
  refreshBtn: {
    background: 'rgba(34,197,94,0.15)',
    border: '1px solid rgba(34,197,94,0.45)',
    color: '#22C55E',
    padding: '6px 14px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    cursor: 'pointer',
    fontFamily: 'Menlo, Consolas, "Courier New", monospace',
  },
};

function formatKickoff(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }) + ' WIB';
}

export default function MatchdayTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/matchday', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30000); // auto-refresh 30s
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return <div style={S.empty}>Loading matchday data...</div>;
  }
  if (error) {
    return <div style={{ ...S.empty, color: '#EF4444' }}>Error: {error}</div>;
  }

  const fixtures = data.fixtures || [];
  const groups = data.groups || [];
  const stats = data.stats || { total: 0, with_suggested_account: 0, no_suggested_account: 0 };
  const updatedAt = data.updated_at
    ? new Date(data.updated_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false })
    : '-';

  // Build marquee text (HTML string with vs styling)
  const marqueeFragments = fixtures.map((f, idx) => (
    <span key={f.match_id || idx}>
      🔥 {formatKickoff(f.kickoff)}&nbsp;&nbsp;
      {f.home}<span style={S.vs}>VS</span>{f.away}
      &nbsp;&nbsp;📍 {f.venue || '—'}
      &nbsp;&nbsp;[{f.competition}]
      &nbsp;&nbsp;⚽⚽⚽&nbsp;&nbsp;
    </span>
  ));

  return (
    <div>
      <style>{`
        @keyframes matchdayScroll {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(-100%, 0); }
        }
      `}</style>

      {/* Marquee running text */}
      <div style={S.marqueeBar}>
        <div style={S.marqueeInner}>
          {fixtures.length > 0 ? marqueeFragments :
            '⚽ Belum ada matchday card siap. Run: bun scripts/run-match-scheduler.js --hours 48 --mark ⚽'
          }
        </div>
      </div>

      {/* Meta + refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={S.meta}>
          Last updated: {updatedAt} WIB · Auto-refresh: 30s
        </div>
        <button style={S.refreshBtn} onClick={fetchData}>↻ Refresh</button>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        <div style={S.stat('rgba(34,211,238,0.5)')}>
          <div style={S.statNum}>{stats.total}</div>
          <div style={S.statLabel}>Total grup siap matchday</div>
        </div>
        <div style={S.stat('rgba(34,197,94,0.5)')}>
          <div style={S.statNum}>{stats.with_suggested_account}</div>
          <div style={S.statLabel}>Punya saran akun bot</div>
        </div>
        <div style={S.stat('rgba(245,158,11,0.5)')}>
          <div style={S.statNum}>{stats.no_suggested_account}</div>
          <div style={S.statLabel}>Belum ada saran akun</div>
        </div>
      </div>

      {/* Table */}
      {groups.length === 0 ? (
        <div style={S.empty}>
          Belum ada grup matchday-ready.<br />
          Run di terminal: <code style={S.code}>bun scripts/run-match-scheduler.js --hours 48 --mark --clear-expired</code>
        </div>
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Status</th>
              <th style={S.th}>Grup ID</th>
              <th style={S.th}>Club</th>
              <th style={S.th}>Nama Grup FB</th>
              <th style={S.th}>Saran Akun Bot</th>
              <th style={S.th}>Match</th>
              <th style={S.th}>Kickoff</th>
              <th style={S.th}>Card</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => {
              const info = g.match_info || {};
              return (
                <tr key={g.id}>
                  <td style={S.td}><span style={S.badgeManual}>🟡 MANUAL</span></td>
                  <td style={S.td}><span style={S.code}>{g.id}</span></td>
                  <td style={S.td}>{g.club}</td>
                  <td style={S.td}>{g.name}</td>
                  <td style={S.td}>
                    {g.suggested_account_name
                      ? <span style={{ color: '#22C55E' }}>{g.suggested_account_name}</span>
                      : <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>— belum ada</span>
                    }
                  </td>
                  <td style={S.td}>{info.home} <span style={S.vs}>vs</span> {info.away}</td>
                  <td style={S.td}>{formatKickoff(info.kickoff)}</td>
                  <td style={S.td}>
                    {g.card_path
                      ? <a style={S.link} href={`file:///${g.card_path.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer">📷 Lihat</a>
                      : '-'
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Help box */}
      <div style={S.helpBox}>
        <strong style={{ color: '#22D3EE' }}>💡 Cara Pakai:</strong> Semua matchday MANUAL.
        Lihat list di atas → buka Card → login akun bot member grup tsb → upload ke FB grup.
        <br />
        <strong style={{ color: '#22D3EE' }}>Regenerate cards:</strong>{' '}
        <code style={S.code}>bun scripts/run-match-scheduler.js --hours 48 --mark --clear-expired</code>
      </div>
    </div>
  );
}
