// ============================================================
// API: Latest TikTok Video Info — untuk preview di dashboard
//
// GET /api/ig/latest-video
//   -> return info video TikTok paling baru:
//      { video_path, video_title, keyword, completed_at, account_name, task_id }
//   (ambil dari reels_tasks WHERE status='done' AND video_path NOT NULL)
//
//   Kalau ga ada → { video_path: null, message: 'Belum ada video TikTok' }
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reels_tasks')
      .select('id, video_path, video_title, keyword, completed_at, account_name, platforms')
      .eq('status', 'done')
      .not('video_path', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    const tiktokVideos = (data || []).filter(r => (r.platforms || []).includes('tiktok'));
    const videos = tiktokVideos.length > 0 ? tiktokVideos : (data || []);

    return NextResponse.json({
      latest: videos[0] || null,
      recent: videos.slice(0, 10),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
