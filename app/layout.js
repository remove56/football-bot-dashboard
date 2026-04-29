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

          /* ============================================================
             3D PARALLAX LAYERS — per-theme depth animation
             3 layer (back/mid/front) dengan perspective + translateZ
             ============================================================ */

          .theme-fx {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            z-index: 1;
            perspective: 1200px;
            perspective-origin: 50% 50%;
            overflow: hidden;
            transform-style: preserve-3d;
          }
          .theme-fx-layer {
            position: absolute;
            top: -10%; left: -10%;
            width: 120%;
            height: 120%;
            transform-style: preserve-3d;
            backface-visibility: hidden;
          }

          /* ====== 🧊 ICE 3D — crystal facets rotating with depth ====== */
          html[data-theme="ice"] .theme-fx-layer.fx-back,
          html:not([data-theme]) .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(ellipse 800px 600px at 25% 30%, rgba(6, 182, 212, 0.18) 0%, transparent 50%),
              radial-gradient(ellipse 700px 500px at 75% 70%, rgba(14, 165, 233, 0.14) 0%, transparent 50%);
            animation: ice3DBack 50s linear infinite;
          }
          html[data-theme="ice"] .theme-fx-layer.fx-mid,
          html:not([data-theme]) .theme-fx-layer.fx-mid {
            background-image:
              linear-gradient(60deg, transparent 48%, rgba(103, 232, 249, 0.06) 49%, rgba(103, 232, 249, 0.06) 51%, transparent 52%),
              linear-gradient(120deg, transparent 48%, rgba(103, 232, 249, 0.05) 49%, rgba(103, 232, 249, 0.05) 51%, transparent 52%),
              linear-gradient(0deg, transparent 48%, rgba(34, 211, 238, 0.04) 49%, rgba(34, 211, 238, 0.04) 51%, transparent 52%);
            background-size: 200px 200px, 200px 200px, 150px 150px;
            animation: ice3DMid 35s linear infinite;
          }
          html[data-theme="ice"] .theme-fx-layer.fx-front,
          html:not([data-theme]) .theme-fx-layer.fx-front {
            background-image:
              radial-gradient(circle at 20% 40%, rgba(165, 243, 252, 0.4), transparent 1px),
              radial-gradient(circle at 60% 70%, rgba(165, 243, 252, 0.3), transparent 1px),
              radial-gradient(circle at 80% 20%, rgba(165, 243, 252, 0.5), transparent 1px),
              radial-gradient(circle at 35% 85%, rgba(165, 243, 252, 0.4), transparent 1px);
            background-size: 350px 350px, 280px 280px, 320px 320px, 400px 400px;
            animation: ice3DFront 22s linear infinite;
          }
          @keyframes ice3DBack {
            0%   { transform: rotateY(0deg) rotateX(2deg) translateZ(-300px); }
            100% { transform: rotateY(360deg) rotateX(2deg) translateZ(-300px); }
          }
          @keyframes ice3DMid {
            0%   { transform: translateZ(-100px) rotate(0deg); }
            100% { transform: translateZ(-100px) rotate(360deg); }
          }
          @keyframes ice3DFront {
            0%   { transform: translate3d(0, 0, 100px); }
            100% { transform: translate3d(-50px, -30px, 100px); }
          }

          /* ====== 💎 GLASS 3D — floating orbs with depth ====== */
          html[data-theme="glass"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 60%);
            animation: glass3DBack 30s ease-in-out infinite;
          }
          html[data-theme="glass"] .theme-fx-layer.fx-mid {
            background-image:
              radial-gradient(circle 250px at 25% 30%, rgba(139, 92, 246, 0.35) 0%, transparent 60%),
              radial-gradient(circle 200px at 75% 70%, rgba(6, 182, 212, 0.30) 0%, transparent 60%),
              radial-gradient(circle 180px at 60% 25%, rgba(168, 85, 247, 0.25) 0%, transparent 60%);
            animation: glass3DMid 18s ease-in-out infinite;
          }
          html[data-theme="glass"] .theme-fx-layer.fx-front {
            background-image:
              radial-gradient(circle 100px at 15% 80%, rgba(34, 211, 238, 0.25) 0%, transparent 60%),
              radial-gradient(circle 80px at 85% 20%, rgba(139, 92, 246, 0.30) 0%, transparent 60%);
            animation: glass3DFront 12s ease-in-out infinite;
          }
          @keyframes glass3DBack {
            0%, 100% { transform: translateZ(-400px) scale(1); }
            50%      { transform: translateZ(-400px) scale(1.15); }
          }
          @keyframes glass3DMid {
            0%, 100% { transform: translate3d(0, 0, -100px) rotateY(0deg); }
            33%      { transform: translate3d(40px, -30px, 50px) rotateY(15deg); }
            66%      { transform: translate3d(-30px, 40px, -50px) rotateY(-10deg); }
          }
          @keyframes glass3DFront {
            0%, 100% { transform: translate3d(0, 0, 200px) scale(1); }
            50%      { transform: translate3d(20px, -40px, 300px) scale(1.2); }
          }

          /* ====== 🌌 GALAXY 3D — HYPERSPACE WARP STARS ====== */
          html[data-theme="galaxy"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(ellipse at center, rgba(168, 85, 247, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse 500px 800px at 30% 40%, rgba(236, 72, 153, 0.18) 0%, transparent 60%),
              radial-gradient(ellipse 600px 400px at 70% 60%, rgba(59, 130, 246, 0.15) 0%, transparent 60%);
            animation: galaxy3DBack 60s linear infinite;
          }
          html[data-theme="galaxy"] .theme-fx-layer.fx-mid {
            /* Distant stars rotating */
            background-image:
              radial-gradient(1px 1px at 10% 15%, white, transparent),
              radial-gradient(1px 1px at 30% 60%, white, transparent),
              radial-gradient(1px 1px at 50% 30%, white, transparent),
              radial-gradient(1px 1px at 70% 75%, white, transparent),
              radial-gradient(1px 1px at 90% 20%, white, transparent),
              radial-gradient(1.5px 1.5px at 25% 85%, #fde68a, transparent),
              radial-gradient(1.5px 1.5px at 80% 50%, #93c5fd, transparent);
            background-size: 250px 250px, 300px 300px, 200px 200px, 350px 350px, 280px 280px, 320px 320px, 280px 280px;
            animation: galaxy3DMid 45s linear infinite;
          }
          html[data-theme="galaxy"] .theme-fx-layer.fx-front {
            /* Hyperspace stars zooming forward */
            background-image:
              radial-gradient(2px 2px at 50% 50%, white, transparent),
              radial-gradient(2px 2px at 30% 30%, #93c5fd, transparent),
              radial-gradient(2px 2px at 70% 70%, #fde68a, transparent),
              radial-gradient(2px 2px at 20% 70%, white, transparent),
              radial-gradient(2px 2px at 80% 30%, #fda4af, transparent),
              radial-gradient(3px 3px at 40% 80%, white, transparent),
              radial-gradient(3px 3px at 60% 20%, #c4b5fd, transparent);
            background-size: 100% 100%;
            animation: galaxy3DWarp 4s linear infinite;
          }
          @keyframes galaxy3DBack {
            0%   { transform: translateZ(-500px) rotate(0deg); }
            100% { transform: translateZ(-500px) rotate(360deg); }
          }
          @keyframes galaxy3DMid {
            0%   { transform: translateZ(-200px) rotate(0deg); }
            100% { transform: translateZ(-200px) rotate(-360deg); }
          }
          @keyframes galaxy3DWarp {
            0% {
              transform: translateZ(-800px) scale(0.05);
              opacity: 0;
            }
            20% { opacity: 1; }
            100% {
              transform: translateZ(400px) scale(3);
              opacity: 0;
            }
          }

          /* ====== 🔮 CYBERPUNK 3D — TRON GRID FLOOR ====== */
          html[data-theme="cyberpunk"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(ellipse at 50% 30%, rgba(236, 72, 153, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 70%, rgba(6, 182, 212, 0.20) 0%, transparent 50%);
            animation: cyber3DBack 12s ease-in-out infinite;
          }
          html[data-theme="cyberpunk"] .theme-fx-layer.fx-mid {
            /* Tron grid floor — perspective receding */
            background-image:
              linear-gradient(rgba(236, 72, 153, 0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.6) 1px, transparent 1px);
            background-size: 60px 60px;
            transform-origin: 50% 100%;
            transform: rotateX(75deg) translateY(40%) translateZ(0);
            animation: tronGridMove 3s linear infinite;
            opacity: 0.7;
          }
          html[data-theme="cyberpunk"] .theme-fx-layer.fx-front {
            /* Neon particles flying past */
            background-image:
              radial-gradient(circle at 20% 30%, rgba(236, 72, 153, 0.6), transparent 2px),
              radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.6), transparent 2px),
              radial-gradient(circle at 60% 80%, rgba(168, 85, 247, 0.5), transparent 2px),
              radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.5), transparent 2px);
            background-size: 400px 400px, 350px 350px, 300px 300px, 380px 380px;
            animation: cyber3DFront 8s linear infinite;
          }
          @keyframes cyber3DBack {
            0%, 100% { transform: translateZ(-300px) scale(1); filter: hue-rotate(0deg); }
            50%      { transform: translateZ(-300px) scale(1.1); filter: hue-rotate(30deg); }
          }
          @keyframes tronGridMove {
            from { background-position: 0 0; }
            to   { background-position: 0 60px; }
          }
          @keyframes cyber3DFront {
            0%   { transform: translate3d(0, 0, 100px); }
            100% { transform: translate3d(-100px, -50px, 100px); }
          }

          /* ====== 🌅 AURORA 3D — wave curtains with depth ====== */
          html[data-theme="aurora"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(ellipse 1500px 500px at 50% 20%, rgba(34, 197, 94, 0.22) 0%, transparent 60%),
              radial-gradient(ellipse 1200px 400px at 30% 50%, rgba(59, 130, 246, 0.18) 0%, transparent 60%);
            animation: aurora3DBack 22s ease-in-out infinite;
          }
          html[data-theme="aurora"] .theme-fx-layer.fx-mid {
            background-image:
              radial-gradient(ellipse 900px 350px at 70% 40%, rgba(168, 85, 247, 0.20) 0%, transparent 65%),
              radial-gradient(ellipse 700px 250px at 50% 70%, rgba(20, 184, 166, 0.18) 0%, transparent 65%);
            animation: aurora3DMid 18s ease-in-out infinite;
          }
          html[data-theme="aurora"] .theme-fx-layer.fx-front {
            /* Light particles floating */
            background-image:
              radial-gradient(2px 2px at 15% 30%, rgba(167, 243, 208, 0.7), transparent),
              radial-gradient(2px 2px at 75% 50%, rgba(147, 197, 253, 0.6), transparent),
              radial-gradient(2px 2px at 40% 80%, rgba(196, 181, 253, 0.7), transparent),
              radial-gradient(1.5px 1.5px at 85% 25%, rgba(167, 243, 208, 0.5), transparent);
            background-size: 250px 250px, 300px 300px, 280px 280px, 350px 350px;
            animation: aurora3DFront 14s linear infinite;
          }
          @keyframes aurora3DBack {
            0%, 100% { transform: translateZ(-400px) scaleY(1) translateX(0); filter: hue-rotate(0deg); }
            33%      { transform: translateZ(-400px) scaleY(1.15) translateX(40px); filter: hue-rotate(20deg); }
            66%      { transform: translateZ(-400px) scaleY(0.9) translateX(-30px); filter: hue-rotate(-15deg); }
          }
          @keyframes aurora3DMid {
            0%, 100% { transform: translateZ(-150px) translateX(0) rotateZ(0deg); }
            50%      { transform: translateZ(-150px) translateX(50px) rotateZ(2deg); }
          }
          @keyframes aurora3DFront {
            0%   { transform: translate3d(0, 0, 100px); }
            100% { transform: translate3d(60px, -40px, 100px); }
          }

          /* Reduce motion → disable 3D animations */
          @media (prefers-reduced-motion: reduce) {
            .theme-fx-layer { animation: none !important; transform: none !important; }
          }

          /* Mobile: simpler 3D (skip front layer animation = save battery) */
          @media (max-width: 768px) {
            .theme-fx-layer.fx-front { animation-duration: 30s !important; }
            .theme-fx { perspective: 800px; }
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
        {/* 3D parallax layers — per-theme animated depth */}
        <div className="theme-fx" aria-hidden="true">
          <div className="theme-fx-layer fx-back"></div>
          <div className="theme-fx-layer fx-mid"></div>
          <div className="theme-fx-layer fx-front"></div>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
