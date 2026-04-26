// ============================================================
// API: Health Check Endpoint
//
// Tujuan: Endpoint untuk monitoring eksternal (UptimeRobot, Healthchecks.io, dll)
// Cek kesehatan: dashboard up, supabase reachable, bot worker alive.
//
// Cara pakai monitoring eksternal:
//   1. Daftar UptimeRobot (gratis): https://uptimerobot.com
//   2. Add monitor: HTTP(s), URL = https://fbgroup-dash.vercel.app/api/health
//   3. Interval: 5 minutes
//   4. Alert via Email / Telegram / Slack saat status != 200
//
// Response codes:
//   200 = healthy (semua OK)
//   503 = degraded (1+ subsystem down)
//   500 = error (endpoint sendiri crash)
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Threshold: kalau bot worker terakhir heartbeat > 10 menit lalu = stale
const BOT_STALE_THRESHOLD_MS = 10 * 60 * 1000;

export async function GET() {
  const startTime = Date.now();
  const checks = {
    dashboard: { ok: true, message: 'Dashboard render OK' },
    supabase:  { ok: false, message: '', latency_ms: null },
    bot_workers: { ok: true, message: '', workers: [] },
  };

  // ============================================================
  // CHECK 1: Supabase reachable + query test
  // ============================================================
  const supaStart = Date.now();
  try {
    const { error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    if (error) throw error;
    checks.supabase.ok = true;
    checks.supabase.message = 'Supabase reachable + query OK';
    checks.supabase.latency_ms = Date.now() - supaStart;
  } catch (e) {
    checks.supabase.ok = false;
    checks.supabase.message = `Supabase error: ${e.message?.substring(0, 100)}`;
    checks.supabase.latency_ms = Date.now() - supaStart;
  }

  // ============================================================
  // CHECK 2: Bot workers heartbeat (kalau Supabase up)
  // ============================================================
  if (checks.supabase.ok) {
    try {
      const { data: workers } = await supabase
        .from('worker_status')
        .select('worker_id, worker_name, last_heartbeat, current_task');

      const now = Date.now();
      const workersStatus = (workers || []).map(w => {
        const heartbeatAge = w.last_heartbeat ? (now - new Date(w.last_heartbeat).getTime()) : Infinity;
        const isStale = heartbeatAge > BOT_STALE_THRESHOLD_MS;
        return {
          id: w.worker_id,
          name: w.worker_name,
          last_heartbeat: w.last_heartbeat,
          age_seconds: w.last_heartbeat ? Math.round(heartbeatAge / 1000) : null,
          status: !w.last_heartbeat ? 'never' : isStale ? 'stale' : 'active',
          current_task: w.current_task || null,
        };
      });

      checks.bot_workers.workers = workersStatus;
      const anyStale = workersStatus.some(w => w.status === 'stale' || w.status === 'never');
      if (workersStatus.length === 0) {
        checks.bot_workers.ok = false;
        checks.bot_workers.message = 'No worker registered yet';
      } else if (anyStale) {
        checks.bot_workers.ok = false;
        const staleNames = workersStatus.filter(w => w.status !== 'active').map(w => w.name).join(', ');
        checks.bot_workers.message = `Stale workers: ${staleNames}`;
      } else {
        checks.bot_workers.message = `${workersStatus.length} bot worker active`;
      }
    } catch (e) {
      checks.bot_workers.ok = false;
      checks.bot_workers.message = `Worker check error: ${e.message?.substring(0, 100)}`;
    }
  }

  // ============================================================
  // OVERALL STATUS
  // ============================================================
  const allOk = Object.values(checks).every(c => c.ok);
  const status = allOk ? 'healthy' : 'degraded';
  const httpCode = allOk ? 200 : 503;

  const response = {
    status,
    timestamp: new Date().toISOString(),
    response_time_ms: Date.now() - startTime,
    checks,
  };

  return NextResponse.json(response, { status: httpCode });
}
