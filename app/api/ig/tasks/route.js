// ============================================================
// API: IG Tasks — GET list / POST create
//
// GET /api/ig/tasks?limit=20  -> list tasks terbaru
// POST /api/ig/tasks          -> create task(s)
//   body: { accounts: ['artezi9090'], caption, source_video_path?, delay_minutes: { artezi9090: 0, artezi9191: 120 } }
//   default: kalau source_video_path kosong → '__AUTO__' (worker pick latest)
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');

    let q = supabase
      .from('ig_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) q = q.eq('status', status);

    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ tasks: data || [] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { accounts, caption, source_video_path, delay_minutes, source_tiktok_task_id, triggered_by } = body;

    if (!Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json({ error: 'accounts[] wajib diisi minimal 1' }, { status: 400 });
    }
    if (!caption || caption.trim().length === 0) {
      return NextResponse.json({ error: 'caption wajib' }, { status: 400 });
    }

    const videoPath = source_video_path || '__AUTO__';
    const now = Date.now();
    const rows = accounts.map((acc) => {
      const delayMin = (delay_minutes && typeof delay_minutes[acc] === 'number') ? delay_minutes[acc] : 0;
      const scheduledAt = new Date(now + delayMin * 60 * 1000).toISOString();
      return {
        source_video_path: videoPath,
        source_tiktok_task_id: source_tiktok_task_id || null,
        account_id: acc,
        caption,
        scheduled_at: scheduledAt,
        status: 'pending',
        triggered_by: triggered_by || 'manual',
      };
    });

    const { data, error } = await supabase.from('ig_tasks').insert(rows).select();
    if (error) throw error;

    return NextResponse.json({ success: true, tasks: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
