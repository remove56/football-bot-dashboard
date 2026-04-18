// ============================================================
// API: Cron Auto-Notification — cek target member setiap jam
//
// Dipanggil oleh Vercel Cron setiap jam (atau manual).
// Cek semua member yang punya daily_target. Kalau progress < target
// dan sudah lewat jam threshold, kirim notifikasi otomatis.
//
// Jam trigger:
//   - 12:00 WIB (05:00 UTC): reminder siang kalau < 30%
//   - 18:00 WIB (11:00 UTC): warning kalau < 50%
//   - 21:00 WIB (14:00 UTC): urgent kalau < 80%
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function localDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function GET(req) {
  try {
    const now = new Date();
    const hourWIB = (now.getUTCHours() + 7) % 24;
    const today = localDateString(now);

    // Hanya jalankan di jam tertentu (WIB)
    let threshold = null;
    let notifType = 'info';
    let urgency = '';

    if (hourWIB >= 21) {
      threshold = 80; notifType = 'error'; urgency = '🚨 URGENT';
    } else if (hourWIB >= 18) {
      threshold = 50; notifType = 'warning'; urgency = '⚠️ Warning';
    } else if (hourWIB >= 12) {
      threshold = 30; notifType = 'info'; urgency = '📋 Reminder';
    } else {
      return NextResponse.json({ skipped: true, reason: `Belum waktunya (jam ${hourWIB} WIB)` });
    }

    // Ambil semua member dengan target
    const { data: members } = await supabase
      .from('users')
      .select('id, name, daily_target, role')
      .eq('role', 'member')
      .gt('daily_target', 0);

    if (!members || members.length === 0) {
      return NextResponse.json({ skipped: true, reason: 'Tidak ada member dengan target' });
    }

    // Ambil posting hari ini
    const { data: todayPosts } = await supabase
      .from('posting_tracker')
      .select('user_name, group_id')
      .eq('period', today);

    // Hitung progress per member
    const sent = [];
    for (const m of members) {
      const memberPosts = (todayPosts || []).filter(p => p.user_name === m.name);
      const groupsDone = new Set(memberPosts.map(p => p.group_id)).size;
      const pct = Math.round((groupsDone / m.daily_target) * 100);

      if (pct < threshold) {
        // Cek apakah sudah pernah kirim notif ini hari ini (hindari spam)
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('to_user_id', m.id)
          .eq('type', notifType)
          .gte('created_at', today + 'T00:00:00')
          .limit(1);

        if (existing && existing.length > 0) continue; // skip, sudah pernah kirim

        // Kirim notifikasi
        const title = `${urgency} Target belum tercapai!`;
        const message = `Hai ${m.name}, kamu baru mencapai ${groupsDone} dari ${m.daily_target} grup (${pct}%). ` +
          (hourWIB >= 21 ? 'Deadline hampir habis! Segera selesaikan sekarang!' :
           hourWIB >= 18 ? 'Waktu tersisa beberapa jam. Ayo kejar target!' :
           'Masih ada waktu, tapi jangan sampai telat ya!');

        await supabase.from('notifications').insert({
          from_user_name: 'System',
          to_user_id: m.id,
          to_user_name: m.name,
          title,
          message,
          type: notifType,
        });

        sent.push({ name: m.name, progress: `${groupsDone}/${m.daily_target} (${pct}%)` });
      }
    }

    return NextResponse.json({
      success: true,
      hourWIB,
      threshold: `<${threshold}%`,
      notified: sent.length,
      details: sent,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
