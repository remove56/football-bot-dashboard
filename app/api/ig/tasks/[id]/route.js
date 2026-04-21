// ============================================================
// API: IG Task by ID — retry / delete / update
//
// POST /api/ig/tasks/:id/retry   -> reset task ke pending (manual retry)
// DELETE /api/ig/tasks/:id       -> hapus task
// PATCH /api/ig/tasks/:id        -> update field (account_id, scheduled_at)
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    const { error } = await supabase.from('ig_tasks').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await req.json();
    const allowed = ['account_id', 'scheduled_at', 'caption', 'status', 'retry_count', 'source_video_path'];
    const update = {};
    for (const k of allowed) {
      if (k in body) update[k] = body[k];
    }

    // Khusus retry: reset started_at, retry_count, error_message
    if (body.action === 'retry') {
      update.status = 'pending';
      update.started_at = null;
      update.completed_at = null;
      update.retry_count = 0;
      update.error_message = null;
      update.scheduled_at = new Date().toISOString();
      update.triggered_by = 'manual_retry';
    }

    const { data, error } = await supabase.from('ig_tasks').update(update).eq('id', id).select();
    if (error) throw error;
    return NextResponse.json({ success: true, task: data?.[0] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
