export const metadata = { title: 'Football Bot Dashboard' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* ============================================================
             THEME SYSTEM — 5 themes via [data-theme] on html
             Default = Crystal Ice. Override per theme for body bg + ::before + ::after.
             ============================================================ */

          /* Default body bg + before/after wrappers (semua tema share struktur) */
          body::before {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            z-index: 0;
          }
          body::after {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 2px;
            pointer-events: none;
            z-index: 99;
          }

          /* ====== 🧊 ICE CRYSTAL (default) ====== */
          html:not([data-theme]) body, html[data-theme="ice"] body {
            background: linear-gradient(180deg, #020617 0%, #0f172a 40%, #0c1220 70%, #020617 100%) !important;
          }
          html:not([data-theme]) body::before, html[data-theme="ice"] body::before {
            background-image:
              radial-gradient(circle at 15% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 25%),
              radial-gradient(circle at 85% 15%, rgba(14, 165, 233, 0.06) 0%, transparent 30%),
              radial-gradient(circle at 25% 80%, rgba(34, 211, 238, 0.05) 0%, transparent 28%),
              radial-gradient(circle at 80% 85%, rgba(8, 145, 178, 0.07) 0%, transparent 30%),
              linear-gradient(135deg, transparent 48%, rgba(103, 232, 249, 0.02) 49%, rgba(103, 232, 249, 0.02) 51%, transparent 52%),
              linear-gradient(45deg, transparent 48%, rgba(103, 232, 249, 0.015) 49%, rgba(103, 232, 249, 0.015) 51%, transparent 52%);
            background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 120px 120px, 120px 120px;
          }
          html:not([data-theme]) body::after, html[data-theme="ice"] body::after {
            background: linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.4) 20%, rgba(103, 232, 249, 0.6) 50%, rgba(6, 182, 212, 0.4) 80%, transparent 100%);
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
          }

          /* ====== 💎 3D GLASS ====== */
          html[data-theme="glass"] body {
            background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 40%, #16213e 70%, #0a0e27 100%) !important;
          }
          html[data-theme="glass"] body::before {
            background-image:
              radial-gradient(circle at 20% 25%, rgba(139, 92, 246, 0.18) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.14) 0%, transparent 38%),
              radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.10) 0%, transparent 50%);
            animation: glassFloat 18s ease-in-out infinite;
          }
          html[data-theme="glass"] body::after {
            background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), rgba(6, 182, 212, 0.7), rgba(139, 92, 246, 0.6), transparent);
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
            height: 3px;
          }
          @keyframes glassFloat {
            0%, 100% { transform: scale(1) translate(0, 0); }
            33% { transform: scale(1.05) translate(10px, -8px); }
            66% { transform: scale(0.97) translate(-12px, 6px); }
          }

          /* ====== 🌌 GALAXY ANIMATED ====== */
          html[data-theme="galaxy"] body {
            background: radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a1f 50%, #000000 100%) !important;
          }
          html[data-theme="galaxy"] body::before {
            background-image:
              /* Nebula clouds */
              radial-gradient(ellipse 800px 600px at 25% 30%, rgba(168, 85, 247, 0.22) 0%, transparent 50%),
              radial-gradient(ellipse 700px 500px at 75% 60%, rgba(236, 72, 153, 0.18) 0%, transparent 50%),
              radial-gradient(ellipse 600px 400px at 50% 80%, rgba(59, 130, 246, 0.14) 0%, transparent 50%),
              /* Stars layer 1 (small) */
              radial-gradient(1px 1px at 10% 15%, white, transparent),
              radial-gradient(1px 1px at 25% 60%, white, transparent),
              radial-gradient(1px 1px at 40% 30%, white, transparent),
              radial-gradient(1px 1px at 55% 75%, white, transparent),
              radial-gradient(1px 1px at 70% 20%, white, transparent),
              radial-gradient(1px 1px at 85% 55%, white, transparent),
              radial-gradient(1px 1px at 92% 12%, white, transparent),
              radial-gradient(1px 1px at 18% 85%, white, transparent),
              radial-gradient(1.5px 1.5px at 65% 40%, white, transparent),
              radial-gradient(1.5px 1.5px at 35% 90%, #fde68a, transparent),
              radial-gradient(2px 2px at 78% 88%, #93c5fd, transparent),
              radial-gradient(2px 2px at 8% 50%, #fda4af, transparent);
            background-size: 100% 100%, 100% 100%, 100% 100%, 200px 200px, 250px 250px, 300px 300px, 200px 200px, 250px 250px, 300px 300px, 350px 350px, 400px 400px, 220px 220px, 280px 280px, 320px 320px;
            animation: galaxyDrift 80s ease-in-out infinite, twinkleStars 6s ease-in-out infinite;
          }
          html[data-theme="galaxy"] body::after {
            background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.9), rgba(236, 72, 153, 0.9), rgba(168, 85, 247, 0.9), transparent);
            box-shadow: 0 0 25px rgba(168, 85, 247, 0.7), 0 0 40px rgba(236, 72, 153, 0.5);
            height: 2px;
          }
          @keyframes galaxyDrift {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.08) rotate(1deg); }
          }
          @keyframes twinkleStars {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          /* ====== 🔮 CYBERPUNK NEON ====== */
          html[data-theme="cyberpunk"] body {
            background: linear-gradient(180deg, #1a0033 0%, #0d0019 50%, #1a0033 100%) !important;
          }
          html[data-theme="cyberpunk"] body::before {
            background-image:
              radial-gradient(circle at 20% 25%, rgba(236, 72, 153, 0.22) 0%, transparent 40%),
              radial-gradient(circle at 80% 75%, rgba(6, 182, 212, 0.18) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.10) 0%, transparent 60%),
              repeating-linear-gradient(0deg, rgba(236, 72, 153, 0.04) 0px, rgba(236, 72, 153, 0.04) 1px, transparent 2px, transparent 4px);
            animation: cyberPulse 8s ease-in-out infinite;
          }
          html[data-theme="cyberpunk"] body::after {
            background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.95), rgba(6, 182, 212, 0.95), rgba(236, 72, 153, 0.95), transparent);
            box-shadow: 0 0 30px rgba(236, 72, 153, 0.8), 0 0 50px rgba(6, 182, 212, 0.6);
            height: 3px;
          }
          @keyframes cyberPulse {
            0%, 100% { filter: brightness(1) hue-rotate(0deg); }
            50% { filter: brightness(1.15) hue-rotate(15deg); }
          }

          /* ====== 🌅 AURORA ====== */
          html[data-theme="aurora"] body {
            background: linear-gradient(180deg, #0a1929 0%, #0d2a47 40%, #0e3a5f 70%, #0a1929 100%) !important;
          }
          html[data-theme="aurora"] body::before {
            background-image:
              radial-gradient(ellipse 1200px 400px at 50% 25%, rgba(34, 197, 94, 0.20) 0%, transparent 65%),
              radial-gradient(ellipse 900px 300px at 30% 50%, rgba(59, 130, 246, 0.18) 0%, transparent 65%),
              radial-gradient(ellipse 1000px 350px at 70% 40%, rgba(168, 85, 247, 0.15) 0%, transparent 65%),
              radial-gradient(ellipse 800px 250px at 50% 75%, rgba(20, 184, 166, 0.14) 0%, transparent 65%);
            animation: auroraWave 25s ease-in-out infinite;
          }
          html[data-theme="aurora"] body::after {
            background: linear-gradient(90deg, transparent, #22c55e, #3b82f6, #a855f7, #22c55e, transparent);
            box-shadow: 0 0 25px rgba(34, 197, 94, 0.6), 0 0 40px rgba(168, 85, 247, 0.4);
            height: 2px;
          }
          @keyframes auroraWave {
            0%, 100% { transform: scaleY(1) translateX(0); filter: hue-rotate(0deg); }
            25% { transform: scaleY(1.12) translateX(30px); filter: hue-rotate(20deg); }
            50% { transform: scaleY(0.92) translateX(-25px); filter: hue-rotate(-15deg); }
            75% { transform: scaleY(1.08) translateX(15px); filter: hue-rotate(10deg); }
          }

          /* Reduce motion preference — disable theme animations */
          @media (prefers-reduced-motion: reduce) {
            body::before, body::after { animation: none !important; }
          }


          /* Scrollbar — kristal es */
          ::-webkit-scrollbar { width: 10px; height: 10px; }
          ::-webkit-scrollbar-track { background: #020617; border-left: 1px solid #0f172a; }
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #0e7490, #164e63);
            border-radius: 2px;
            border: 1px solid #0f172a;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #06b6d4, #0891b2);
            box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
          }
          ::-webkit-scrollbar-corner { background: #020617; }

          /* Input focus — icy glow */
          input:focus, select:focus, textarea:focus {
            border-color: #06b6d4 !important;
            box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2), 0 0 15px rgba(103, 232, 249, 0.2) !important;
          }

          /* Button hover — sharp response */
          button:hover, [role="button"]:hover {
            filter: brightness(1.2);
            transform: translateY(-1px);
            box-shadow: 0 4px 20px rgba(6, 182, 212, 0.4) !important;
          }

          /* Selection — ice highlight */
          ::selection {
            background: rgba(6, 182, 212, 0.4);
            color: #e0f2fe;
          }

          /* Bell/chat pulse animation — saat ada unread */
          @keyframes bellPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }

          /* Recording pulse — tombol record voice */
          @keyframes recordPulse {
            0%, 100% { background-color: #991b1b; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            50% { background-color: #dc2626; box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          }

          /* Chat message delete button — show on hover */
          .chat-message-row:hover .msg-delete-btn {
            opacity: 1 !important;
          }

          /* Online dot pulse animation */
          @keyframes onlinePulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
          }

          /* ============================================================
             MOBILE RESPONSIVE — breakpoint 768px (tablet/HP)
             ============================================================ */

          /* Header row: wrap kalau kepenuhan di mobile */
          .dash-header {
            flex-wrap: wrap;
            gap: 10px;
          }

          /* Tab navigation: horizontal scroll di mobile */
          .dash-tabs {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }
          .dash-tabs::-webkit-scrollbar { height: 4px; }
          .dash-tabs::-webkit-scrollbar-thumb { background: #0891b2; }

          /* Main content: padding lebih kecil di mobile */
          .dash-main {
            padding: 24px;
          }

          /* Grid form: default 2-3 kolom */
          .responsive-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
          .responsive-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

          /* Stat cards grid */
          .responsive-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }

          /* Modal base — full screen di mobile */
          .responsive-modal-backdrop {
            padding: 20px;
          }
          .responsive-modal-content {
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
          }

          /* Chat modal specific — sidebar fixed 220px di desktop */
          .chat-sidebar { width: 220px; min-width: 220px; }
          .chat-main-area { flex: 1; }

          @media (max-width: 768px) {
            /* Header: font logo lebih kecil, icons wrap */
            .dash-header h1 { font-size: 16px !important; }
            .dash-header {
              gap: 6px;
              padding: 10px 14px !important;
            }
            .dash-header a { font-size: 14px !important; }

            /* Tabs: font lebih kecil, padding kompak */
            .dash-tabs {
              padding: 0 10px !important;
            }
            .dash-tabs > div {
              padding: 10px 12px !important;
              font-size: 11px !important;
              white-space: nowrap;
              flex-shrink: 0;
            }

            /* Main content padding kecilin */
            .dash-main {
              padding: 14px 10px !important;
            }

            /* Grid forms stack jadi 1 kolom */
            .responsive-grid-3,
            .responsive-grid-2 {
              grid-template-columns: 1fr !important;
            }

            /* Stat cards: minimum 130px */
            .responsive-stats {
              grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)) !important;
              gap: 8px !important;
            }

            /* Modal — hampir full screen di mobile */
            .responsive-modal-backdrop {
              padding: 0 !important;
            }
            .responsive-modal-content {
              max-height: 100vh !important;
              max-width: 100% !important;
              height: 100vh !important;
              border-radius: 0 !important;
              border: none !important;
            }

            /* Chat modal: sidebar collapsible */
            .chat-sidebar {
              width: 100% !important;
              min-width: 100% !important;
              max-height: 180px;
              overflow-y: auto;
              border-right: none !important;
              border-bottom: 1px solid #1f2937;
            }
            .chat-body-flex {
              flex-direction: column !important;
            }

            /* Tables: force horizontal scroll */
            table {
              min-width: auto !important;
            }

            /* Hide some text di mobile, icon only */
            .mobile-hide-text {
              display: none !important;
            }
          }

          @media (max-width: 480px) {
            /* Extra small phones */
            .dash-header h1 { font-size: 14px !important; }
            .dash-header {
              padding: 8px 10px !important;
            }
            .responsive-stats {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}} />
      </head>
      <body style={{
        margin: 0,
        fontFamily: "'Segoe UI', 'Inter', sans-serif",
        color: '#e0f2fe',
        minHeight: '100vh',
        position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
