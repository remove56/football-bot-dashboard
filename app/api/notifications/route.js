// ============================================================
// API: Notifications
//
// GET ?user_id=xxx        → ambil list notif untuk user (broadcast + personal)
// POST { user_id, from_user_id, ... }  → admin kirim notifikasi
// PATCH { notification_id, user_id }   → mark as read
// DELETE ?id=xxx          → hapus notifikasi (admin only di client)
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET — list notifications untuk user tertentu
// Ambil: broadcast (to_user_id IS NULL) + personal (to_user_id = userId)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`to_user_id.eq.${userId},to_user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const unreadCount = (data || []).filter(n => !n.read_at).length;
    return NextResponse.json({ notifications: data || [], unread: unreadCount });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — kirim notifikasi baru
// Body: { from_user_id, from_user_name, to_user_id, to_user_name, title, message, type }
// Kalau to_user_id null → broadcast ke semua
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      from_user_id, from_user_name,
      to_user_id, to_user_name,
      title, message, type = 'info', metadata,
    } = body;

    if (!title || !message || !from_user_id) {
      return NextResponse.json({ error: 'title, message, from_user_id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        from_user_id, from_user_name,
        to_user_id: to_user_id || null,
        to_user_name: to_user_name || null,
        title, message, type, metadata: metadata || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notification: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH — mark as read
// Body: { notification_id } atau { mark_all_for_user_id } untuk mark semua
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { notification_id, mark_all_for_user_id } = body;

    if (mark_all_for_user_id) {
      // Mark semua unread untuk user ini jadi read
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null)
        .or(`to_user_id.eq.${mark_all_for_user_id},to_user_id.is.null`);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (notification_id) {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notification_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'notification_id or mark_all_for_user_id required' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — hapus notifikasi (admin)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
