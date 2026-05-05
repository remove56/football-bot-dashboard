export const metadata = { title: 'Football Bot Dashboard' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* ============================================================
             DESIGN TOKENS — Horizon/shadcn-modern, slate base + cyan accent.
             Phase 1 foundation: clean dark, no video bg, solid surfaces.
             ============================================================ */
          :root {
            --bg-base:        #020617;  /* slate-950 — body */
            --bg-surface:     #0f172a;  /* slate-900 — cards */
            --bg-surface-2:   #1e293b;  /* slate-800 — elevated */
            --bg-input:       #0a1224;  /* deeper for form fields */
            --border:         #1e293b;  /* slate-800 */
            --border-strong:  #334155;  /* slate-700 */
            --border-accent:  rgba(34, 211, 238, 0.25);
            --text-primary:   #e0f2fe;  /* sky-100 */
            --text-secondary: #94a3b8;  /* slate-400 */
            --text-muted:     #64748b;  /* slate-500 */
            --accent:         #22d3ee;  /* cyan-400 */
            --accent-hover:   #06b6d4;  /* cyan-500 */
            --accent-bg:      rgba(34, 211, 238, 0.10);
            --accent-magenta: #d946ef;  /* fuchsia-500 — HUD secondary accent */
            --accent-magenta-bg: rgba(217, 70, 239, 0.10);
            --success:        #10b981;  /* emerald-500 */
            --warning:        #f59e0b;  /* amber-500 */
            --danger:         #ef4444;  /* red-500 */
            --radius-sm:      4px;
            --radius:         8px;
            --radius-lg:      12px;
            --shadow-sm:      0 1px 2px rgba(0, 0, 0, 0.3);
            --shadow:         0 4px 16px rgba(0, 0, 0, 0.35);
            --shadow-lg:      0 8px 32px rgba(0, 0, 0, 0.45);
          }

          /* ============================================================
             RESET & BASE
             ============================================================ */
          *, *::before, *::after { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: var(--bg-base);
            color: var(--text-primary);
            font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            min-height: 100vh;
          }

          /* Scrollbar — minimal, slate-themed */
          ::-webkit-scrollbar { width: 10px; height: 10px; }
          ::-webkit-scrollbar-track { background: var(--bg-base); }
          ::-webkit-scrollbar-thumb {
            background: var(--bg-surface-2);
            border-radius: var(--radius-sm);
          }
          ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
          ::-webkit-scrollbar-corner { background: var(--bg-base); }

          /* Focus ring — accessible + branded */
          :focus-visible {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
            border-radius: var(--radius-sm);
          }
          input:focus, select:focus, textarea:focus {
            border-color: var(--accent) !important;
            box-shadow: 0 0 0 3px var(--accent-bg) !important;
            outline: none;
          }

          /* Selection */
          ::selection {
            background: var(--accent-bg);
            color: var(--text-primary);
          }

          /* Subtle button hover (no garish glow) */
          button:not(:disabled):hover, [role="button"]:not(:disabled):hover {
            filter: brightness(1.1);
          }
          button:not(:disabled):active, [role="button"]:not(:disabled):active {
            transform: translateY(1px);
          }

          /* ============================================================
             ANIMATIONS — keep features-used keyframes
             ============================================================ */
          @keyframes bellPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          @keyframes recordPulse {
            0%, 100% { background-color: #991b1b; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            50% { background-color: #dc2626; box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          }
          @keyframes onlinePulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
          }
          .chat-message-row:hover .msg-delete-btn { opacity: 1 !important; }

          /* ============================================================
             HUD AESTHETIC — Phase 1B experimental (Overview tab only)
             Cyan corner brackets via 8 background-image lines per panel.
             No HTML changes needed: just add className="hud-panel".
             Magenta variant: className="hud-panel hud-panel--magenta".
             ============================================================ */
          .hud-panel {
            position: relative;
            padding: 18px;
            background-color: var(--bg-surface);
            background-image:
              linear-gradient(var(--accent), var(--accent)),
              linear-gradient(var(--accent), var(--accent)),
              linear-gradient(var(--accent), var(--accent)),
              linear-gradient(var(--accent), var(--accent)),
              linear-gradient(var(--accent), var(--accent)),
              linear-gradient(var(--accent), var(--accent)),
              linear-gradient(var(--accent), var(--accent)),
              linear-gradient(var(--accent), var(--accent));
            background-size:
              16px 2px, 2px 16px,
              16px 2px, 2px 16px,
              16px 2px, 2px 16px,
              16px 2px, 2px 16px;
            background-position:
              top left, top left,
              top right, top right,
              bottom left, bottom left,
              bottom right, bottom right;
            background-repeat: no-repeat;
            border: 1px solid var(--border);
            border-radius: 2px;
          }
          .hud-panel--magenta {
            background-image:
              linear-gradient(var(--accent-magenta), var(--accent-magenta)),
              linear-gradient(var(--accent-magenta), var(--accent-magenta)),
              linear-gradient(var(--accent-magenta), var(--accent-magenta)),
              linear-gradient(var(--accent-magenta), var(--accent-magenta)),
              linear-gradient(var(--accent-magenta), var(--accent-magenta)),
              linear-gradient(var(--accent-magenta), var(--accent-magenta)),
              linear-gradient(var(--accent-magenta), var(--accent-magenta)),
              linear-gradient(var(--accent-magenta), var(--accent-magenta));
          }
          .hud-label {
            display: inline-block;
            padding: 3px 10px;
            background: var(--accent-bg);
            color: var(--accent);
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.8px;
            border: 1px solid var(--border-accent);
            border-radius: 2px;
            line-height: 1.4;
          }
          .hud-label--magenta {
            background: var(--accent-magenta-bg);
            color: var(--accent-magenta);
            border-color: rgba(217, 70, 239, 0.25);
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
          .dash-tabs::-webkit-scrollbar-thumb { background: var(--accent); }
          .dash-main { padding: 24px; }

          .responsive-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
          .responsive-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .responsive-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
             MOBILE RESPONSIVE — breakpoint 768px (tablet/HP)
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
              grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)) !important;
              gap: 8px !important;
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
          }

          @media (max-width: 480px) {
            .dash-header h1 { font-size: 14px !important; }
            .dash-header { padding: 8px 10px !important; }
            .responsive-stats { grid-template-columns: 1fr 1fr !important; }
          }

          /* Reduce-motion preference — disable non-essential animations */
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
