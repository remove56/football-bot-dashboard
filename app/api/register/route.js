/**
 * API Route: /api/register
 *
 * Public signup endpoint. Force role=member, is_approved=false.
 * Member tunggu admin approve dulu baru bisa login.
 *
 * POST {
 *   username: string (required, 3-30 char, alphanumeric+underscore),
 *   password: string (required, min 4 char),
 *   email:    string (optional, valid format kalau ada),
 *   full_name:string (optional)
 * }
 *
 * Returns:
 *   200: { success: true, message }
 *   400: { error: "validation message" }
 *   409: { error: "username sudah dipakai" }
 *   500: { error: "server error" }
 */
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function POST(req) {
  try {
    const body = await req.json();
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '');
    const email = String(body.email || '').trim().toLowerCase();
    const fullName = String(body.full_name || '').trim();

    // Validation
    if (!username || username.length < 3 || username.length > 30) {
      return Response.json({ error: 'Username harus 3-30 karakter' }, { status: 400 });
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return Response.json({ error: 'Username hanya boleh huruf kecil, angka, underscore' }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return Response.json({ error: 'Password minimal 4 karakter' }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Format email tidak valid' }, { status: 400 });
    }

    // Check username unique
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (existing) {
      return Response.json({ error: 'Username sudah dipakai, pilih yang lain' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert dgn FORCE role=member + is_approved=false (server-side enforced — gak bisa
    // di-tamper user via devtools)
    const { error: insertError } = await supabase.from('users').insert({
      username,
      name: fullName || username,
      email: email || null,
      full_name: fullName || null,
      password_hash: passwordHash,
      password: null,
      role: 'member', // HARDCODED, server-side
      is_approved: false, // Wait for admin approval
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      return Response.json({ error: `Gagal daftar: ${insertError.message}` }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'Pendaftaran berhasil! Akun lo perlu di-approve admin dulu sebelum bisa login. Tunggu konfirmasi ya.',
    });
  } catch (e) {
    return Response.json({ error: `Server error: ${e.message}` }, { status: 500 });
  }
}
