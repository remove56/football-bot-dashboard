// ============================================================
// API: Bot Heartbeat — dipanggil oleh bot worker setiap 60 detik
// untuk report status dan nunjukin worker masih hidup.
//
// Input (POST body):
//   worker_id      : string  (required) — 'bot-grup' | 'bot-reels' | ...
//   worker_name    : string  (required) — display name
//   current_task   : string  (optional) — task yang sedang diproses
//   last_task_info : string  (optional) — task terakhir yang sudah selesai
//   version        : string  (optional) — versi worker
//   pid            : int     (optional) — process ID
//   hostname       : string  (optional) — nama komputer
//   task_done      : bool    (optional) — true kalau abis selesaiin task (increment counter)
//   task_success   : bool    (optional) — result task terakhir (true/false)
//   error_message  : string  (optional) — error yang perlu di-report
//
// Response: { ok, status, last_heartbeat, updated_row }
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      worker_id,
      worker_name,
      current_task,
      last_task_info,
      version,
      pid,
      hostname,
      task_done,
      task_success,
      error_message,
    } = body;

    if (!worker_id || !worker_name) {
      return NextResponse.json({ error: 'Missing worker_id or worker_name' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Ambil row existing untuk increment counter
    const { data: existing } = await supabase
      .from('worker_status')
      .select('total_tasks_today, total_success_today, total_failed_today')
      .eq('worker_id', worker_id)
      .single();

    const updateData = {
      worker_id,
      worker_name,
      last_heartbeat: now,
      current_task: current_task || null,
      version: version || null,
      pid: pid || null,
      hostname: hostname || null,
      error_message: error_message || null,
      updated_at: now,
    };

    if (last_task_info) {
      updateData.last_task_info = last_task_info;
      updateData.last_task_at = now;
    }

    // Increment counter kalau task_done=true
    if (task_done === true) {
      updateData.total_tasks_today = (existing?.total_tasks_today || 0) + 1;
      if (task_success === true) {
        updateData.total_success_today = (existing?.total_success_today || 0) + 1;
      } else if (task_success === false) {
        updateData.total_failed_today = (existing?.total_failed_today || 0) + 1;
      }
    }

    // Upsert (insert kalau belum ada, update kalau udah)
    const { error } = await supabase
      .from('worker_status')
      .upsert(updateData, { onConflict: 'worker_id' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, last_heartbeat: now });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET — ambil status semua worker (dipakai dashboard)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('worker_status')
      .select('*')
      .order('worker_id');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Hitung status derivation per worker
    const now = Date.now();
    const enriched = (data || []).map(w => {
      const lastBeat = w.last_heartbeat ? new Date(w.last_heartbeat).getTime() : 0;
      const ageSeconds = lastBeat ? Math.floor((now - lastBeat) / 1000) : null;
      let status = 'never';
      if (ageSeconds !== null) {
        if (ageSeconds < 120) status = 'active';
        else if (ageSeconds < 900) status = 'stale';
        else status = 'down';
      }
      return { ...w, status, age_seconds: ageSeconds };
    });

    return NextResponse.json({ workers: enriched });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
