export const metadata = { title: 'Football Bot Dashboard' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* ============================================================
             DESIGN TOKENS — Midnight Stadium
             Soft dark navy + green pitch + gold accent. Elegan, motion halus,
             nyaman untuk session admin yang lama. Replaced HUD cyan harshness.
             ============================================================ */
          :root {
            --bg:             #0B1120;  /* navy gelap — body */
            --bg-base:        #0B1120;  /* alias backward-compat */
            --surface:        #111827;  /* card */
            --bg-surface:     #111827;  /* alias backward-compat */
            --surface-2:      #1F2937;  /* hover/elevated */
            --bg-surface-2:   #1F2937;  /* alias backward-compat */
            --bg-input:       #0F172A;  /* deeper for form fields */

            --border:         rgba(255, 255, 255, 0.08);
            --border-strong:  rgba(255, 255, 255, 0.14);
            --border-accent:  rgba(34, 197, 94, 0.25);  /* green accent border */

            --text:           #E5E7EB;
            --text-primary:   #E5E7EB;  /* alias */
            --text-secondary: #CBD5E1;
            --muted:          #9CA3AF;
            --text-muted:     #9CA3AF;  /* alias */

            --primary:        #22C55E;  /* green pitch — main accent */
            --primary-hover:  #16A34A;  /* green-600 */
            --primary-bg:     rgba(34, 197, 94, 0.10);
            --primary-glow:   rgba(34, 197, 94, 0.40);

            --accent:         #F59E0B;  /* gold/score highlight */
            --accent-hover:   #D97706;
            --accent-bg:      rgba(245, 158, 11, 0.10);
            --accent-glow:    rgba(245, 158, 11, 0.30);

            --success:        #22C55E;
            --warning:        #F59E0B;
            --danger:         #EF4444;
            --danger-bg:      rgba(239, 68, 68, 0.10);

            --radius-sm:      4px;
            --radius:         10px;
            --radius-lg:      14px;

            --shadow-sm:      0 1px 2px rgba(0, 0, 0, 0.20);
            --shadow:         0 4px 20px rgba(0, 0, 0, 0.30);
            --shadow-lg:      0 12px 40px rgba(0, 0, 0, 0.45);
            --shadow-hover:   0 6px 24px rgba(0, 0, 0, 0.40);

            --motion-fast:    150ms cubic-bezier(0.22, 1, 0.36, 1);
            --motion-base:    250ms cubic-bezier(0.22, 1, 0.36, 1);
            --motion-slow:    400ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          /* ============================================================
             RESET & BASE
             ============================================================ */
          *, *::before, *::after { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: var(--bg);
            color: var(--text);
            font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            min-height: 100vh;
          }
          body {
            position: relative;
            z-index: 0;
            overflow-x: hidden;
          }

          /* ============================================================
             AMBIENT ORB BACKGROUND — pure CSS, soft motion
             3 orbs floating slow di belakang layout, opacity rendah.
             Pure decoration, gak distract dari content. Honors prefers-reduced-motion.
             ============================================================ */
          .ambient-orb {
            position: fixed;
            border-radius: 9999px;
            pointer-events: none;
            z-index: -1;
            filter: blur(70px);
          }
          .ambient-orb--1 {
            width: 520px;
            height: 520px;
            top: -120px;
            left: -120px;
            background: radial-gradient(circle, var(--primary-glow), transparent 65%);
            opacity: 0.75;
            animation: floatOrb1 14s ease-in-out infinite alternate;
          }
          .ambient-orb--2 {
            width: 460px;
            height: 460px;
            bottom: -100px;
            right: -80px;
            background: radial-gradient(circle, var(--accent-glow), transparent 65%);
            opacity: 0.65;
            animation: floatOrb2 16s ease-in-out infinite alternate;
          }
          .ambient-orb--3 {
            width: 400px;
            height: 400px;
            top: 35%;
            right: 22%;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.45), transparent 65%);
            opacity: 0.55;
            animation: floatOrb3 18s ease-in-out infinite alternate;
          }
          .ambient-orb--4 {
            width: 340px;
            height: 340px;
            top: 18%;
            left: 38%;
            background: radial-gradient(circle, rgba(34, 197, 94, 0.30), transparent 65%);
            opacity: 0.45;
            animation: floatOrb4 12s ease-in-out infinite alternate;
          }
          @keyframes floatOrb1 {
            from { transform: translate3d(-50px, -30px, 0) scale(1); }
            to   { transform: translate3d(80px, 60px, 0) scale(1.18); }
          }
          @keyframes floatOrb2 {
            from { transform: translate3d(40px, 60px, 0) scale(1.10); }
            to   { transform: translate3d(-80px, -40px, 0) scale(1); }
          }
          @keyframes floatOrb3 {
            from { transform: translate3d(0, 0, 0) scale(1); }
            to   { transform: translate3d(-100px, 80px, 0) scale(1.15); }
          }
          @keyframes floatOrb4 {
            from { transform: translate3d(-20px, 0, 0) scale(0.95); }
            to   { transform: translate3d(60px, -50px, 0) scale(1.12); }
          }

          /* Header accent line — slow gradient sweep horizontal */
          .accent-line {
            position: relative;
            height: 2px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.04);
          }
          .accent-line::after {
            content: '';
            position: absolute;
            top: 0; left: -50%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent);
            animation: accentSweep 6s linear infinite;
          }
          @keyframes accentSweep {
            from { left: -50%; }
            to   { left: 100%; }
          }

          /* Status pulse — for ACTIVE badges, slow + visible */
          .status-pulse {
            position: relative;
          }
          .status-pulse::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: inherit;
            border: 2px solid var(--primary);
            opacity: 0.6;
            animation: statusPulseRing 2s ease-out infinite;
          }
          @keyframes statusPulseRing {
            0%   { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.25); opacity: 0; }
          }

          /* Number tick — slight glow pulse on stat cards (subtle but visible) */
          .number-glow {
            text-shadow: 0 0 12px var(--primary-glow);
            animation: numberGlow 3s ease-in-out infinite;
          }
          @keyframes numberGlow {
            0%, 100% { text-shadow: 0 0 8px rgba(34, 197, 94, 0.30); }
            50%      { text-shadow: 0 0 18px rgba(34, 197, 94, 0.50); }
          }

          /* ============================================================
             SCROLLBAR — minimal, slate-themed, no neon
             ============================================================ */
          ::-webkit-scrollbar { width: 10px; height: 10px; }
          ::-webkit-scrollbar-track { background: var(--bg); }
          ::-webkit-scrollbar-thumb {
            background: var(--surface-2);
            border-radius: var(--radius-sm);
          }
          ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
          ::-webkit-scrollbar-corner { background: var(--bg); }

          /* ============================================================
             FOCUS — accessible, subtle green ring
             ============================================================ */
          :focus-visible {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
            border-radius: var(--radius-sm);
          }
          input:focus, select:focus, textarea:focus {
            border-color: var(--primary) !important;
            box-shadow: 0 0 0 3px var(--primary-bg) !important;
            outline: none;
          }

          /* Selection — green pitch */
          ::selection {
            background: var(--primary-bg);
            color: var(--text);
          }

          /* ============================================================
             SOFT MOTION — hover lift untuk card-like elements
             Gentle 2-4px translate + soft shadow. Smooth easing.
             ============================================================ */
          button:not(:disabled), [role="button"]:not(:disabled) {
            transition: transform var(--motion-fast), filter var(--motion-fast), box-shadow var(--motion-fast);
          }
          button:not(:disabled):hover, [role="button"]:not(:disabled):hover {
            filter: brightness(1.08);
            transform: translateY(-1px);
          }
          button:not(:disabled):active, [role="button"]:not(:disabled):active {
            transform: translateY(0);
          }

          /* Card hover lift — class opt-in: .card-hover */
          .card-hover {
            transition: transform var(--motion-base), box-shadow var(--motion-base);
          }
          .card-hover:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-hover);
          }

          /* ============================================================
             ANIMATIONS — slow & gentle (Midnight Stadium philosophy)
             ============================================================ */

          /* Bell/chat pulse — slowed, gentle */
          @keyframes bellPulse {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.08); }
          }

          /* Recording — kept original (specific feature need) */
          @keyframes recordPulse {
            0%, 100% { background-color: #991b1b; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            50%      { background-color: #dc2626; box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          }

          /* Online status dot — green slow pulse (stadium pitch) */
          @keyframes onlinePulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.50); }
            50%      { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          }

          .chat-message-row:hover .msg-delete-btn { opacity: 1 !important; }

          /* ============================================================
             FADE-IN UTILITY — apply to dynamically-rendered cards
             Opt-in via className="fade-in"
             ============================================================ */
          .fade-in {
            animation: fadeInUp var(--motion-slow) ease-out backwards;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* Stagger helper — children fade-in sequential dgn delay 60ms */
          .fade-in-stagger > * {
            animation: fadeInUp var(--motion-slow) ease-out backwards;
          }
          .fade-in-stagger > *:nth-child(1) { animation-delay:  0ms; }
          .fade-in-stagger > *:nth-child(2) { animation-delay: 60ms; }
          .fade-in-stagger > *:nth-child(3) { animation-delay: 120ms; }
          .fade-in-stagger > *:nth-child(4) { animation-delay: 180ms; }
          .fade-in-stagger > *:nth-child(5) { animation-delay: 240ms; }
          .fade-in-stagger > *:nth-child(6) { animation-delay: 300ms; }
          .fade-in-stagger > *:nth-child(7) { animation-delay: 360ms; }
          .fade-in-stagger > *:nth-child(8) { animation-delay: 420ms; }

          /* ============================================================
             SKELETON SHIMMER — loading state
             Apply via className="skeleton" + fixed width/height
             ============================================================ */
          .skeleton {
            background: linear-gradient(
              90deg,
              var(--surface) 0%,
              var(--surface-2) 50%,
              var(--surface) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.6s ease-in-out infinite;
            border-radius: var(--radius-sm);
          }
          @keyframes shimmer {
            0%   { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }

          /* ============================================================
             HUD-PANEL backward-compat — dipakai page.js Phase 1B+2A
             Sebelumnya cyan corner brackets + breath pulse. Phase 3A:
             ganti ke soft surface + gentle shadow + hover lift.
             Class tetap sama biar gak break existing markup.
             ============================================================ */
          .hud-panel {
            position: relative;
            padding: 18px;
            background-color: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            box-shadow: var(--shadow-sm);
            transition: transform var(--motion-base), box-shadow var(--motion-base);
          }
          .hud-panel:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow);
          }
          .hud-panel--magenta {
            border-color: var(--accent-bg);
          }
          .hud-label {
            display: inline-block;
            padding: 4px 10px;
            background: var(--primary-bg);
            color: var(--primary);
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border: 1px solid var(--border-accent);
            border-radius: var(--radius-sm);
            line-height: 1.4;
          }
          .hud-label--magenta {
            background: var(--accent-bg);
            color: var(--accent);
            border-color: rgba(245, 158, 11, 0.25);
          }

          /* ============================================================
             LAYOUT HELPERS — used by page.js dashboard markup
             ============================================================ */
          .dash-header {
            flex-wrap: wrap;
            gap: 10px;
          }
          .dash-tabs {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }
          .dash-tabs::-webkit-scrollbar { height: 4px; }
          .dash-tabs::-webkit-scrollbar-thumb { background: var(--primary); }
          .dash-main { padding: 24px; position: relative; z-index: 1; }

          .responsive-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
          .responsive-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
          .responsive-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
            gap: 14px;
          }

          .responsive-modal-backdrop { padding: 20px; }
          .responsive-modal-content {
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
          }

          .chat-sidebar { width: 220px; min-width: 220px; }
          .chat-main-area { flex: 1; }

          /* ============================================================
             MOBILE RESPONSIVE — breakpoint 768px
             ============================================================ */
          @media (max-width: 768px) {
            .dash-header h1 { font-size: 16px !important; }
            .dash-header {
              gap: 6px;
              padding: 10px 14px !important;
            }
            .dash-header a { font-size: 14px !important; }

            .dash-tabs { padding: 0 10px !important; }
            .dash-tabs > div {
              padding: 10px 12px !important;
              font-size: 11px !important;
              white-space: nowrap;
              flex-shrink: 0;
            }

            .dash-main { padding: 14px 10px !important; }

            .responsive-grid-3,
            .responsive-grid-2 {
              grid-template-columns: 1fr !important;
            }
            .responsive-stats {
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
              gap: 10px !important;
            }

            .responsive-modal-backdrop { padding: 0 !important; }
            .responsive-modal-content {
              max-height: 100vh !important;
              max-width: 100% !important;
              height: 100vh !important;
              border-radius: 0 !important;
              border: none !important;
            }

            .chat-sidebar {
              width: 100% !important;
              min-width: 100% !important;
              max-height: 180px;
              overflow-y: auto;
              border-right: none !important;
              border-bottom: 1px solid var(--border);
            }
            .chat-body-flex { flex-direction: column !important; }

            table { min-width: auto !important; }
            .mobile-hide-text { display: none !important; }

            /* Smaller orbs di mobile biar gak overload performance */
            .ambient-orb--1 { width: 280px; height: 280px; }
            .ambient-orb--2 { width: 240px; height: 240px; }
            .ambient-orb--3 { display: none; }
          }

          @media (max-width: 480px) {
            .dash-header h1 { font-size: 14px !important; }
            .dash-header { padding: 8px 10px !important; }
            .responsive-stats { grid-template-columns: 1fr 1fr !important; }
          }

          /* ============================================================
             HUD MODE SYSTEM — 3 mode: normal | hud-a | hud-b
             Ditrigger via body className. CSS variables ngubah intensity
             tanpa harus rewrite S object di page.js (karena S inline pake var).
             ============================================================ */
          :root {
            /* Default (normal mode) — subtle HUD cosmetics */
            --hud-glow-intensity: 0.05;
            --hud-border-strength: 0.15;
            --hud-bracket-color: rgba(34, 211, 238, 0.6);
            --hud-scan-opacity: 0;
            --hud-pulse-scale: 1;
            --hud-stars-opacity: 0.6;
          }
          body.hud-a, body.hud-b {
            --hud-glow-intensity: 0.15;
            --hud-border-strength: 0.4;
            --hud-bracket-color: rgba(34, 211, 238, 1);
            --hud-scan-opacity: 1;
            --hud-stars-opacity: 1;
          }

          /* Mode A/B — stronger glow on .box-like elements via attribute selector */
          body.hud-a [style*="rgba(34,211,238,0.15)"],
          body.hud-b [style*="rgba(34,211,238,0.15)"] {
            box-shadow: 0 0 24px rgba(34, 211, 238, 0.2), inset 0 0 30px rgba(34, 211, 238, 0.04) !important;
          }

          /* Mode A/B — scan line that automatically sweeps every box */
          body.hud-a div[style*="#111827"]::after,
          body.hud-b div[style*="#111827"]::after {
            content: '';
            position: absolute;
            left: 0; right: 0; top: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #22D3EE, transparent);
            box-shadow: 0 0 12px #22D3EE;
            pointer-events: none;
            animation: hudBoxScan 6s linear infinite;
            opacity: var(--hud-scan-opacity);
          }
          @keyframes hudBoxScan {
            0%   { top: 0; opacity: 0; }
            10%  { opacity: 0.6; }
            90%  { opacity: 0.6; }
            100% { top: 100%; opacity: 0; }
          }

          /* Mode A/B — strengthen tab active glow + pulse */
          body.hud-a [style*="rgba(34,211,238,0.45)"],
          body.hud-b [style*="rgba(34,211,238,0.45)"] {
            animation: hudTabPulse 2.4s ease-in-out infinite;
          }
          @keyframes hudTabPulse {
            0%, 100% { box-shadow: 0 0 12px rgba(34, 211, 238, 0.3), inset 0 0 8px rgba(34, 211, 238, 0.08); }
            50%      { box-shadow: 0 0 24px rgba(34, 211, 238, 0.6), inset 0 0 16px rgba(34, 211, 238, 0.15); }
          }

          /* Mode B ONLY — circular accent ring around cards (decorative gauge feel) */
          body.hud-b div[style*="rgba(34,211,238,0.15)"] {
            position: relative;
          }
          body.hud-b div[style*="rgba(34,211,238,0.15)"]::before {
            content: '';
            position: absolute;
            top: -8px; right: -8px;
            width: 24px; height: 24px;
            border: 2px solid rgba(34, 211, 238, 0.7);
            border-right-color: transparent;
            border-bottom-color: transparent;
            border-radius: 50%;
            animation: hudGaugeSpin 4s linear infinite;
            pointer-events: none;
          }
          @keyframes hudGaugeSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          /* HUD canvas star field — fixed bg, behind everything */
          #hud-starfield {
            position: fixed;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            opacity: var(--hud-stars-opacity);
            transition: opacity 0.6s ease;
          }
          body.normal #hud-starfield { display: none; }

          /* Tables fully transparent on HUD-B (always-on mode) */
          body.hud-b table { background: transparent !important; }
          body.hud-b tr,
          body.hud-b tbody,
          body.hud-b thead { background: transparent !important; }
          /* Body bg lebih gelap biar bintang kontras */
          body.hud-b { background: #050811 !important; }

          /* ============================================================
             HUD COSMETIC LAYER — sci-fi accent on top of Midnight Stadium
             Subtle additions: cyan accent borders sudah masuk via S object
             di page.js. Sini cuma tambahin starfield twinkle global + scan line
             cosmetic biar dashboard berasa "hidup". Gak ngubah tata letak.
             ============================================================ */

          /* Tiny cyan twinkle dots scattered (decorative, super subtle) */
          body::before {
            content: '';
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: -1;
            background-image:
              radial-gradient(1px 1px at 12% 18%, rgba(34, 211, 238, 0.5), transparent 60%),
              radial-gradient(1px 1px at 28% 72%, rgba(34, 211, 238, 0.4), transparent 60%),
              radial-gradient(1px 1px at 45% 35%, rgba(34, 211, 238, 0.6), transparent 60%),
              radial-gradient(1px 1px at 67% 84%, rgba(34, 211, 238, 0.4), transparent 60%),
              radial-gradient(1px 1px at 82% 26%, rgba(34, 211, 238, 0.5), transparent 60%),
              radial-gradient(1px 1px at 91% 58%, rgba(34, 211, 238, 0.4), transparent 60%),
              radial-gradient(2px 2px at 8% 88%, rgba(34, 211, 238, 0.3), transparent 60%),
              radial-gradient(2px 2px at 55% 12%, rgba(34, 211, 238, 0.3), transparent 60%);
            animation: hudTwinkle 8s ease-in-out infinite;
          }
          @keyframes hudTwinkle {
            0%, 100% { opacity: 0.6; }
            50%      { opacity: 0.9; }
          }

          /* Subtle horizontal scan line on hover for elements with .hud-panel */
          .hud-panel::after {
            content: '';
            position: absolute;
            left: 0; right: 0; top: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.6), transparent);
            opacity: 0;
            transition: opacity 0.3s, top 4s linear;
          }
          .hud-panel:hover::after {
            opacity: 1;
            top: 100%;
          }

          /* Numeric display monospace + cyan glow utility */
          .hud-num {
            font-family: 'Menlo', 'Consolas', 'Courier New', monospace !important;
            letter-spacing: 0.5px;
            text-shadow: 0 0 8px currentColor;
          }

          /* Sector code label (decorative) */
          .hud-sector-code {
            display: inline-block;
            padding: 1px 6px;
            font-family: 'Menlo', 'Consolas', monospace;
            font-size: 9px;
            letter-spacing: 1.5px;
            color: rgba(34, 211, 238, 0.8);
            border: 1px solid rgba(34, 211, 238, 0.4);
            border-radius: 2px;
            background: rgba(0, 0, 0, 0.3);
          }

          /* ============================================================
             ACCESSIBILITY — prefers-reduced-motion
             Disable orb floating + fade-in animations untuk user yg sensitive.
             Per W3C guidance: motion >5s yang auto-start harus pause-able.
             ============================================================ */
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.001ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.001ms !important;
              scroll-behavior: auto !important;
            }
            .ambient-orb {
              animation: none !important;
              opacity: 0.25 !important;
            }
          }
        `}} />
      </head>
      <body>
        {/* Ambient orbs — 4 floating background, more visible motion */}
        <div className="ambient-orb ambient-orb--1" aria-hidden="true"></div>
        <div className="ambient-orb ambient-orb--2" aria-hidden="true"></div>
        <div className="ambient-orb ambient-orb--3" aria-hidden="true"></div>
        <div className="ambient-orb ambient-orb--4" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}
