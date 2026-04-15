// ============================================================
// API: Chat Messages
//
// GET ?scope=global              → ambil global chat (50 terbaru)
// GET ?scope=dm&user1=xxx&user2=xxx  → ambil DM antar 2 user
// GET ?scope=dm_list&user_id=xxx → list DM conversations user (siapa aja yang chat)
// POST { from, to (null=global), message }  → kirim pesan
// PATCH ?mark_read&user1=xxx&user2=xxx → mark DM antar 2 user sebagai read
// DELETE ?id=xxx                 → hapus pesan (soft delete)
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'global';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (scope === 'global') {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .is('to_user_id', null)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ messages: (data || []).reverse() });
    }

    if (scope === 'dm') {
      const user1 = searchParams.get('user1');
      const user2 = searchParams.get('user2');
      if (!user1 || !user2) return NextResponse.json({ error: 'user1 and user2 required for dm' }, { status: 400 });

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(from_user_id.eq.${user1},to_user_id.eq.${user2}),and(from_user_id.eq.${user2},to_user_id.eq.${user1})`)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ messages: (data || []).reverse() });
    }

    if (scope === 'dm_list') {
      const userId = searchParams.get('user_id');
      if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

      // Ambil semua DM yang melibatkan user ini, group by partner
      const { data, error } = await supabase
        .from('chat_messages')
        .select('from_user_id, from_user_name, to_user_id, to_user_name, message, created_at, read_at')
        .not('to_user_id', 'is', null)
        .eq('deleted', false)
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Group per partner user
      const conversations = {};
      for (const msg of data || []) {
        const isFromMe = msg.from_user_id === userId;
        const partnerId = isFromMe ? msg.to_user_id : msg.from_user_id;
        const partnerName = isFromMe ? msg.to_user_name : msg.from_user_name;
        if (!conversations[partnerId]) {
          conversations[partnerId] = {
            partner_id: partnerId,
            partner_name: partnerName,
            last_message: msg.message,
            last_created_at: msg.created_at,
            unread: 0,
          };
        }
        // Hitung unread: pesan yang ke user ini tapi belum dibaca
        if (!isFromMe && !msg.read_at) {
          conversations[partnerId].unread++;
        }
      }
      return NextResponse.json({ conversations: Object.values(conversations) });
    }

    return NextResponse.json({ error: 'invalid scope' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      from_user_id, from_user_name, from_user_role,
      to_user_id, to_user_name,
      message,
    } = body;

    if (!from_user_id || !from_user_name || !message) {
      return NextResponse.json({ error: 'from_user_id, from_user_name, message required' }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'message too long (max 2000 char)' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        from_user_id, from_user_name, from_user_role: from_user_role || 'member',
        to_user_id: to_user_id || null,
        to_user_name: to_user_name || null,
        message: message.trim(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user1 = searchParams.get('user1');
    const user2 = searchParams.get('user2');
    if (!user1 || !user2) return NextResponse.json({ error: 'user1 and user2 required' }, { status: 400 });

    // Mark semua DM dari user2 ke user1 (yang belum read) sebagai read
    const { error } = await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('from_user_id', user2)
      .eq('to_user_id', user1)
      .is('read_at', null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    // Soft delete — tidak hapus fisik
    const { error } = await supabase
      .from('chat_messages')
      .update({ deleted: true, message: '[pesan dihapus]' })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
