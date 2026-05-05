/**
 * API Route: /api/classify-media
 *
 * Phase 4 — Klasifikasi URL: video atau image, untuk URL ambigu
 * (FB post URL /groups/.../posts/, /share/p/, /username/posts/, dll)
 * yang gak bisa ditebak dari pattern URL aja.
 *
 * Cara kerja: fetch halaman pakai User-Agent FacebookExternalHit
 * (cara yang sama yang dipake WhatsApp/Telegram untuk link preview),
 * lalu parse meta tag og:type / og:video / og:image.
 *
 * POST { url: string }
 * Returns {
 *   type: 'video' | 'image' | 'unknown',
 *   reason: string,    // alasan keputusan, untuk debug
 *   meta?: { ogType, hasVideoMeta, hasImageOnly }
 * }
 */

const FETCH_TIMEOUT_MS = 8000;

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // FacebookExternalHit UA → FB serve OG meta tag tanpa login wall
        'User-Agent': 'Mozilla/5.0 (compatible; FacebookExternalHit/1.1; +http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function metaContent(html, key, attr) {
  // Match both attribute orders: <meta property="og:type" content="..."> & reverse
  const re1 = new RegExp(`<meta\\s+${attr}=["']${key}["']\\s+content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+${attr}=["']${key}["']`, 'i');
  return (html.match(re1)?.[1] || html.match(re2)?.[1] || '').trim();
}

function classifyFromHtml(html) {
  if (!html) return { type: 'unknown', reason: 'fetch_failed_or_empty' };

  const ogType = metaContent(html, 'og:type', 'property').toLowerCase();
  const ogVideo = metaContent(html, 'og:video', 'property') || metaContent(html, 'og:video:url', 'property');
  const ogVideoSecure = metaContent(html, 'og:video:secure_url', 'property');
  const ogImage = metaContent(html, 'og:image', 'property');
  const twCard = metaContent(html, 'twitter:card', 'name').toLowerCase();
  const twPlayer = metaContent(html, 'twitter:player', 'name');

  const hasVideoMeta = !!(ogVideo || ogVideoSecure || twPlayer);

  // Strong signal: og:type is explicitly video
  if (ogType.includes('video')) return { type: 'video', reason: `og:type=${ogType}`, meta: { ogType, hasVideoMeta } };

  // Strong signal: video meta tags present
  if (hasVideoMeta) return { type: 'video', reason: 'og:video present', meta: { ogType, hasVideoMeta, ogVideo: ogVideo.substring(0, 80) } };

  // Twitter player card → likely video
  if (twCard === 'player') return { type: 'video', reason: 'twitter:card=player', meta: { ogType, twCard } };

  // Has og:image but no video signal → likely image post
  if (ogImage && !hasVideoMeta) return { type: 'image', reason: 'og:image present, no video meta', meta: { ogType, hasVideoMeta, hasImageOnly: true } };

  return { type: 'unknown', reason: `inconclusive (og:type=${ogType || 'none'})`, meta: { ogType, hasVideoMeta } };
}

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'url required' }, { status: 400 });
    }
    const html = await fetchHtml(url);
    const result = classifyFromHtml(html);
    return Response.json(result);
  } catch (e) {
    return Response.json({ type: 'unknown', reason: `error: ${e.message}` }, { status: 200 });
  }
}
