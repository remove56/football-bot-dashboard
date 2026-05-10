/**
 * API Route: /api/r/[code]
 *
 * Short URL redirect handler. URL pattern: /r/{code}?s={account}&c={group}&t={type}
 *
 * Flow:
 *   1. Lookup code di url_shortener → ambil destination_url
 *   2. Insert log ke link_clicks dengan UTM (account_id, group_id, post type)
 *   3. Increment url_shortener.total_clicks (denormalized counter)
 *   4. 302 redirect ke destination
 *
 * Bot detection (basic): UA contains 'bot' / 'crawler' / 'spider' → flag is_bot_traffic.
 * Tetep redirect, tapi gak boost analytics revenue.
 *
 * IP hashing: SHA-256(ip + salt) — gak simpan raw IP buat privacy.
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const IP_SALT = process.env.IP_HASH_SALT || 'lxscore-default-salt-CHANGE-ME';

function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip + IP_SALT).digest('hex').substring(0, 32);
}

function detectBot(ua) {
  if (!ua) return true; // empty UA = sus
  return /bot|crawler|spider|scraper|headless|preview|fetch/i.test(ua);
}

export async function GET(req, { params }) {
  const code = params?.code;
  if (!code || code.length > 20) {
    return new Response('Invalid code', { status: 400 });
  }

  // Extract UTM dari querystring
  const url = new URL(req.url);
  const utmSource = url.searchParams.get('s') || null;       // account_id
  const utmCampaign = url.searchParams.get('c') || null;     // group_id
  const utmContent = url.searchParams.get('t') || null;      // post type (image/video)

  // Lookup destination
  const { data: shortRow } = await supabase
    .from('url_shortener')
    .select('destination_url, expires_at')
    .eq('short_code', code)
    .maybeSingle();

  if (!shortRow) {
    return new Response('Link not found', { status: 404 });
  }
  if (shortRow.expires_at && new Date(shortRow.expires_at) < new Date()) {
    return new Response('Link expired', { status: 410 });
  }

  // Get visitor info
  const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '';
  const ip = ipHeader.split(',')[0].trim();
  const ua = req.headers.get('user-agent') || '';
  const country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || null;
  const referrer = req.headers.get('referer') || null;
  const isBot = detectBot(ua);

  // Insert click log + landing event (fire-and-forget pattern, jangan block redirect)
  supabase.from('link_clicks').insert({
    short_code: code,
    utm_source: utmSource,
    utm_medium: 'fb_group',
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    destination_url: shortRow.destination_url,
    ip_hash: hashIp(ip),
    user_agent: ua.substring(0, 500),
    country,
    referrer: referrer ? referrer.substring(0, 500) : null,
    is_bot_traffic: isBot,
  }).then(({ data: clickRow, error }) => {
    if (error || !clickRow) return;
    // Insert landing event linked ke click_id
    if (clickRow[0]?.id) {
      supabase.from('funnel_events').insert({
        click_id: clickRow[0].id,
        event_type: 'landing',
      }).then(() => {});
    }
  }).catch(() => {});

  // Increment counter (also fire-and-forget)
  supabase.rpc('increment_short_url_clicks', { p_code: code }).catch(() => {
    // Fallback kalau RPC gak ada: update via select+update
    supabase.from('url_shortener')
      .select('total_clicks').eq('short_code', code).maybeSingle()
      .then(({ data }) => {
        if (data) {
          supabase.from('url_shortener').update({ total_clicks: (data.total_clicks || 0) + 1 })
            .eq('short_code', code).then(() => {});
        }
      });
  });

  // 302 redirect ke destination
  return Response.redirect(shortRow.destination_url, 302);
}
