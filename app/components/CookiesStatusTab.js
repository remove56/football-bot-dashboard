'use client';
import React, { useState, useEffect } from 'react';

/**
 * CookiesStatusTab — Phase 6.2
 * Table view per akun bot grup: status cookies (file age + xs expiry + active test).
 * Auto-refresh 30 detik.
 */

const STATUS_COLORS = {
  ok:       { bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.45)',  text: '#22C55E', label: '🟢 OK',         desc: 'Cookies fresh, akun siap post' },
  aging:    { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.40)', text: '#F59E0B', label: '🟡 AGING',      desc: '14-20 hari, refresh dlm 1 minggu' },
  urgent:   { bg: 'rgba(245,158,11,0.20)', border: 'rgba(245,158,11,0.60)', text: '#F59E0B', label: '⚠️ URGENT',     desc: '>20 hari ATAU expire <24h. Refresh SEGERA.' },
  expired:  { bg: 'rgba(239,68,68,0.20)',  border: 'rgba(239,68,68,0.55)',  text: '#EF4444', label: '🔴 EXPIRED',    desc: 'xs cookie sudah expire. Bot pasti gagal.' },
  invalid:  { bg: 'rgba(239,68,68,0.25)',  border: 'rgba(239,68,68,0.60)',  text: '#EF4444', label: '❌ INVALID',    desc: 'Active test failed. Auto-paused.' },
  paused:   { bg: 'rgba(156,163,175,0.10)',border: 'rgba(156,163,175,0.35)',text: '#9CA3AF', label: '⏸ PAUSED',     desc: 'Akun paused manual / oleh sistem' },
};

const S = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 18 },
  stat: (color) => ({
    background: 'transparent',
    border: `1px solid ${color}`,
    borderLeft: `4px solid ${color}`,
    borderRadius: 4,
    padding: '12px 14px',
  }),
  statNum: { fontSize: 24, fontWeight: 900, color: '#E5E7EB', lineHeight: 1, fontFamily: 'Menlo, Consolas, monospace' },
  statLabel: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'transparent',  // ← transparan, tembus ke hud-panel bg
    border: '1px solid rgba(34,211,238,0.20)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: 10,
    fontWeight: 700,
    color: '#22D3EE',
    textTransform: 'uppercase',
    letterSpacing: 1,
    background: 'transparent',
    borderBottom: '1px solid rgba(34,211,238,0.25)',
    fontFamily: 'Menlo, Consolas, monospace',
  },
  td: {
    padding: '10px 12px',
    fontSize: 12,
    color: '#E5E7EB',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    background: 'transparent',
  },
  badge: (status) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS.ok;
    return {
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: 12,
      fontSize: 10,
      fontWeight: 700,
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      letterSpacing: 0.5,
      whiteSpace: 'nowrap',
    };
  },
  code: {
    background: 'rgba(34,211,238,0.10)',
    color: '#22D3EE',
    padding: '2px 6px',
    borderRadius: 3,
    fontSize: 11,
    fontFamily: 'Menlo, Consolas, monospace',
  },
  meta: { fontSize: 12, color: '#9CA3AF' },
  refreshBtn: {
    background: 'rgba(34,197,94,0.15)',
    border: '1px solid rgba(34,197,94,0.45)',
    color: '#22C55E',
    padding: '6px 14px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: 'Menlo, Consolas, monospace',
  },
  legend: {
    marginTop: 14,
    padding: 12,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 4,
    fontSize: 11,
    color: '#9CA3AF',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 6,
  },
};

function formatRelative(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const days = Math.round(diffMs / 86400000);
  if (days < 0) return Math.abs(days) + 'd ke depan';
  if (days === 0) return 'hari ini';
  if (days === 1) return '1 hari lalu';
  return days + ' hari lalu';
}
function formatExpireIn(hours) {
  if (hours === null) return '—';
  if (hours < 0) return 'EXPIRED ' + Math.abs(Math.round(hours)) + 'h';
  if (hours < 24) return Math.round(hours) + ' jam lagi';
  return Math.round(hours / 24) + ' hari lagi';
}

export default function CookiesStatusTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/cookies-status?t=' + Date.now(), { cache: 'no-store' });
      const json = await res.json();
      setData(json);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading && !data) return <div style={{ padding: 24, color: '#9CA3AF', textAlign: 'center' }}>Loading cookies status...</div>;
  if (!data) return <div style={{ padding: 24, color: '#EF4444', textAlign: 'center' }}>Failed to load data</div>;

  const stats = data.stats || {};
  let accounts = data.accounts || [];
  if (filter !== 'all') accounts = accounts.filter(a => a.status === filter);

  const updatedAt = data.updated_at ? new Date(data.updated_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false }) : '—';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={S.meta}>Last updated: {updatedAt} WIB · Auto-refresh: 30s</div>
        <button style={S.refreshBtn} onClick={fetchData}>↻ Refresh</button>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        <div style={S.stat('rgba(34,211,238,0.5)')}><div style={S.statNum}>{stats.total || 0}</div><div style={S.statLabel}>Total Active</div></div>
        <div style={S.stat('rgba(34,197,94,0.5)')}><div style={S.statNum}>{stats.ok || 0}</div><div style={S.statLabel}>🟢 OK</div></div>
        <div style={S.stat('rgba(245,158,11,0.4)')}><div style={S.statNum}>{stats.aging || 0}</div><div style={S.statLabel}>🟡 Aging</div></div>
        <div style={S.stat('rgba(245,158,11,0.6)')}><div style={S.statNum}>{stats.urgent || 0}</div><div style={S.statLabel}>⚠️ Urgent</div></div>
        <div style={S.stat('rgba(239,68,68,0.5)')}><div style={S.statNum}>{(stats.expired || 0) + (stats.invalid || 0)}</div><div style={S.statLabel}>🔴 Expired/Invalid</div></div>
        <div style={S.stat('rgba(156,163,175,0.4)')}><div style={S.statNum}>{stats.paused || 0}</div><div style={S.statLabel}>⏸ Paused</div></div>
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['all', 'ok', 'aging', 'urgent', 'expired', 'invalid', 'paused'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 10px',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              borderRadius: 3,
              cursor: 'pointer',
              border: filter === f ? '1px solid rgba(34,211,238,0.6)' : '1px solid rgba(255,255,255,0.1)',
              background: filter === f ? 'rgba(34,211,238,0.15)' : 'rgba(0,0,0,0.2)',
              color: filter === f ? '#22D3EE' : '#9CA3AF',
              fontFamily: 'Menlo, Consolas, monospace',
            }}
          >{f}</button>
        ))}
      </div>

      {/* Info banner — penjelasan kenapa File Age yg utama */}
      <div style={{
        marginBottom: 12, padding: '10px 14px',
        background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)', borderRadius: 4,
        fontSize: 11, color: '#9CA3AF', lineHeight: 1.6,
      }}>
        <strong style={{ color: '#22D3EE' }}>ℹ️ Indikator utama: File Age</strong> (umur sejak cookies di-refresh).
        FB biasa <strong>invalidate session 14-30 hari</strong> walau cookie spec masih panjang.
        Refresh proaktif saat file age <strong>≥14 hari</strong>.
      </div>

      {/* Table */}
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Status</th>
            <th style={S.th}>Account ID</th>
            <th style={S.th}>Akun Bot</th>
            <th style={S.th}>File Age</th>
            <th style={S.th}>Cookies Refreshed</th>
            <th style={S.th}>Last Validated</th>
            <th style={S.th}>Test Result</th>
            <th style={S.th}>Total Posts</th>
            <th style={S.th}>Pause Reason</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(a => {
            // Color-code file age cell
            const ageDays = a.file_age_days;
            const ageColor = ageDays === null ? '#9CA3AF'
              : ageDays >= 20 ? '#EF4444'
              : ageDays >= 14 ? '#F59E0B'
              : '#22C55E';
            return (
              <tr key={a.id}>
                <td style={S.td}>
                  <span style={S.badge(a.status)}>{STATUS_COLORS[a.status]?.label || a.status}</span>
                </td>
                <td style={S.td}><span style={S.code}>{a.id}</span></td>
                <td style={S.td}>{a.name}</td>
                <td style={{ ...S.td, color: ageColor, fontWeight: 700 }}>
                  {ageDays !== null ? ageDays + 'd' : '—'}
                </td>
                <td style={S.td}>{formatRelative(a.cookies_refreshed_at)}</td>
                <td style={S.td}>{formatRelative(a.cookies_last_validated_at)}</td>
                <td style={S.td}>
                  {a.cookies_last_validation_result === 'valid' ? <span style={{ color: '#22C55E' }}>✓ valid</span>
                    : a.cookies_last_validation_result === 'invalid' ? <span style={{ color: '#EF4444' }}>✗ invalid</span>
                    : <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>not tested</span>}
                </td>
                <td style={S.td}>{a.total_posts || 0}</td>
                <td style={{ ...S.td, fontSize: 10, color: '#9CA3AF', maxWidth: 220 }}>
                  {a.pause_reason ? a.pause_reason.substring(0, 80) + (a.pause_reason.length > 80 ? '…' : '') : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {accounts.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>
          Tidak ada akun dengan filter "{filter}"
        </div>
      )}

      {/* Legend */}
      <div style={S.legend}>
        <div><strong style={{ color: '#22C55E' }}>🟢 OK</strong> — cookies fresh (&lt;14d), akun bisa post</div>
        <div><strong style={{ color: '#F59E0B' }}>🟡 AGING</strong> — 14-20d, refresh dalam 1 minggu</div>
        <div><strong style={{ color: '#F59E0B' }}>⚠️ URGENT</strong> — &gt;20d atau expire &lt;24h, refresh SEGERA</div>
        <div><strong style={{ color: '#EF4444' }}>🔴 EXPIRED</strong> — xs cookie sudah expire</div>
        <div><strong style={{ color: '#EF4444' }}>❌ INVALID</strong> — active test gagal, auto-paused</div>
        <div><strong style={{ color: '#9CA3AF' }}>⏸ PAUSED</strong> — manual pause atau pause oleh sistem</div>
      </div>
    </div>
  );
}
