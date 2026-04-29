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

          /* ============================================================
             4 GALAXY VARIANTS — planet-based 3D themes (HD CSS planets)
             ============================================================ */

          /* Planet base styles — common to all galaxy variants */
          .theme-planet {
            position: absolute;
            border-radius: 50%;
            display: none; /* hidden by default, enable per theme */
            transform-style: preserve-3d;
          }
          .theme-planet-ring {
            position: absolute;
            border-radius: 50%;
            border-style: solid;
            transform-style: preserve-3d;
          }

          /* ====== 🪐 DEEP SPACE (planet + ring + stars) — ref gambar 1 ====== */
          html[data-theme="deepspace"] body {
            background: radial-gradient(ellipse at center, #0a0e2e 0%, #050715 60%, #000 100%) !important;
          }
          html[data-theme="deepspace"] body::before {
            background-image:
              radial-gradient(ellipse 1000px 600px at 30% 40%, rgba(99, 102, 241, 0.18) 0%, transparent 60%),
              radial-gradient(ellipse 800px 500px at 70% 60%, rgba(34, 211, 238, 0.12) 0%, transparent 60%);
          }
          html[data-theme="deepspace"] body::after {
            background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.8), rgba(167, 139, 250, 0.8), transparent);
            box-shadow: 0 0 30px rgba(96, 165, 250, 0.6);
            height: 2px;
          }
          /* Stars layer */
          html[data-theme="deepspace"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(1px 1px at 12% 18%, white, transparent),
              radial-gradient(1px 1px at 28% 55%, white, transparent),
              radial-gradient(1px 1px at 45% 25%, white, transparent),
              radial-gradient(1px 1px at 65% 75%, white, transparent),
              radial-gradient(1px 1px at 88% 30%, white, transparent),
              radial-gradient(1.5px 1.5px at 22% 80%, #fef3c7, transparent),
              radial-gradient(1.5px 1.5px at 75% 50%, #93c5fd, transparent),
              radial-gradient(2px 2px at 55% 85%, white, transparent);
            background-size: 220px 220px, 280px 280px, 250px 250px, 320px 320px, 290px 290px, 340px 340px, 380px 380px, 420px 420px;
            animation: deepStarsDrift 100s linear infinite;
          }
          /* Comet/light streak */
          html[data-theme="deepspace"] .theme-fx-layer.fx-mid {
            background-image:
              linear-gradient(115deg, transparent 47%, rgba(255, 255, 255, 0.6) 49%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.6) 51%, transparent 53%);
            background-size: 1500px 1500px;
            background-position: -800px 0;
            animation: cometStreak 18s linear infinite;
            opacity: 0.4;
          }
          /* Big Earth-like planet bottom right */
          html[data-theme="deepspace"] .theme-planet { display: block; }
          html[data-theme="deepspace"] .planet-1 {
            width: 480px; height: 480px;
            right: -120px; bottom: 5%;
            background:
              radial-gradient(circle at 30% 25%, #93c5fd 0%, #3b82f6 25%, #1e40af 55%, #0a1d50 85%, #050d2e 100%);
            box-shadow:
              inset -100px -50px 150px rgba(0, 0, 0, 0.75),
              inset 60px 40px 80px rgba(147, 197, 253, 0.15),
              0 0 120px rgba(59, 130, 246, 0.3);
            animation: planetSpin 120s linear infinite;
          }
          /* Distant ringed (Saturn-like) planet upper right */
          html[data-theme="deepspace"] .planet-2 {
            width: 140px; height: 140px;
            top: 12%; right: 18%;
            background:
              radial-gradient(circle at 30% 30%, #fcd34d 0%, #f59e0b 40%, #b45309 75%, #5c2a08 100%);
            box-shadow:
              inset -30px -15px 40px rgba(0, 0, 0, 0.65),
              0 0 30px rgba(251, 191, 36, 0.4);
            animation: planetSpin 80s linear infinite reverse;
          }
          html[data-theme="deepspace"] .planet-2::after {
            content: '';
            position: absolute;
            width: 280%; height: 35%;
            top: 33%; left: -90%;
            border: 3px solid rgba(252, 211, 77, 0.5);
            border-radius: 50%;
            transform: rotateX(72deg);
            box-shadow: 0 0 15px rgba(252, 211, 77, 0.3);
          }
          /* Small far planet upper left */
          html[data-theme="deepspace"] .planet-3 {
            width: 70px; height: 70px;
            top: 25%; left: 12%;
            background: radial-gradient(circle at 30% 30%, #c4b5fd 0%, #7c3aed 50%, #2e1065 100%);
            box-shadow:
              inset -15px -8px 20px rgba(0, 0, 0, 0.6),
              0 0 20px rgba(139, 92, 246, 0.4);
            animation: planetSpin 60s linear infinite;
          }
          @keyframes deepStarsDrift {
            0%   { transform: translateX(0) rotate(0deg); }
            100% { transform: translateX(-100px) rotate(20deg); }
          }
          @keyframes cometStreak {
            0%   { transform: translate3d(-1500px, 0, 50px); }
            100% { transform: translate3d(1500px, 1500px, 50px); }
          }
          @keyframes planetSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          /* ====== 🌀 SPIRAL GALAXY (blue cyan vortex) — ref gambar 2 ====== */
          html[data-theme="spiral"] body {
            background: radial-gradient(ellipse at center, #0a1d4d 0%, #050a25 60%, #000 100%) !important;
          }
          html[data-theme="spiral"] body::before {
            background-image:
              radial-gradient(ellipse 1200px 800px at 50% 50%, rgba(34, 211, 238, 0.25) 0%, rgba(59, 130, 246, 0.15) 35%, transparent 65%);
          }
          html[data-theme="spiral"] body::after {
            background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.9), rgba(96, 165, 250, 0.9), transparent);
            box-shadow: 0 0 30px rgba(34, 211, 238, 0.7);
            height: 2px;
          }
          /* Spiral arms */
          html[data-theme="spiral"] .theme-fx-layer.fx-back {
            background-image:
              conic-gradient(from 0deg at 50% 50%,
                transparent 0deg,
                rgba(34, 211, 238, 0.18) 30deg,
                transparent 60deg,
                rgba(96, 165, 250, 0.15) 130deg,
                transparent 180deg,
                rgba(34, 211, 238, 0.18) 230deg,
                transparent 280deg,
                rgba(96, 165, 250, 0.15) 320deg,
                transparent 360deg);
            animation: spiralRotate 80s linear infinite;
          }
          /* Sparkles */
          html[data-theme="spiral"] .theme-fx-layer.fx-mid {
            background-image:
              radial-gradient(2px 2px at 20% 30%, rgba(165, 243, 252, 0.9), transparent),
              radial-gradient(2px 2px at 70% 60%, rgba(255, 255, 255, 0.9), transparent),
              radial-gradient(1.5px 1.5px at 45% 75%, rgba(147, 197, 253, 0.8), transparent),
              radial-gradient(2.5px 2.5px at 85% 20%, rgba(255, 255, 255, 1), transparent),
              radial-gradient(1px 1px at 30% 85%, rgba(165, 243, 252, 0.7), transparent),
              radial-gradient(2px 2px at 60% 15%, rgba(255, 255, 255, 0.9), transparent),
              radial-gradient(1.5px 1.5px at 90% 80%, rgba(96, 165, 250, 0.8), transparent);
            background-size: 200px 200px, 250px 250px, 280px 280px, 320px 320px, 220px 220px, 260px 260px, 300px 300px;
            animation: sparkleTwinkle 5s ease-in-out infinite, spiralCounterRotate 60s linear infinite;
          }
          /* Sparkle particles closer */
          html[data-theme="spiral"] .theme-fx-layer.fx-front {
            background-image:
              radial-gradient(3px 3px at 50% 50%, white, transparent),
              radial-gradient(2px 2px at 25% 25%, rgba(165, 243, 252, 1), transparent),
              radial-gradient(2px 2px at 75% 75%, rgba(96, 165, 250, 1), transparent),
              radial-gradient(2.5px 2.5px at 60% 30%, white, transparent),
              radial-gradient(2px 2px at 30% 70%, rgba(165, 243, 252, 0.9), transparent);
            background-size: 100% 100%;
            animation: spiralWarp 6s linear infinite;
          }
          @keyframes spiralRotate {
            from { transform: rotate(0deg) translateZ(-300px); }
            to   { transform: rotate(360deg) translateZ(-300px); }
          }
          @keyframes spiralCounterRotate {
            from { transform: rotate(0deg) translateZ(-100px); }
            to   { transform: rotate(-360deg) translateZ(-100px); }
          }
          @keyframes sparkleTwinkle {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.5; }
          }
          @keyframes spiralWarp {
            0%   { transform: translateZ(-600px) scale(0.1); opacity: 0; }
            30%  { opacity: 1; }
            100% { transform: translateZ(300px) scale(2.5); opacity: 0; }
          }

          /* ====== ☀️ SOLAR SYSTEM (warm sunset planets) — ref gambar 3 ====== */
          html[data-theme="solar"] body {
            background: linear-gradient(180deg, #1a0a2e 0%, #2e1a08 30%, #4a2810 60%, #1a0a04 100%) !important;
          }
          html[data-theme="solar"] body::before {
            background-image:
              radial-gradient(ellipse 1500px 500px at 50% 80%, rgba(251, 146, 60, 0.35) 0%, rgba(234, 88, 12, 0.20) 30%, transparent 60%),
              radial-gradient(ellipse 800px 400px at 30% 30%, rgba(96, 165, 250, 0.15) 0%, transparent 60%);
          }
          html[data-theme="solar"] body::after {
            background: linear-gradient(90deg, transparent, #fb923c, #fbbf24, #fb923c, transparent);
            box-shadow: 0 0 30px rgba(251, 146, 60, 0.7), 0 0 50px rgba(251, 191, 36, 0.4);
            height: 2px;
          }
          html[data-theme="solar"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(1px 1px at 20% 20%, rgba(255, 237, 213, 0.7), transparent),
              radial-gradient(1px 1px at 50% 30%, rgba(255, 255, 255, 0.6), transparent),
              radial-gradient(1.5px 1.5px at 75% 15%, rgba(254, 243, 199, 0.8), transparent),
              radial-gradient(1px 1px at 35% 60%, rgba(255, 255, 255, 0.5), transparent);
            background-size: 280px 280px, 320px 320px, 380px 380px, 250px 250px;
            animation: solarStarsDrift 80s linear infinite;
          }
          html[data-theme="solar"] .theme-planet { display: block; }
          /* Big planet center-right (Earth-like with atmosphere) */
          html[data-theme="solar"] .planet-1 {
            width: 350px; height: 350px;
            right: 8%; top: 25%;
            background: radial-gradient(circle at 32% 28%, #93c5fd 0%, #3b82f6 30%, #1e3a8a 65%, #0c1f5e 95%);
            box-shadow:
              inset -75px -40px 110px rgba(0, 0, 0, 0.7),
              inset 50px 30px 60px rgba(147, 197, 253, 0.2),
              0 0 80px rgba(96, 165, 250, 0.35);
            animation: planetSpin 100s linear infinite;
          }
          /* Big ringed planet left */
          html[data-theme="solar"] .planet-2 {
            width: 220px; height: 220px;
            left: 5%; top: 35%;
            background: radial-gradient(circle at 30% 30%, #fde68a 0%, #f59e0b 40%, #92400e 80%, #451a03 100%);
            box-shadow:
              inset -50px -25px 70px rgba(0, 0, 0, 0.7),
              0 0 60px rgba(251, 191, 36, 0.4);
            animation: planetSpin 90s linear infinite reverse;
          }
          html[data-theme="solar"] .planet-2::after {
            content: '';
            position: absolute;
            width: 280%; height: 38%;
            top: 32%; left: -90%;
            border: 4px solid rgba(254, 215, 170, 0.55);
            border-radius: 50%;
            transform: rotateX(70deg) rotate(-15deg);
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
          }
          /* Small middle planet */
          html[data-theme="solar"] .planet-3 {
            width: 100px; height: 100px;
            top: 20%; left: 40%;
            background: radial-gradient(circle at 30% 30%, #fca5a5 0%, #ef4444 50%, #7f1d1d 100%);
            box-shadow:
              inset -22px -12px 30px rgba(0, 0, 0, 0.65),
              0 0 25px rgba(239, 68, 68, 0.5);
            animation: planetSpin 70s linear infinite;
          }
          @keyframes solarStarsDrift {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-80px); }
          }

          /* ====== 🔥 MARS APOCALYPSE (red apocalyptic) — ref gambar 4 ====== */
          html[data-theme="mars"] body {
            background: linear-gradient(180deg, #1a0808 0%, #4a0a08 30%, #2a0404 70%, #0a0202 100%) !important;
          }
          html[data-theme="mars"] body::before {
            background-image:
              radial-gradient(ellipse 1200px 600px at 60% 40%, rgba(220, 38, 38, 0.30) 0%, rgba(127, 29, 29, 0.18) 35%, transparent 65%),
              radial-gradient(ellipse 800px 400px at 25% 70%, rgba(245, 158, 11, 0.18) 0%, transparent 60%);
          }
          html[data-theme="mars"] body::after {
            background: linear-gradient(90deg, transparent, #dc2626, #f59e0b, #dc2626, transparent);
            box-shadow: 0 0 35px rgba(220, 38, 38, 0.8), 0 0 60px rgba(245, 158, 11, 0.4);
            height: 3px;
          }
          /* Embers/sparks rising */
          html[data-theme="mars"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(2px 2px at 15% 90%, rgba(251, 146, 60, 0.7), transparent),
              radial-gradient(1.5px 1.5px at 35% 80%, rgba(220, 38, 38, 0.6), transparent),
              radial-gradient(2px 2px at 55% 95%, rgba(251, 191, 36, 0.7), transparent),
              radial-gradient(1px 1px at 75% 85%, rgba(252, 165, 165, 0.6), transparent),
              radial-gradient(1.5px 1.5px at 85% 75%, rgba(245, 158, 11, 0.7), transparent);
            background-size: 200px 200px, 250px 250px, 220px 220px, 180px 180px, 280px 280px;
            animation: emberRise 12s linear infinite;
          }
          /* Heat distortion overlay */
          html[data-theme="mars"] .theme-fx-layer.fx-mid {
            background-image:
              repeating-linear-gradient(0deg,
                rgba(220, 38, 38, 0.04) 0px,
                rgba(220, 38, 38, 0.04) 1px,
                transparent 2px,
                transparent 4px);
            animation: heatHaze 6s ease-in-out infinite;
          }
          html[data-theme="mars"] .theme-planet { display: block; }
          /* Big red Mars planet */
          html[data-theme="mars"] .planet-1 {
            width: 450px; height: 450px;
            right: -80px; top: 15%;
            background:
              radial-gradient(circle at 30% 25%, #fca5a5 0%, #dc2626 25%, #7f1d1d 60%, #3f0a0a 90%);
            box-shadow:
              inset -90px -45px 130px rgba(0, 0, 0, 0.75),
              inset 50px 30px 70px rgba(254, 202, 202, 0.15),
              0 0 100px rgba(220, 38, 38, 0.5);
            animation: planetSpin 120s linear infinite;
          }
          /* Mars ring debris */
          html[data-theme="mars"] .planet-1::after {
            content: '';
            position: absolute;
            width: 200%; height: 40%;
            top: 30%; left: -50%;
            border: 2px dashed rgba(245, 158, 11, 0.3);
            border-radius: 50%;
            transform: rotateX(78deg) rotate(20deg);
          }
          /* Distant moon */
          html[data-theme="mars"] .planet-2 {
            width: 80px; height: 80px;
            top: 18%; left: 18%;
            background: radial-gradient(circle at 30% 30%, #d1d5db 0%, #6b7280 50%, #1f2937 100%);
            box-shadow: inset -18px -10px 25px rgba(0, 0, 0, 0.7);
            animation: planetSpin 50s linear infinite;
          }
          @keyframes emberRise {
            0%   { transform: translateY(0) translateZ(50px); opacity: 1; }
            100% { transform: translateY(-300px) translateZ(50px); opacity: 0; }
          }
          @keyframes heatHaze {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(2px); }
          }

          /* ============================================================
             3 DARK GALAXY THEMES — Black Hole, Wormhole, Supernova
             ============================================================ */

          /* ====== ⚫ BLACK HOLE — accretion disk + Einstein ring ====== */
          html[data-theme="blackhole"] body {
            background: radial-gradient(ellipse at center, #1a0008 0%, #050000 50%, #000 100%) !important;
          }
          html[data-theme="blackhole"] body::before {
            background-image:
              radial-gradient(circle at 50% 50%, transparent 25%, rgba(0, 0, 0, 0.5) 35%, transparent 50%);
          }
          html[data-theme="blackhole"] body::after {
            background: linear-gradient(90deg, transparent, rgba(251, 146, 60, 0.7), rgba(220, 38, 38, 0.7), transparent);
            box-shadow: 0 0 30px rgba(251, 146, 60, 0.5);
            height: 2px;
          }
          /* Stars getting pulled inward (gravitational lensing effect) */
          html[data-theme="blackhole"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(1px 1px at 10% 15%, white, transparent),
              radial-gradient(1px 1px at 25% 60%, white, transparent),
              radial-gradient(1px 1px at 45% 25%, rgba(252, 211, 77, 0.7), transparent),
              radial-gradient(1px 1px at 65% 75%, white, transparent),
              radial-gradient(1.5px 1.5px at 85% 30%, rgba(254, 215, 170, 0.8), transparent),
              radial-gradient(1px 1px at 90% 80%, white, transparent),
              radial-gradient(1.5px 1.5px at 18% 85%, rgba(252, 165, 165, 0.7), transparent);
            background-size: 250px 250px, 320px 320px, 280px 280px, 350px 350px, 300px 300px, 270px 270px, 380px 380px;
            animation: blackHoleStarsDrift 90s linear infinite;
          }
          /* Light bending around black hole (gravitational distortion) */
          html[data-theme="blackhole"] .theme-fx-layer.fx-mid {
            background-image:
              radial-gradient(circle at 50% 50%,
                transparent 0%,
                transparent 12%,
                rgba(251, 146, 60, 0.20) 14%,
                transparent 18%,
                rgba(220, 38, 38, 0.18) 20%,
                transparent 24%,
                rgba(251, 191, 36, 0.15) 28%,
                transparent 35%);
            animation: blackHoleLensing 8s ease-in-out infinite;
          }
          html[data-theme="blackhole"] .theme-planet { display: block; }
          /* Black void center with Einstein ring (light bending) */
          html[data-theme="blackhole"] .planet-1 {
            width: 280px; height: 280px;
            top: 50%; left: 50%;
            margin: -140px 0 0 -140px;
            background: radial-gradient(circle at 50% 50%, #000 60%, rgba(20, 0, 0, 0.95) 75%, transparent 100%);
            border-radius: 50%;
            box-shadow:
              0 0 0 4px rgba(251, 191, 36, 0.7),
              0 0 50px 20px rgba(251, 146, 60, 0.6),
              0 0 100px 40px rgba(220, 38, 38, 0.4),
              0 0 200px 80px rgba(127, 29, 29, 0.3),
              inset 0 0 60px rgba(251, 191, 36, 0.5);
            animation: blackHolePulse 4s ease-in-out infinite;
          }
          /* Accretion disk — flat ring around black hole */
          html[data-theme="blackhole"] .planet-2 {
            width: 800px; height: 250px;
            top: 50%; left: 50%;
            margin: -125px 0 0 -400px;
            background:
              radial-gradient(ellipse at center,
                transparent 30%,
                rgba(252, 211, 77, 0.2) 32%,
                rgba(251, 146, 60, 0.6) 38%,
                rgba(220, 38, 38, 0.55) 45%,
                rgba(127, 29, 29, 0.4) 55%,
                transparent 75%);
            border-radius: 50%;
            transform: rotateX(72deg) rotateZ(0deg);
            animation: accretionSpin 6s linear infinite;
            filter: blur(2px);
          }
          /* Secondary disk (perpendicular angle) for 3D depth */
          html[data-theme="blackhole"] .planet-3 {
            width: 700px; height: 220px;
            top: 50%; left: 50%;
            margin: -110px 0 0 -350px;
            background:
              radial-gradient(ellipse at center,
                transparent 32%,
                rgba(251, 191, 36, 0.5) 38%,
                rgba(220, 38, 38, 0.4) 50%,
                transparent 70%);
            border-radius: 50%;
            transform: rotateX(78deg) rotateZ(20deg);
            animation: accretionSpin 8s linear infinite reverse;
            opacity: 0.7;
            filter: blur(3px);
          }
          @keyframes blackHoleStarsDrift {
            0%   { transform: scale(1) rotate(0deg); }
            100% { transform: scale(0.95) rotate(15deg); }
          }
          @keyframes blackHoleLensing {
            0%, 100% { transform: scale(1) translateZ(50px); }
            50%      { transform: scale(1.05) translateZ(50px); }
          }
          @keyframes blackHolePulse {
            0%, 100% {
              box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.7), 0 0 50px 20px rgba(251, 146, 60, 0.6), 0 0 100px 40px rgba(220, 38, 38, 0.4), 0 0 200px 80px rgba(127, 29, 29, 0.3), inset 0 0 60px rgba(251, 191, 36, 0.5);
            }
            50% {
              box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.9), 0 0 70px 30px rgba(251, 146, 60, 0.8), 0 0 130px 50px rgba(220, 38, 38, 0.5), 0 0 250px 100px rgba(127, 29, 29, 0.4), inset 0 0 80px rgba(251, 191, 36, 0.7);
            }
          }
          @keyframes accretionSpin {
            from { transform: rotateX(72deg) rotateZ(0deg); }
            to   { transform: rotateX(72deg) rotateZ(360deg); }
          }

          /* ====== 🕳️ WORMHOLE — concentric rings tunnel zooming forward ====== */
          html[data-theme="wormhole"] body {
            background: radial-gradient(ellipse at center, #0a0220 0%, #050015 60%, #000 100%) !important;
          }
          html[data-theme="wormhole"] body::before {
            background-image:
              radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
          }
          html[data-theme="wormhole"] body::after {
            background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.9), rgba(34, 211, 238, 0.9), rgba(139, 92, 246, 0.9), transparent);
            box-shadow: 0 0 35px rgba(139, 92, 246, 0.7), 0 0 60px rgba(34, 211, 238, 0.5);
            height: 2px;
          }
          /* Stars streaking outward (warp speed lines) */
          html[data-theme="wormhole"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(2px 2px at 10% 50%, rgba(167, 139, 250, 0.9), transparent),
              radial-gradient(2px 2px at 90% 50%, rgba(96, 165, 250, 0.9), transparent),
              radial-gradient(2px 2px at 50% 10%, rgba(34, 211, 238, 0.9), transparent),
              radial-gradient(2px 2px at 50% 90%, rgba(167, 139, 250, 0.9), transparent),
              radial-gradient(1.5px 1.5px at 25% 25%, white, transparent),
              radial-gradient(1.5px 1.5px at 75% 75%, white, transparent),
              radial-gradient(1.5px 1.5px at 25% 75%, white, transparent),
              radial-gradient(1.5px 1.5px at 75% 25%, white, transparent);
            background-size: 100% 100%;
            animation: wormholeStarBurst 3s linear infinite;
          }
          /* Concentric rings tunnel (mid) */
          html[data-theme="wormhole"] .theme-fx-layer.fx-mid {
            background-image:
              radial-gradient(circle at 50% 50%, transparent 5%, rgba(139, 92, 246, 0.5) 6%, transparent 8%),
              radial-gradient(circle at 50% 50%, transparent 12%, rgba(99, 102, 241, 0.45) 13%, transparent 15%),
              radial-gradient(circle at 50% 50%, transparent 21%, rgba(59, 130, 246, 0.4) 22%, transparent 24%),
              radial-gradient(circle at 50% 50%, transparent 32%, rgba(34, 211, 238, 0.35) 33%, transparent 35%),
              radial-gradient(circle at 50% 50%, transparent 45%, rgba(167, 139, 250, 0.3) 46%, transparent 48%),
              radial-gradient(circle at 50% 50%, transparent 60%, rgba(139, 92, 246, 0.25) 61%, transparent 63%);
            animation: wormholeTunnel 4s linear infinite;
          }
          /* Outer rings expanding (front layer) */
          html[data-theme="wormhole"] .theme-fx-layer.fx-front {
            background-image:
              radial-gradient(circle at 50% 50%, transparent 8%, rgba(34, 211, 238, 0.6) 10%, transparent 13%),
              radial-gradient(circle at 50% 50%, transparent 25%, rgba(139, 92, 246, 0.5) 27%, transparent 30%),
              radial-gradient(circle at 50% 50%, transparent 50%, rgba(167, 139, 250, 0.4) 52%, transparent 55%);
            animation: wormholeTunnelFront 4s linear infinite;
          }
          html[data-theme="wormhole"] .theme-planet { display: block; }
          /* Bright light at tunnel center */
          html[data-theme="wormhole"] .planet-1 {
            width: 100px; height: 100px;
            top: 50%; left: 50%;
            margin: -50px 0 0 -50px;
            background: radial-gradient(circle at 50% 50%, white 0%, rgba(167, 139, 250, 0.8) 40%, transparent 70%);
            border-radius: 50%;
            box-shadow:
              0 0 60px 30px rgba(167, 139, 250, 0.6),
              0 0 120px 60px rgba(139, 92, 246, 0.4);
            animation: wormholeCorePulse 2s ease-in-out infinite;
          }
          @keyframes wormholeStarBurst {
            0%   { transform: scale(0.3) translateZ(-200px); opacity: 0; }
            30%  { opacity: 1; }
            100% { transform: scale(2.5) translateZ(300px); opacity: 0; }
          }
          @keyframes wormholeTunnel {
            0%   { transform: scale(0.3) translateZ(-300px); opacity: 0; }
            20%  { opacity: 1; }
            100% { transform: scale(3) translateZ(200px); opacity: 0; }
          }
          @keyframes wormholeTunnelFront {
            0%   { transform: scale(0.6) translateZ(-100px); opacity: 0; }
            30%  { opacity: 1; }
            100% { transform: scale(4) translateZ(400px); opacity: 0; }
          }
          @keyframes wormholeCorePulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50%      { transform: scale(1.4); opacity: 0.8; }
          }

          /* ====== 💥 SUPERNOVA — exploding star with shockwaves ====== */
          html[data-theme="supernova"] body {
            background: radial-gradient(ellipse at center, #1a0a0a 0%, #050505 60%, #000 100%) !important;
          }
          html[data-theme="supernova"] body::before {
            background-image:
              radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.20) 0%, transparent 35%);
          }
          html[data-theme="supernova"] body::after {
            background: linear-gradient(90deg, transparent, #fbbf24, #f97316, #ef4444, #fbbf24, transparent);
            box-shadow: 0 0 35px rgba(251, 191, 36, 0.8), 0 0 60px rgba(239, 68, 68, 0.5);
            height: 3px;
          }
          /* Distant stars */
          html[data-theme="supernova"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(1px 1px at 10% 10%, white, transparent),
              radial-gradient(1px 1px at 30% 80%, white, transparent),
              radial-gradient(1px 1px at 60% 30%, rgba(254, 240, 138, 0.7), transparent),
              radial-gradient(1px 1px at 85% 65%, white, transparent),
              radial-gradient(1.5px 1.5px at 20% 50%, rgba(252, 211, 77, 0.8), transparent),
              radial-gradient(1.5px 1.5px at 75% 15%, white, transparent);
            background-size: 280px 280px, 320px 320px, 250px 250px, 350px 350px, 300px 300px, 380px 380px;
            animation: supernovaStarsDrift 80s linear infinite;
          }
          /* Shockwave rings expanding outward */
          html[data-theme="supernova"] .theme-fx-layer.fx-mid {
            background-image:
              radial-gradient(circle at 50% 50%, transparent 5%, rgba(251, 191, 36, 0.6) 6%, transparent 9%),
              radial-gradient(circle at 50% 50%, transparent 18%, rgba(249, 115, 22, 0.5) 19%, transparent 22%),
              radial-gradient(circle at 50% 50%, transparent 35%, rgba(239, 68, 68, 0.4) 36%, transparent 39%);
            animation: supernovaShockwave 3s ease-out infinite;
          }
          /* Debris particles flying outward */
          html[data-theme="supernova"] .theme-fx-layer.fx-front {
            background-image:
              radial-gradient(2px 2px at 50% 50%, rgba(254, 240, 138, 1), transparent),
              radial-gradient(2.5px 2.5px at 30% 30%, rgba(251, 146, 60, 1), transparent),
              radial-gradient(2px 2px at 70% 70%, rgba(252, 211, 77, 1), transparent),
              radial-gradient(2px 2px at 25% 70%, rgba(239, 68, 68, 0.9), transparent),
              radial-gradient(2.5px 2.5px at 75% 25%, rgba(254, 215, 170, 1), transparent),
              radial-gradient(3px 3px at 50% 30%, rgba(251, 191, 36, 1), transparent),
              radial-gradient(2px 2px at 50% 70%, rgba(248, 113, 113, 0.9), transparent);
            background-size: 100% 100%;
            animation: supernovaDebris 2.5s linear infinite;
          }
          html[data-theme="supernova"] .theme-planet { display: block; }
          /* Bright explosion core */
          html[data-theme="supernova"] .planet-1 {
            width: 160px; height: 160px;
            top: 50%; left: 50%;
            margin: -80px 0 0 -80px;
            background:
              radial-gradient(circle at 50% 50%,
                white 0%,
                rgba(254, 240, 138, 0.95) 25%,
                rgba(251, 191, 36, 0.85) 45%,
                rgba(249, 115, 22, 0.6) 70%,
                transparent 100%);
            border-radius: 50%;
            box-shadow:
              0 0 80px 40px rgba(254, 240, 138, 0.7),
              0 0 150px 75px rgba(251, 191, 36, 0.5),
              0 0 250px 130px rgba(249, 115, 22, 0.4),
              0 0 400px 200px rgba(239, 68, 68, 0.25);
            animation: supernovaCorePulse 1.5s ease-in-out infinite;
          }
          /* Halo bright glow */
          html[data-theme="supernova"] .planet-2 {
            width: 400px; height: 400px;
            top: 50%; left: 50%;
            margin: -200px 0 0 -200px;
            background: radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.3) 0%, rgba(249, 115, 22, 0.2) 40%, transparent 70%);
            border-radius: 50%;
            animation: supernovaHalo 2s ease-in-out infinite;
            filter: blur(8px);
          }
          @keyframes supernovaStarsDrift {
            0%   { transform: scale(1); }
            100% { transform: scale(1.05); }
          }
          @keyframes supernovaShockwave {
            0%   { transform: scale(0.1); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
          }
          @keyframes supernovaDebris {
            0%   { transform: scale(0.2) translateZ(-200px); opacity: 0; }
            20%  { opacity: 1; }
            100% { transform: scale(2.8) translateZ(300px); opacity: 0; }
          }
          @keyframes supernovaCorePulse {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50%      { transform: scale(1.15); filter: brightness(1.3); }
          }
          @keyframes supernovaHalo {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50%      { opacity: 1; transform: scale(1.2); }
          }

          /* ============================================================
             2 EDGE-FILLING THEMES — Meteor Shower, Galaxy Collision
             Cover full viewport (sudut, sidebar, header) bukan cuma center
             ============================================================ */

          /* ====== 🌠 METEOR SHOWER (bintang jatuh diagonal) ====== */
          html[data-theme="meteor"] body {
            background: linear-gradient(180deg, #1a0a3e 0%, #0d0529 40%, #050218 70%, #000 100%) !important;
          }
          html[data-theme="meteor"] body::before {
            background-image:
              radial-gradient(ellipse 1500px 600px at 50% 30%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 1200px 400px at 30% 70%, rgba(167, 139, 250, 0.10) 0%, transparent 60%);
          }
          html[data-theme="meteor"] body::after {
            background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.85), rgba(254, 240, 138, 0.85), rgba(167, 139, 250, 0.85), transparent);
            box-shadow: 0 0 30px rgba(167, 139, 250, 0.6), 0 0 50px rgba(254, 240, 138, 0.4);
            height: 2px;
          }
          /* Far meteors (small, slow, dim) — covers edges & corners */
          html[data-theme="meteor"] .theme-fx-layer.fx-back {
            background-image:
              /* Star field */
              radial-gradient(1px 1px at 8% 12%, white, transparent),
              radial-gradient(1px 1px at 22% 35%, white, transparent),
              radial-gradient(1px 1px at 45% 18%, rgba(254, 240, 138, 0.7), transparent),
              radial-gradient(1px 1px at 68% 65%, white, transparent),
              radial-gradient(1px 1px at 88% 25%, white, transparent),
              radial-gradient(1.5px 1.5px at 18% 78%, rgba(252, 165, 165, 0.7), transparent),
              radial-gradient(1.5px 1.5px at 75% 88%, rgba(147, 197, 253, 0.7), transparent),
              /* Far meteor streaks (tile pattern) */
              linear-gradient(135deg, transparent 35%, rgba(255, 255, 255, 0.4) 50%, transparent 65%);
            background-size: 250px 250px, 320px 320px, 280px 280px, 350px 350px, 290px 290px, 330px 330px, 370px 370px, 200px 200px;
            animation: meteorFar 8s linear infinite, twinkleStarsMeteor 4s ease-in-out infinite;
          }
          /* Mid meteors (medium speed, brighter) */
          html[data-theme="meteor"] .theme-fx-layer.fx-mid {
            background-image:
              linear-gradient(135deg, transparent 38%, rgba(255, 255, 255, 0.55) 47%, rgba(255, 237, 213, 0.85) 50%, rgba(255, 255, 255, 0.55) 53%, transparent 62%);
            background-size: 350px 350px;
            background-repeat: repeat;
            animation: meteorMid 5s linear infinite;
            opacity: 0.85;
          }
          /* Close meteors (big, fast, very bright, depth=200px forward) */
          html[data-theme="meteor"] .theme-fx-layer.fx-front {
            background-image:
              linear-gradient(135deg,
                transparent 36%,
                rgba(254, 240, 138, 0.6) 44%,
                rgba(255, 255, 255, 0.95) 48%,
                rgba(255, 237, 213, 1) 50%,
                rgba(255, 255, 255, 0.95) 52%,
                rgba(254, 240, 138, 0.6) 56%,
                transparent 64%);
            background-size: 500px 500px;
            background-repeat: repeat;
            animation: meteorClose 3s linear infinite;
            opacity: 0.9;
          }
          html[data-theme="meteor"] .theme-planet { display: block; }
          /* Crescent moon at top-left (decorative, non-animated) */
          html[data-theme="meteor"] .planet-1 {
            width: 110px; height: 110px;
            top: 8%; left: 6%;
            background:
              radial-gradient(circle at 40% 35%, #fef3c7 0%, #f3e8ff 30%, #c4b5fd 60%, #4c1d95 100%);
            box-shadow:
              inset -25px -10px 35px rgba(0, 0, 0, 0.5),
              inset 15px 8px 20px rgba(254, 243, 199, 0.4),
              0 0 40px rgba(196, 181, 253, 0.5);
            animation: planetSpin 200s linear infinite;
          }
          @keyframes meteorFar {
            from { background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0; }
            to   { background-position: -100px 100px, -100px 100px, -100px 100px, -100px 100px, -100px 100px, -100px 100px, -100px 100px, -300px 300px; }
          }
          @keyframes meteorMid {
            from { background-position: 0 0; }
            to   { background-position: -700px 700px; }
          }
          @keyframes meteorClose {
            from { background-position: 0 0; }
            to   { background-position: -1200px 1200px; }
          }
          @keyframes twinkleStarsMeteor {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.7; }
          }

          /* ====== 💫 GALAXY COLLISION (2 spiral galaksi tabrakan) ====== */
          html[data-theme="collision"] body {
            background: radial-gradient(ellipse at center, #1a0a2e 0%, #0a0420 60%, #000 100%) !important;
          }
          html[data-theme="collision"] body::before {
            background-image:
              radial-gradient(ellipse 800px 400px at 20% 50%, rgba(34, 211, 238, 0.15) 0%, transparent 60%),
              radial-gradient(ellipse 800px 400px at 80% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 60%),
              radial-gradient(ellipse 600px 300px at 50% 50%, rgba(254, 240, 138, 0.20) 0%, transparent 60%);
          }
          html[data-theme="collision"] body::after {
            background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.9), rgba(254, 240, 138, 0.9), rgba(236, 72, 153, 0.9), transparent);
            box-shadow: 0 0 30px rgba(254, 240, 138, 0.7), 0 0 60px rgba(236, 72, 153, 0.5);
            height: 3px;
          }
          /* Background stars covering edges/corners */
          html[data-theme="collision"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(1px 1px at 5% 8%, white, transparent),
              radial-gradient(1px 1px at 15% 28%, white, transparent),
              radial-gradient(1px 1px at 28% 50%, rgba(254, 240, 138, 0.7), transparent),
              radial-gradient(1px 1px at 42% 78%, white, transparent),
              radial-gradient(1px 1px at 58% 22%, rgba(252, 165, 165, 0.7), transparent),
              radial-gradient(1px 1px at 72% 65%, white, transparent),
              radial-gradient(1px 1px at 85% 35%, rgba(147, 197, 253, 0.7), transparent),
              radial-gradient(1.5px 1.5px at 92% 88%, white, transparent),
              radial-gradient(1px 1px at 8% 92%, rgba(254, 215, 170, 0.7), transparent);
            background-size: 240px 240px, 290px 290px, 320px 320px, 280px 280px, 360px 360px, 310px 310px, 270px 270px, 380px 380px, 330px 330px;
            animation: collisionStarsDrift 80s linear infinite;
          }
          /* Energy beams streaming from collision point (edge to edge) */
          html[data-theme="collision"] .theme-fx-layer.fx-mid {
            background-image:
              linear-gradient(0deg, transparent 47%, rgba(254, 240, 138, 0.25) 49%, rgba(255, 255, 255, 0.4) 50%, rgba(254, 240, 138, 0.25) 51%, transparent 53%),
              linear-gradient(45deg, transparent 47%, rgba(34, 211, 238, 0.20) 49%, rgba(255, 255, 255, 0.35) 50%, rgba(34, 211, 238, 0.20) 51%, transparent 53%),
              linear-gradient(135deg, transparent 47%, rgba(236, 72, 153, 0.20) 49%, rgba(255, 255, 255, 0.35) 50%, rgba(236, 72, 153, 0.20) 51%, transparent 53%),
              linear-gradient(90deg, transparent 47%, rgba(254, 240, 138, 0.30) 49%, rgba(255, 255, 255, 0.45) 50%, rgba(254, 240, 138, 0.30) 51%, transparent 53%);
            animation: collisionBeams 8s ease-in-out infinite;
            opacity: 0.6;
          }
          /* Debris flying outward across full viewport */
          html[data-theme="collision"] .theme-fx-layer.fx-front {
            background-image:
              radial-gradient(2px 2px at 30% 40%, rgba(254, 240, 138, 1), transparent),
              radial-gradient(2px 2px at 70% 60%, rgba(236, 72, 153, 1), transparent),
              radial-gradient(2px 2px at 25% 70%, rgba(34, 211, 238, 1), transparent),
              radial-gradient(2.5px 2.5px at 75% 30%, rgba(255, 255, 255, 1), transparent),
              radial-gradient(2px 2px at 50% 50%, rgba(254, 240, 138, 1), transparent),
              radial-gradient(2px 2px at 15% 25%, rgba(167, 139, 250, 0.9), transparent),
              radial-gradient(2.5px 2.5px at 85% 75%, rgba(252, 165, 165, 1), transparent);
            background-size: 100% 100%;
            animation: collisionDebris 5s linear infinite;
          }
          html[data-theme="collision"] .theme-planet { display: block; }
          /* LEFT galaxy (blue/cyan spiral) — covers left edge */
          html[data-theme="collision"] .planet-1 {
            width: 600px; height: 600px;
            left: -150px; top: 50%;
            margin-top: -300px;
            background: conic-gradient(from 0deg at 50% 50%,
              transparent 0deg,
              rgba(34, 211, 238, 0.45) 30deg,
              transparent 80deg,
              rgba(96, 165, 250, 0.40) 130deg,
              transparent 200deg,
              rgba(34, 211, 238, 0.45) 250deg,
              transparent 320deg);
            border-radius: 50%;
            filter: blur(15px);
            animation: galaxySpinLeft 30s linear infinite;
            box-shadow: 0 0 100px rgba(34, 211, 238, 0.4);
          }
          /* RIGHT galaxy (purple/pink spiral) — covers right edge */
          html[data-theme="collision"] .planet-2 {
            width: 550px; height: 550px;
            right: -130px; top: 50%;
            margin-top: -275px;
            background: conic-gradient(from 0deg at 50% 50%,
              transparent 0deg,
              rgba(168, 85, 247, 0.45) 30deg,
              transparent 80deg,
              rgba(236, 72, 153, 0.40) 130deg,
              transparent 200deg,
              rgba(168, 85, 247, 0.45) 250deg,
              transparent 320deg);
            border-radius: 50%;
            filter: blur(15px);
            animation: galaxySpinRight 35s linear infinite reverse;
            box-shadow: 0 0 100px rgba(236, 72, 153, 0.4);
          }
          /* COLLISION POINT (bright energy ball at center) */
          html[data-theme="collision"] .planet-3 {
            width: 240px; height: 240px;
            top: 50%; left: 50%;
            margin: -120px 0 0 -120px;
            background: radial-gradient(circle at 50% 50%,
              white 0%,
              rgba(254, 240, 138, 0.9) 25%,
              rgba(251, 146, 60, 0.6) 50%,
              transparent 80%);
            border-radius: 50%;
            box-shadow:
              0 0 80px 30px rgba(254, 240, 138, 0.7),
              0 0 160px 70px rgba(251, 146, 60, 0.4),
              0 0 300px 140px rgba(220, 38, 38, 0.25);
            animation: collisionCorePulse 1.8s ease-in-out infinite;
            filter: blur(2px);
          }
          @keyframes collisionStarsDrift {
            0%   { transform: scale(1); }
            50%  { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes collisionBeams {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50%      { opacity: 0.7; transform: scale(1.05); }
          }
          @keyframes collisionDebris {
            0%   { transform: scale(0.3) translateZ(-200px); opacity: 0; }
            20%  { opacity: 1; }
            100% { transform: scale(2.5) translateZ(300px); opacity: 0; }
          }
          @keyframes galaxySpinLeft {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes galaxySpinRight {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes collisionCorePulse {
            0%, 100% { transform: scale(1); filter: blur(2px) brightness(1); }
            50%      { transform: scale(1.2); filter: blur(2px) brightness(1.3); }
          }

          /* ============================================================
             4 CINEMATIC 3D HD THEMES — supernova/binary-star/blackhole-anime/galactic-nebula
             Pakai .particle-layer + .jets divs (separate dari .theme-fx system)
             FIX: height: 100vh override global body::after height: 2px
             ============================================================ */

          /* ============ TEMA 1: SUPERNOVA CINEMATIC ============ */
          [data-theme="supernova-cinematic"] body {
            background: radial-gradient(ellipse at 75% 50%, #1a0808 0%, #0a0405 50%, #000000 100%) !important;
            color: #ffd9b3;
            position: relative;
            overflow-x: hidden;
          }
          [data-theme="supernova-cinematic"] body::before {
            content: '';
            position: fixed;
            top: -50%; right: -30%;
            width: 1200px; height: 1200px;
            background: radial-gradient(circle at center,
              rgba(255,245,224,0.9) 0%,
              rgba(255,209,102,0.5) 8%,
              rgba(255,107,61,0.3) 25%,
              rgba(163,45,45,0.15) 50%,
              transparent 70%);
            filter: blur(2px);
            animation: supernovaBreath 8s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
            background-image: radial-gradient(circle at center,
              rgba(255,245,224,0.9) 0%,
              rgba(255,209,102,0.5) 8%,
              rgba(255,107,61,0.3) 25%,
              rgba(163,45,45,0.15) 50%,
              transparent 70%);
          }
          [data-theme="supernova-cinematic"] body::after {
            content: '';
            position: fixed; inset: 0;
            height: 100vh; bottom: 0; z-index: 0;
            background-image:
              radial-gradient(2px 2px at 20% 30%, white, transparent),
              radial-gradient(1px 1px at 60% 70%, #ffd9b3, transparent),
              radial-gradient(1.5px 1.5px at 80% 10%, white, transparent),
              radial-gradient(1px 1px at 30% 80%, #ffe4cc, transparent),
              radial-gradient(2px 2px at 90% 60%, white, transparent),
              radial-gradient(1px 1px at 10% 50%, #ffd9b3, transparent);
            background-size: 600px 600px;
            box-shadow: none;
            animation: snStarsTwinkle 12s linear infinite;
            pointer-events: none;
            opacity: 0.7;
          }
          [data-theme="supernova-cinematic"] .particle-layer {
            position: fixed; inset: 0;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
          }
          [data-theme="supernova-cinematic"] .particle-layer::before,
          [data-theme="supernova-cinematic"] .particle-layer::after {
            content: '';
            position: absolute;
            top: 50%; right: 10%;
            width: 200px; height: 200px;
            border: 1px solid rgba(255,209,102,0.3);
            border-radius: 50%;
            animation: snShockwave 4s ease-out infinite;
          }
          [data-theme="supernova-cinematic"] .particle-layer::after {
            animation-delay: 2s;
            border-color: rgba(255,107,61,0.25);
          }
          [data-theme="supernova-cinematic"] .stat-card,
          [data-theme="supernova-cinematic"] .card {
            background: rgba(20,8,5,0.7);
            border: 1px solid rgba(255,107,61,0.3);
            border-radius: 8px;
            position: relative;
            overflow: hidden;
          }
          [data-theme="supernova-cinematic"] .stat-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 3px; height: 100%;
            background: linear-gradient(180deg, #ffd166, #ff6b3d);
            opacity: 0.7;
          }
          [data-theme="supernova-cinematic"] .stat-card .value,
          [data-theme="supernova-cinematic"] .stat-number {
            color: #ffd166;
            text-shadow: 0 0 20px rgba(255,209,102,0.4);
          }
          @keyframes supernovaBreath {
            0%,100% { transform: scale(1) rotate(0deg); opacity: 0.85; }
            50% { transform: scale(1.08) rotate(2deg); opacity: 1; }
          }
          @keyframes snStarsTwinkle {
            from { background-position: 0 0; }
            to { background-position: 600px 600px; }
          }
          @keyframes snShockwave {
            0% { transform: translate(50%,-50%) scale(0.3); opacity: 1; }
            100% { transform: translate(50%,-50%) scale(3); opacity: 0; }
          }

          /* ============ TEMA 2: BINARY STAR DANCE ============ */
          [data-theme="binary-star"] body {
            background: radial-gradient(ellipse at center, #0a1f1a 0%, #050f0d 50%, #000505 100%) !important;
            color: #9fe1cb;
            position: relative;
            overflow-x: hidden;
          }
          [data-theme="binary-star"] body::before {
            content: '';
            position: fixed; inset: 0;
            background-image:
              linear-gradient(rgba(93,202,165,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(93,202,165,0.08) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: bsGridScroll 20s linear infinite;
            pointer-events: none;
            z-index: 0;
          }
          [data-theme="binary-star"] body::after {
            content: '';
            position: fixed; inset: 0;
            height: 100vh; bottom: 0; z-index: 0;
            background-image:
              radial-gradient(1.5px 1.5px at 15% 20%, #5dcaa5, transparent),
              radial-gradient(1px 1px at 50% 60%, #85b7eb, transparent),
              radial-gradient(2px 2px at 80% 30%, #5dcaa5, transparent),
              radial-gradient(1.5px 1.5px at 70% 90%, #5dcaa5, transparent);
            background-size: 700px 700px;
            box-shadow: none;
            animation: bsStarsTwinkle 15s linear infinite;
            pointer-events: none;
            opacity: 0.6;
          }
          [data-theme="binary-star"] .particle-layer {
            position: fixed;
            top: 20%; right: 5%;
            width: 300px; height: 300px;
            pointer-events: none;
            z-index: 1;
            animation: bsOrbitRotate 20s linear infinite;
          }
          [data-theme="binary-star"] .particle-layer::before,
          [data-theme="binary-star"] .particle-layer::after {
            content: '';
            position: absolute;
            top: 50%;
            width: 60px; height: 60px;
            border-radius: 50%;
            filter: blur(8px);
          }
          [data-theme="binary-star"] .particle-layer::before {
            left: 20%;
            background: radial-gradient(circle, white 0%, #5dcaa5 40%, transparent 70%);
            animation: bsPulseStar 2s ease-in-out infinite;
          }
          [data-theme="binary-star"] .particle-layer::after {
            right: 20%;
            background: radial-gradient(circle, white 0%, #85b7eb 40%, transparent 70%);
            animation: bsPulseStar 2s ease-in-out infinite reverse;
          }
          [data-theme="binary-star"] .stat-card,
          [data-theme="binary-star"] .card {
            background: rgba(10,31,26,0.6);
            border: 1px solid #5dcaa5;
            border-radius: 6px;
            box-shadow: 0 0 20px rgba(93,202,165,0.2);
            position: relative;
            overflow: hidden;
          }
          [data-theme="binary-star"] .stat-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 3px; height: 100%;
            background: #5dcaa5;
            box-shadow: 0 0 15px #5dcaa5;
          }
          [data-theme="binary-star"] .stat-card .value,
          [data-theme="binary-star"] .stat-number {
            color: #5dcaa5;
            text-shadow: 0 0 15px #5dcaa5;
          }
          @keyframes bsGridScroll {
            from { background-position: 0 0; }
            to { background-position: 50px 50px; }
          }
          @keyframes bsStarsTwinkle {
            0% { background-position: 0 0; opacity: 0.4; }
            50% { opacity: 0.8; }
            100% { background-position: 700px 700px; opacity: 0.4; }
          }
          @keyframes bsOrbitRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes bsPulseStar {
            0%,100% { transform: translateY(-50%) scale(1); opacity: 0.8; }
            50% { transform: translateY(-50%) scale(1.3); opacity: 1; }
          }

          /* ============ TEMA 3: BLACK HOLE ANIME ============ */
          [data-theme="blackhole-anime"] body {
            background: radial-gradient(ellipse at 70% 50%, #1a1245 0%, #0a0625 40%, #020110 100%) !important;
            color: #cecbf6;
            position: relative;
            overflow-x: hidden;
          }
          [data-theme="blackhole-anime"] body::before {
            content: '';
            position: fixed; inset: 0;
            background-image:
              radial-gradient(2px 2px at 20% 25%, #cecbf6, transparent),
              radial-gradient(1px 1px at 60% 60%, #85b7eb, transparent),
              radial-gradient(2px 2px at 85% 20%, #cecbf6, transparent),
              radial-gradient(1.5px 1.5px at 30% 80%, #85b7eb, transparent),
              radial-gradient(1px 1px at 75% 75%, #cecbf6, transparent);
            background-size: 800px 800px;
            animation: bhStarsDrift 25s linear infinite;
            pointer-events: none;
            z-index: 0;
            opacity: 0.7;
          }
          [data-theme="blackhole-anime"] .particle-layer {
            position: fixed;
            top: 50%; right: -100px;
            transform: translateY(-50%);
            width: 600px; height: 600px;
            pointer-events: none;
            z-index: 1;
          }
          [data-theme="blackhole-anime"] .particle-layer::before {
            content: '';
            position: absolute; inset: 0;
            background: radial-gradient(ellipse 280px 80px at center,
              transparent 18%,
              #7f77dd 22%,
              #378add 35%,
              #7f77dd 50%,
              transparent 70%);
            filter: blur(3px);
            animation: bhDiskRotate 15s linear infinite;
            opacity: 0.85;
          }
          [data-theme="blackhole-anime"] .particle-layer::after {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 120px; height: 120px;
            background: radial-gradient(circle, #000 60%, transparent 65%);
            border: 2px solid #cecbf6;
            border-radius: 50%;
            transform: translate(-50%,-50%);
            box-shadow: 0 0 30px #7f77dd, inset 0 0 40px rgba(127,119,221,0.3);
          }
          [data-theme="blackhole-anime"] .jets {
            position: fixed;
            top: 0; right: 100px;
            width: 8px; height: 100vh;
            background: linear-gradient(180deg,
              transparent 0%,
              rgba(133,183,235,0.3) 30%,
              rgba(127,119,221,0.5) 50%,
              rgba(133,183,235,0.3) 70%,
              transparent 100%);
            filter: blur(4px);
            animation: bhJetPulse 4s ease-in-out infinite;
            pointer-events: none;
            z-index: 1;
          }
          [data-theme="blackhole-anime"] .stat-card,
          [data-theme="blackhole-anime"] .card {
            background: rgba(26,18,69,0.7);
            border: 1px solid rgba(127,119,221,0.4);
            border-radius: 10px;
            backdrop-filter: blur(8px);
            position: relative;
            overflow: hidden;
          }
          [data-theme="blackhole-anime"] .stat-card::before {
            content: '';
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: conic-gradient(from 0deg,
              transparent 0deg,
              rgba(127,119,221,0.15) 90deg,
              transparent 180deg,
              rgba(133,183,235,0.15) 270deg,
              transparent 360deg);
            animation: bhCardSwirl 8s linear infinite;
            opacity: 0.6;
          }
          [data-theme="blackhole-anime"] .stat-card > * { position: relative; z-index: 1; }
          [data-theme="blackhole-anime"] .stat-card .value,
          [data-theme="blackhole-anime"] .stat-number {
            color: #cecbf6;
            text-shadow: 0 0 25px rgba(127,119,221,0.6);
          }
          @keyframes bhStarsDrift {
            from { background-position: 0 0; }
            to { background-position: 800px 0; }
          }
          @keyframes bhDiskRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes bhJetPulse {
            0%,100% { opacity: 0.5; transform: scaleY(1); }
            50% { opacity: 0.9; transform: scaleY(1.1); }
          }
          @keyframes bhCardSwirl {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          /* ============ TEMA 4: GALACTIC NEBULA ============ */
          [data-theme="galactic-nebula"] body {
            background: radial-gradient(ellipse at 60% 40%, #1a0f25 0%, #0a0515 50%, #000005 100%) !important;
            color: #ffffff;
            position: relative;
            overflow-x: hidden;
          }
          [data-theme="galactic-nebula"] body::before {
            content: '';
            position: fixed; inset: 0;
            background:
              radial-gradient(ellipse 600px 400px at 75% 30%, rgba(237,147,177,0.25) 0%, transparent 60%),
              radial-gradient(ellipse 500px 350px at 85% 60%, rgba(133,183,235,0.22) 0%, transparent 60%),
              radial-gradient(ellipse 400px 300px at 70% 50%, rgba(250,199,117,0.18) 0%, transparent 60%);
            animation: gnNebulaDrift 20s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
            filter: blur(2px);
          }
          [data-theme="galactic-nebula"] body::after {
            content: '';
            position: fixed; inset: 0;
            height: 100vh; bottom: 0; z-index: 0;
            background-image:
              radial-gradient(1px 1px at 10% 20%, white, transparent),
              radial-gradient(1.5px 1.5px at 30% 50%, #f4c0d1, transparent),
              radial-gradient(1px 1px at 50% 80%, white, transparent),
              radial-gradient(2px 2px at 70% 30%, #b5d4f4, transparent),
              radial-gradient(1px 1px at 85% 70%, white, transparent);
            background-size: 900px 900px;
            box-shadow: none;
            animation: gnStarsTwinkle 18s linear infinite;
            pointer-events: none;
            opacity: 0.6;
          }
          [data-theme="galactic-nebula"] .particle-layer {
            position: fixed;
            top: 30%; right: 10%;
            width: 400px; height: 400px;
            pointer-events: none;
            z-index: 1;
          }
          [data-theme="galactic-nebula"] .particle-layer::before,
          [data-theme="galactic-nebula"] .particle-layer::after {
            content: '';
            position: absolute;
            width: 200px; height: 200px;
            border-radius: 50%;
            filter: blur(6px);
            animation: gnGalaxySpin 30s linear infinite;
          }
          [data-theme="galactic-nebula"] .particle-layer::before {
            top: 20%; left: 10%;
            background: radial-gradient(circle, white 0%, #ed93b1 8%, rgba(237,147,177,0.4) 20%, transparent 50%);
          }
          [data-theme="galactic-nebula"] .particle-layer::after {
            bottom: 15%; right: 5%;
            background: radial-gradient(circle, white 0%, #85b7eb 8%, rgba(133,183,235,0.4) 20%, transparent 50%);
            animation-direction: reverse;
          }
          [data-theme="galactic-nebula"] .stat-card,
          [data-theme="galactic-nebula"] .card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px) saturate(180%);
            position: relative;
            overflow: hidden;
          }
          [data-theme="galactic-nebula"] .stat-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          }
          [data-theme="galactic-nebula"] .stat-card .value,
          [data-theme="galactic-nebula"] .stat-number {
            color: #ffffff;
            font-weight: 500;
          }
          @keyframes gnNebulaDrift {
            0%,100% { transform: scale(1) translate(0,0); opacity: 0.85; }
            50% { transform: scale(1.05) translate(-20px,-10px); opacity: 1; }
          }
          @keyframes gnStarsTwinkle {
            0% { background-position: 0 0; opacity: 0.4; }
            50% { opacity: 0.7; }
            100% { background-position: 900px 900px; opacity: 0.4; }
          }
          @keyframes gnGalaxySpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          /* ============================================================
             4 COSMIC PHOTO HD THEMES — dari 4 reference image (NASA-style)
             Per-tema font berbeda biar match visual vibe
             ============================================================ */

          /* ============ 🔆 GALACTIC DUST EXPLOSION (cinematic supernova horizontal) ============ */
          [data-theme="dust-explosion"] body {
            background: radial-gradient(ellipse at 50% 50%, #2a0a05 0%, #0a0202 50%, #000 100%) !important;
            color: #ffd9b3 !important;
            font-family: 'Impact', 'Arial Black', 'Helvetica', sans-serif !important;
            letter-spacing: 0.03em;
            position: relative;
            overflow-x: hidden;
          }
          [data-theme="dust-explosion"] h1,
          [data-theme="dust-explosion"] h2,
          [data-theme="dust-explosion"] h3 {
            font-family: 'Impact', 'Arial Black', sans-serif !important;
            text-transform: uppercase !important;
            letter-spacing: 0.06em !important;
            text-shadow: 0 0 30px rgba(255, 209, 102, 0.6) !important;
          }
          [data-theme="dust-explosion"] body::before {
            content: '';
            position: fixed;
            top: 50%; left: 50%;
            width: 1800px; height: 600px;
            margin: -300px 0 0 -900px;
            background: radial-gradient(ellipse at center,
              rgba(255, 250, 230, 1) 0%,
              rgba(255, 209, 102, 0.85) 6%,
              rgba(255, 134, 51, 0.6) 18%,
              rgba(186, 51, 26, 0.4) 35%,
              rgba(82, 13, 13, 0.2) 55%,
              transparent 75%);
            filter: blur(8px);
            animation: dustBreath 7s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
          }
          [data-theme="dust-explosion"] body::after {
            content: '';
            position: fixed; inset: 0;
            height: 100vh; bottom: 0; z-index: 0;
            background-image:
              radial-gradient(1px 1px at 8% 15%, white, transparent),
              radial-gradient(1px 1px at 25% 60%, #ffd9b3, transparent),
              radial-gradient(1.5px 1.5px at 45% 25%, white, transparent),
              radial-gradient(1px 1px at 65% 75%, #ffe4cc, transparent),
              radial-gradient(2px 2px at 88% 30%, white, transparent),
              radial-gradient(1px 1px at 12% 80%, #ffd9b3, transparent),
              radial-gradient(1.5px 1.5px at 80% 88%, white, transparent);
            background-size: 250px 250px, 290px 290px, 320px 320px, 270px 270px, 350px 350px, 300px 300px, 380px 380px;
            box-shadow: none;
            animation: dustStarsTwinkle 14s linear infinite;
            pointer-events: none;
            opacity: 0.85;
          }
          [data-theme="dust-explosion"] .theme-planet { display: block !important; }
          [data-theme="dust-explosion"] .planet-1 {
            width: 350px; height: 200px;
            top: 50%; left: 50%;
            margin: -100px 0 0 -175px;
            background: radial-gradient(ellipse at center,
              white 0%, #fff5e0 15%, #ffd166 35%,
              rgba(255, 134, 51, 0.7) 55%, transparent 85%);
            border-radius: 50%;
            box-shadow:
              0 0 80px 30px rgba(255, 209, 102, 0.7),
              0 0 160px 70px rgba(255, 134, 51, 0.5),
              0 0 300px 120px rgba(186, 51, 26, 0.3);
            filter: blur(4px);
            animation: dustCorePulse 4s ease-in-out infinite;
          }
          [data-theme="dust-explosion"] .planet-2 {
            width: 700px; height: 100px;
            top: 50%; left: 50%;
            margin: -50px 0 0 0;
            background: linear-gradient(90deg,
              rgba(255, 209, 102, 0.6) 0%,
              rgba(255, 134, 51, 0.5) 20%,
              rgba(186, 51, 26, 0.3) 50%,
              transparent 100%);
            filter: blur(15px);
            border-radius: 50%;
            animation: dustStreakRight 8s ease-in-out infinite;
          }
          [data-theme="dust-explosion"] .planet-3 {
            width: 700px; height: 100px;
            top: 50%; right: 50%;
            margin: -50px 0 0 0;
            background: linear-gradient(270deg,
              rgba(255, 209, 102, 0.6) 0%,
              rgba(186, 51, 26, 0.3) 50%,
              transparent 100%);
            filter: blur(15px);
            border-radius: 50%;
            animation: dustStreakLeft 8s ease-in-out infinite;
          }
          [data-theme="dust-explosion"] .particle-layer {
            position: fixed; inset: 0;
            pointer-events: none; z-index: 1; overflow: hidden;
          }
          [data-theme="dust-explosion"] .particle-layer::before,
          [data-theme="dust-explosion"] .particle-layer::after {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 300px; height: 100px;
            margin: -50px 0 0 -150px;
            border: 2px solid rgba(255, 209, 102, 0.5);
            border-radius: 50%;
            animation: dustShockwave 5s ease-out infinite;
          }
          [data-theme="dust-explosion"] .particle-layer::after {
            border-color: rgba(255, 134, 51, 0.4);
            animation-delay: 2.5s;
          }
          @keyframes dustBreath {
            0%, 100% { transform: scale(1); opacity: 0.85; filter: blur(8px); }
            50%      { transform: scale(1.1); opacity: 1; filter: blur(6px); }
          }
          @keyframes dustStarsTwinkle {
            from { background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0; }
            to   { background-position: 250px 250px, 290px 290px, 320px 320px, 270px 270px, 350px 350px, 300px 300px, 380px 380px; }
          }
          @keyframes dustCorePulse {
            0%, 100% { transform: scale(1); filter: blur(4px) brightness(1); }
            50%      { transform: scale(1.15); filter: blur(3px) brightness(1.3); }
          }
          @keyframes dustStreakRight {
            0%, 100% { transform: translateX(0) scale(1); opacity: 0.7; }
            50%      { transform: translateX(50px) scale(1.1); opacity: 1; }
          }
          @keyframes dustStreakLeft {
            0%, 100% { transform: translateX(0) scale(1); opacity: 0.7; }
            50%      { transform: translateX(-50px) scale(1.1); opacity: 1; }
          }
          @keyframes dustShockwave {
            0%   { transform: scale(0.3); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
          }

          /* ============ 🌊 WHIRLPOOL BLACK HOLE (cyan vortex pulling debris) ============ */
          [data-theme="whirlpool"] body {
            background: radial-gradient(ellipse at center, #0a1f2e 0%, #050f1a 50%, #000510 100%) !important;
            color: #a5f3fc !important;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
            letter-spacing: 0.02em;
            position: relative;
            overflow-x: hidden;
          }
          [data-theme="whirlpool"] h1,
          [data-theme="whirlpool"] h2,
          [data-theme="whirlpool"] h3 {
            font-family: 'Consolas', 'Monaco', monospace !important;
            letter-spacing: 0.1em !important;
            text-transform: uppercase !important;
            text-shadow: 0 0 20px rgba(34, 211, 238, 0.7) !important;
          }
          [data-theme="whirlpool"] body::before {
            content: '';
            position: fixed; inset: 0;
            background: conic-gradient(from 0deg at 50% 50%,
              transparent 0deg,
              rgba(34, 211, 238, 0.35) 30deg,
              rgba(8, 145, 178, 0.25) 90deg,
              transparent 150deg,
              rgba(34, 211, 238, 0.30) 210deg,
              rgba(14, 165, 233, 0.25) 270deg,
              transparent 330deg,
              transparent 360deg);
            animation: whirlpoolSpin 12s linear infinite;
            pointer-events: none;
            z-index: 0;
            filter: blur(6px);
          }
          [data-theme="whirlpool"] body::after {
            content: '';
            position: fixed; inset: 0;
            height: 100vh; bottom: 0; z-index: 0;
            background-image:
              radial-gradient(1px 1px at 10% 20%, #67e8f9, transparent),
              radial-gradient(1px 1px at 30% 60%, white, transparent),
              radial-gradient(1.5px 1.5px at 60% 30%, #22d3ee, transparent),
              radial-gradient(1px 1px at 85% 70%, white, transparent);
            background-size: 280px 280px, 320px 320px, 360px 360px, 290px 290px;
            box-shadow: none;
            animation: whirlpoolStarsPull 10s linear infinite;
            opacity: 0.6;
            pointer-events: none;
          }
          [data-theme="whirlpool"] .theme-planet { display: block !important; }
          /* Center void */
          [data-theme="whirlpool"] .planet-1 {
            width: 200px; height: 200px;
            top: 50%; left: 50%;
            margin: -100px 0 0 -100px;
            background: radial-gradient(circle at 50% 50%,
              #000 50%, rgba(0, 30, 50, 0.8) 70%, transparent 100%);
            border-radius: 50%;
            box-shadow:
              0 0 60px 20px rgba(34, 211, 238, 0.5),
              inset 0 0 40px rgba(8, 145, 178, 0.6);
          }
          /* Debris orbit - large */
          [data-theme="whirlpool"] .planet-2 {
            width: 600px; height: 600px;
            top: 50%; left: 50%;
            margin: -300px 0 0 -300px;
            background-image:
              radial-gradient(2px 2px at 20% 50%, rgba(165, 243, 252, 0.9), transparent),
              radial-gradient(3px 3px at 80% 50%, rgba(34, 211, 238, 1), transparent),
              radial-gradient(2px 2px at 50% 20%, rgba(103, 232, 249, 0.9), transparent),
              radial-gradient(2.5px 2.5px at 50% 80%, white, transparent),
              radial-gradient(2px 2px at 30% 30%, rgba(165, 243, 252, 0.8), transparent),
              radial-gradient(2px 2px at 70% 70%, rgba(34, 211, 238, 0.9), transparent);
            background-size: 100% 100%;
            border-radius: 50%;
            animation: whirlpoolDebris 15s linear infinite;
          }
          /* Debris orbit - small */
          [data-theme="whirlpool"] .planet-3 {
            width: 380px; height: 380px;
            top: 50%; left: 50%;
            margin: -190px 0 0 -190px;
            background-image:
              radial-gradient(3px 3px at 30% 50%, white, transparent),
              radial-gradient(2px 2px at 70% 50%, rgba(165, 243, 252, 1), transparent),
              radial-gradient(2.5px 2.5px at 50% 30%, rgba(34, 211, 238, 1), transparent);
            background-size: 100% 100%;
            border-radius: 50%;
            animation: whirlpoolDebris 8s linear infinite reverse;
          }
          [data-theme="whirlpool"] .particle-layer {
            position: fixed;
            top: 50%; left: 50%;
            width: 900px; height: 900px;
            margin: -450px 0 0 -450px;
            pointer-events: none;
            z-index: 1;
            border-radius: 50%;
            background: conic-gradient(from 90deg at 50% 50%,
              transparent 0deg,
              rgba(34, 211, 238, 0.4) 60deg,
              transparent 120deg,
              rgba(8, 145, 178, 0.3) 180deg,
              transparent 240deg,
              rgba(34, 211, 238, 0.4) 300deg,
              transparent 360deg);
            filter: blur(20px);
            animation: whirlpoolSpin 8s linear infinite reverse;
          }
          @keyframes whirlpoolSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes whirlpoolStarsPull {
            from { transform: scale(1) rotate(0deg); }
            to   { transform: scale(0.8) rotate(20deg); }
          }
          @keyframes whirlpoolDebris {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          /* ============ 💍 INTERSTELLAR BLACK HOLE (Gargantua-style accretion ring) ============ */
          [data-theme="interstellar"] body {
            background: radial-gradient(ellipse at center, #1a0e08 0%, #0a0604 50%, #000 100%) !important;
            color: #fde68a !important;
            font-family: 'Georgia', 'Times New Roman', serif !important;
            letter-spacing: 0.02em;
            position: relative;
            overflow-x: hidden;
          }
          [data-theme="interstellar"] h1,
          [data-theme="interstellar"] h2,
          [data-theme="interstellar"] h3 {
            font-family: 'Georgia', 'Times New Roman', serif !important;
            letter-spacing: 0.08em !important;
            font-weight: 400 !important;
            text-shadow: 0 0 25px rgba(252, 211, 77, 0.5) !important;
          }
          [data-theme="interstellar"] body::before {
            content: '';
            position: fixed; inset: 0;
            background-image:
              radial-gradient(1px 1px at 10% 15%, #fde68a, transparent),
              radial-gradient(1px 1px at 25% 60%, white, transparent),
              radial-gradient(1.5px 1.5px at 45% 25%, #fcd34d, transparent),
              radial-gradient(1px 1px at 65% 75%, #fde68a, transparent),
              radial-gradient(1.5px 1.5px at 88% 30%, white, transparent),
              radial-gradient(1px 1px at 12% 80%, #fcd34d, transparent),
              radial-gradient(1.5px 1.5px at 80% 88%, #fde68a, transparent);
            background-size: 300px 300px, 350px 350px, 280px 280px, 320px 320px, 380px 380px, 340px 340px, 360px 360px;
            opacity: 0.5;
            animation: interstellarStarsDrift 90s linear infinite;
            pointer-events: none;
            z-index: 0;
          }
          [data-theme="interstellar"] body::after {
            /* Vertical light streaks (gravitational lensing) */
            content: '';
            position: fixed; inset: 0;
            height: 100vh; bottom: 0; z-index: 0;
            background-image:
              linear-gradient(0deg, transparent 30%, rgba(252, 211, 77, 0.15) 50%, transparent 70%),
              linear-gradient(0deg, transparent 35%, rgba(245, 158, 11, 0.10) 50%, transparent 65%);
            background-size: 200% 100%, 250% 100%;
            background-position: 50% 0, 30% 0;
            background-repeat: no-repeat;
            box-shadow: none;
            opacity: 0.7;
            pointer-events: none;
          }
          [data-theme="interstellar"] .theme-planet { display: block !important; }
          /* Black hole center */
          [data-theme="interstellar"] .planet-1 {
            width: 240px; height: 240px;
            top: 50%; left: 50%;
            margin: -120px 0 0 -120px;
            background: #000;
            border-radius: 50%;
            box-shadow:
              0 0 0 3px rgba(252, 211, 77, 0.8),
              0 0 60px 25px rgba(245, 158, 11, 0.7),
              0 0 120px 60px rgba(251, 146, 60, 0.4),
              inset 0 0 30px rgba(252, 211, 77, 0.6);
          }
          /* Big accretion ring (tilted Gargantua style) */
          [data-theme="interstellar"] .planet-2 {
            width: 900px; height: 320px;
            top: 50%; left: 50%;
            margin: -160px 0 0 -450px;
            background: radial-gradient(ellipse at center,
              transparent 32%,
              rgba(252, 211, 77, 0.3) 35%,
              rgba(245, 158, 11, 0.7) 42%,
              rgba(251, 146, 60, 0.85) 48%,
              rgba(245, 158, 11, 0.7) 54%,
              rgba(252, 211, 77, 0.3) 65%,
              transparent 80%);
            border-radius: 50%;
            transform: rotateX(72deg) rotateZ(-15deg);
            filter: blur(3px);
            animation: interstellarRingSpin 25s linear infinite;
          }
          /* Secondary ring (perpendicular for depth) */
          [data-theme="interstellar"] .planet-3 {
            width: 850px; height: 280px;
            top: 50%; left: 50%;
            margin: -140px 0 0 -425px;
            background: radial-gradient(ellipse at center,
              transparent 33%,
              rgba(252, 211, 77, 0.4) 40%,
              rgba(251, 146, 60, 0.6) 50%,
              transparent 70%);
            border-radius: 50%;
            transform: rotateX(78deg) rotateZ(15deg);
            filter: blur(4px);
            animation: interstellarRingSpin 30s linear infinite reverse;
            opacity: 0.7;
          }
          [data-theme="interstellar"] .jets {
            position: fixed;
            top: 0; left: 50%;
            margin-left: -3px;
            width: 6px; height: 100vh;
            background: linear-gradient(180deg,
              transparent 0%,
              rgba(252, 211, 77, 0.4) 25%,
              rgba(245, 158, 11, 0.6) 50%,
              rgba(252, 211, 77, 0.4) 75%,
              transparent 100%);
            filter: blur(6px);
            animation: interstellarJet 5s ease-in-out infinite;
            pointer-events: none;
            z-index: 1;
          }
          [data-theme="interstellar"] .particle-layer {
            position: fixed; inset: 0;
            pointer-events: none;
            z-index: 1;
          }
          [data-theme="interstellar"] .particle-layer::before {
            content: '';
            position: absolute;
            top: 30%; left: 20%;
            width: 6px; height: 6px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 30px 10px rgba(252, 211, 77, 0.8);
            animation: interstellarFlare 4s ease-in-out infinite;
          }
          [data-theme="interstellar"] .particle-layer::after {
            content: '';
            position: absolute;
            bottom: 25%; right: 25%;
            width: 5px; height: 5px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 25px 8px rgba(245, 158, 11, 0.7);
            animation: interstellarFlare 5s ease-in-out infinite;
            animation-delay: 2s;
          }
          @keyframes interstellarStarsDrift {
            0%   { transform: scale(1); }
            100% { transform: scale(1.05); }
          }
          @keyframes interstellarRingSpin {
            from { transform: rotateX(72deg) rotateZ(-15deg) rotate(0deg); }
            to   { transform: rotateX(72deg) rotateZ(-15deg) rotate(360deg); }
          }
          @keyframes interstellarJet {
            0%, 100% { opacity: 0.6; transform: scaleY(1); }
            50%      { opacity: 1; transform: scaleY(1.05); }
          }
          @keyframes interstellarFlare {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50%      { opacity: 1; transform: scale(1.4); }
          }

          /* ============ 🌟 SOLAR SPIRAL GALAXY (bright sun + orbital rings) ============ */
          [data-theme="solar-spiral"] body {
            background: radial-gradient(ellipse at center, #2a1a05 0%, #0a0500 60%, #000 100%) !important;
            color: #fef3c7 !important;
            font-family: 'Verdana', 'Trebuchet MS', sans-serif !important;
            letter-spacing: 0.025em;
            position: relative;
            overflow-x: hidden;
          }
          [data-theme="solar-spiral"] h1,
          [data-theme="solar-spiral"] h2,
          [data-theme="solar-spiral"] h3 {
            font-family: 'Verdana', 'Trebuchet MS', sans-serif !important;
            font-weight: 700 !important;
            letter-spacing: 0.04em !important;
            text-shadow: 0 0 25px rgba(254, 243, 199, 0.6), 0 0 40px rgba(251, 191, 36, 0.4) !important;
          }
          [data-theme="solar-spiral"] body::before {
            /* Spiral arms via conic-gradient */
            content: '';
            position: fixed; inset: 0;
            background: conic-gradient(from 0deg at 50% 50%,
              transparent 0deg,
              rgba(254, 243, 199, 0.2) 30deg,
              rgba(251, 191, 36, 0.3) 60deg,
              transparent 120deg,
              rgba(254, 215, 170, 0.2) 180deg,
              rgba(251, 146, 60, 0.25) 220deg,
              transparent 280deg,
              rgba(254, 243, 199, 0.2) 320deg,
              transparent 360deg);
            animation: solarSpiralRotate 50s linear infinite;
            filter: blur(8px);
            pointer-events: none;
            z-index: 0;
          }
          [data-theme="solar-spiral"] body::after {
            content: '';
            position: fixed; inset: 0;
            height: 100vh; bottom: 0; z-index: 0;
            background-image:
              radial-gradient(1px 1px at 10% 20%, white, transparent),
              radial-gradient(1.5px 1.5px at 30% 50%, #fef3c7, transparent),
              radial-gradient(1px 1px at 60% 30%, #fcd34d, transparent),
              radial-gradient(2px 2px at 80% 80%, white, transparent),
              radial-gradient(1px 1px at 92% 25%, #fde68a, transparent);
            background-size: 280px 280px, 320px 320px, 350px 350px, 290px 290px, 380px 380px;
            box-shadow: none;
            opacity: 0.7;
            animation: solarStarsTwinkle 16s linear infinite;
            pointer-events: none;
          }
          [data-theme="solar-spiral"] .theme-planet { display: block !important; }
          /* Bright sun core */
          [data-theme="solar-spiral"] .planet-1 {
            width: 280px; height: 280px;
            top: 50%; left: 50%;
            margin: -140px 0 0 -140px;
            background: radial-gradient(circle at 50% 50%,
              white 0%, #fef3c7 15%, #fde68a 30%,
              #fcd34d 50%, rgba(245, 158, 11, 0.7) 70%, transparent 100%);
            border-radius: 50%;
            box-shadow:
              0 0 100px 40px rgba(254, 243, 199, 0.7),
              0 0 200px 80px rgba(251, 191, 36, 0.5),
              0 0 350px 150px rgba(245, 158, 11, 0.3);
            filter: blur(2px);
            animation: solarCorePulse 3s ease-in-out infinite;
          }
          /* Outer orbital ring 1 */
          [data-theme="solar-spiral"] .planet-2 {
            width: 800px; height: 280px;
            top: 50%; left: 50%;
            margin: -140px 0 0 -400px;
            background: radial-gradient(ellipse at center,
              transparent 38%,
              rgba(252, 211, 77, 0.3) 42%,
              rgba(251, 191, 36, 0.6) 48%,
              rgba(245, 158, 11, 0.5) 55%,
              transparent 75%);
            border-radius: 50%;
            transform: rotateX(70deg) rotateZ(20deg);
            filter: blur(2px);
            animation: solarRingSpin 20s linear infinite;
          }
          /* Outer orbital ring 2 (different angle) */
          [data-theme="solar-spiral"] .planet-3 {
            width: 1100px; height: 360px;
            top: 50%; left: 50%;
            margin: -180px 0 0 -550px;
            background: radial-gradient(ellipse at center,
              transparent 40%,
              rgba(254, 215, 170, 0.2) 44%,
              rgba(251, 146, 60, 0.4) 50%,
              rgba(252, 211, 77, 0.3) 56%,
              transparent 75%);
            border-radius: 50%;
            transform: rotateX(75deg) rotateZ(-25deg);
            filter: blur(3px);
            animation: solarRingSpin 35s linear infinite reverse;
            opacity: 0.7;
          }
          [data-theme="solar-spiral"] .particle-layer {
            position: fixed; inset: 0;
            pointer-events: none;
            z-index: 1;
          }
          /* Lens flare 1 */
          [data-theme="solar-spiral"] .particle-layer::before {
            content: '';
            position: absolute;
            top: 30%; left: 25%;
            width: 8px; height: 8px;
            background: white;
            border-radius: 50%;
            box-shadow:
              0 0 20px 5px white,
              0 0 50px 15px rgba(252, 211, 77, 0.8),
              0 0 100px 30px rgba(251, 146, 60, 0.5);
            animation: solarFlare 4s ease-in-out infinite;
          }
          /* Lens flare 2 */
          [data-theme="solar-spiral"] .particle-layer::after {
            content: '';
            position: absolute;
            bottom: 20%; right: 22%;
            width: 6px; height: 6px;
            background: white;
            border-radius: 50%;
            box-shadow:
              0 0 15px 4px white,
              0 0 40px 12px rgba(254, 240, 138, 0.7),
              0 0 80px 25px rgba(245, 158, 11, 0.5);
            animation: solarFlare 5s ease-in-out infinite;
            animation-delay: 2s;
          }
          @keyframes solarSpiralRotate {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes solarStarsTwinkle {
            0%, 100% { opacity: 0.7; }
            50%      { opacity: 1; }
          }
          @keyframes solarCorePulse {
            0%, 100% { transform: scale(1); filter: blur(2px) brightness(1); }
            50%      { transform: scale(1.08); filter: blur(2px) brightness(1.3); }
          }
          @keyframes solarRingSpin {
            from { transform: rotateX(70deg) rotateZ(20deg) rotate(0deg); }
            to   { transform: rotateX(70deg) rotateZ(20deg) rotate(360deg); }
          }
          @keyframes solarFlare {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50%      { opacity: 1; transform: scale(1.5); }
          }

          /* ============================================================
             PHOTO BACKGROUND OVERRIDE — 4 cosmic photo HD themes
             Pakai foto NASA-style asli dari /public/themes/, override CSS gradient
             pure dengan photo-realistic background + 3D animation parallax/zoom
             ============================================================ */

          /* === Common: hide CSS planets, simplify pseudo-elements === */
          [data-theme="dust-explosion"] .theme-planet,
          [data-theme="whirlpool"] .theme-planet,
          [data-theme="interstellar"] .theme-planet,
          [data-theme="solar-spiral"] .theme-planet { display: none !important; }

          /* === 🔆 DUST EXPLOSION — photo background === */
          [data-theme="dust-explosion"] body {
            background: #000 url('/themes/photo-dust-explosion.jpg') center center / cover no-repeat fixed !important;
            animation: photoZoomBreath 18s ease-in-out infinite;
          }
          [data-theme="dust-explosion"] body::before {
            content: '';
            position: fixed; inset: 0;
            width: auto; height: auto; margin: 0;
            background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.85) 100%);
            filter: none;
            animation: none;
            pointer-events: none;
            z-index: 0;
          }
          [data-theme="dust-explosion"] body::after {
            background-image: none;
            background: radial-gradient(ellipse at 50% 50%, rgba(255,209,102,0.08) 0%, transparent 60%);
            animation: dustOverlayPulse 7s ease-in-out infinite;
            opacity: 0.7;
          }
          [data-theme="dust-explosion"] .particle-layer {
            position: fixed; inset: 0;
            pointer-events: none; z-index: 1; overflow: hidden;
          }
          [data-theme="dust-explosion"] .particle-layer::before,
          [data-theme="dust-explosion"] .particle-layer::after {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 300px; height: 100px;
            margin: -50px 0 0 -150px;
            border: 2px solid rgba(255, 209, 102, 0.4);
            border-radius: 50%;
            animation: dustShockwave 5s ease-out infinite;
          }
          [data-theme="dust-explosion"] .particle-layer::after {
            border-color: rgba(255, 134, 51, 0.3);
            animation-delay: 2.5s;
          }

          /* === 🌊 WHIRLPOOL — photo background === */
          [data-theme="whirlpool"] body {
            background: #000 url('/themes/photo-whirlpool.jpg') center center / cover no-repeat fixed !important;
            animation: photoSlowRotate 60s linear infinite;
          }
          [data-theme="whirlpool"] body::before {
            content: '';
            position: fixed; inset: 0;
            background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 80%, rgba(0,5,15,0.85) 100%);
            filter: none;
            animation: none;
            pointer-events: none;
            z-index: 0;
          }
          [data-theme="whirlpool"] body::after {
            background-image: none;
            background: radial-gradient(circle at center, rgba(34,211,238,0.10) 0%, transparent 50%);
            animation: whirlpoolPulse 6s ease-in-out infinite;
          }
          [data-theme="whirlpool"] .particle-layer {
            position: fixed; inset: 0;
            margin: 0; width: auto; height: auto;
            background: none;
            filter: none;
            animation: none;
            pointer-events: none;
            z-index: 1;
          }

          /* === 💍 INTERSTELLAR — photo background === */
          [data-theme="interstellar"] body {
            background: #000 url('/themes/photo-interstellar.jpg') center center / cover no-repeat fixed !important;
            animation: photoZoomBreath 22s ease-in-out infinite;
          }
          [data-theme="interstellar"] body::before {
            content: '';
            position: fixed; inset: 0;
            background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.4) 80%, rgba(10,5,2,0.9) 100%);
            background-image: none;
            background-size: auto;
            animation: none;
            opacity: 1;
            pointer-events: none;
            z-index: 0;
          }
          [data-theme="interstellar"] body::after {
            background-image: none;
            background: radial-gradient(ellipse at center, rgba(252,211,77,0.12) 0%, transparent 60%);
            animation: interstellarOverlayPulse 5s ease-in-out infinite;
          }
          [data-theme="interstellar"] .jets {
            position: fixed;
            top: 0; left: 50%;
            margin-left: -2px;
            width: 4px; height: 100vh;
            background: linear-gradient(180deg,
              transparent 0%,
              rgba(252, 211, 77, 0.3) 30%,
              rgba(245, 158, 11, 0.5) 50%,
              rgba(252, 211, 77, 0.3) 70%,
              transparent 100%);
            filter: blur(4px);
            animation: interstellarJet 5s ease-in-out infinite;
            pointer-events: none;
            z-index: 1;
            opacity: 0.6;
          }
          [data-theme="interstellar"] .particle-layer {
            position: fixed; inset: 0;
            pointer-events: none;
            z-index: 1;
          }
          [data-theme="interstellar"] .particle-layer::before {
            content: '';
            position: absolute;
            top: 30%; left: 20%;
            width: 6px; height: 6px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 30px 10px rgba(252, 211, 77, 0.6);
            animation: interstellarFlare 4s ease-in-out infinite;
          }
          [data-theme="interstellar"] .particle-layer::after {
            content: '';
            position: absolute;
            bottom: 25%; right: 25%;
            width: 5px; height: 5px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 25px 8px rgba(245, 158, 11, 0.5);
            animation: interstellarFlare 5s ease-in-out infinite;
            animation-delay: 2s;
          }

          /* === 🌟 SOLAR SPIRAL — photo background === */
          [data-theme="solar-spiral"] body {
            background: #000 url('/themes/photo-solar-spiral.jpg') center center / cover no-repeat fixed !important;
            animation: photoZoomBreath 20s ease-in-out infinite;
          }
          [data-theme="solar-spiral"] body::before {
            content: '';
            position: fixed; inset: 0;
            background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 80%, rgba(10,5,0,0.85) 100%);
            filter: none;
            animation: none;
            pointer-events: none;
            z-index: 0;
          }
          [data-theme="solar-spiral"] body::after {
            background-image: none;
            background: radial-gradient(circle at center, rgba(254,243,199,0.10) 0%, transparent 50%);
            animation: solarOverlayPulse 6s ease-in-out infinite;
          }
          [data-theme="solar-spiral"] .particle-layer {
            position: fixed; inset: 0;
            pointer-events: none;
            z-index: 1;
          }
          [data-theme="solar-spiral"] .particle-layer::before {
            content: '';
            position: absolute;
            top: 30%; left: 25%;
            width: 8px; height: 8px;
            background: white;
            border-radius: 50%;
            box-shadow:
              0 0 20px 5px white,
              0 0 50px 15px rgba(252, 211, 77, 0.6),
              0 0 100px 30px rgba(251, 146, 60, 0.4);
            animation: solarFlare 4s ease-in-out infinite;
          }
          [data-theme="solar-spiral"] .particle-layer::after {
            content: '';
            position: absolute;
            bottom: 20%; right: 22%;
            width: 6px; height: 6px;
            background: white;
            border-radius: 50%;
            box-shadow:
              0 0 15px 4px white,
              0 0 40px 12px rgba(254, 240, 138, 0.6),
              0 0 80px 25px rgba(245, 158, 11, 0.4);
            animation: solarFlare 5s ease-in-out infinite;
            animation-delay: 2s;
          }

          /* === Shared keyframes for photo themes === */
          @keyframes photoZoomBreath {
            0%, 100% { background-size: 105% auto; background-position: 50% 50%; }
            50%      { background-size: 115% auto; background-position: 52% 48%; }
          }
          @keyframes photoSlowRotate {
            0%   { background-size: 110% auto; transform: rotate(0deg); }
            50%  { background-size: 120% auto; transform: rotate(2deg); }
            100% { background-size: 110% auto; transform: rotate(0deg); }
          }
          @keyframes dustOverlayPulse {
            0%, 100% { opacity: 0.7; }
            50%      { opacity: 1; }
          }
          @keyframes whirlpoolPulse {
            0%, 100% { opacity: 0.6; }
            50%      { opacity: 1; }
          }
          @keyframes interstellarOverlayPulse {
            0%, 100% { opacity: 0.6; }
            50%      { opacity: 1; }
          }
          @keyframes solarOverlayPulse {
            0%, 100% { opacity: 0.6; }
            50%      { opacity: 1; }
          }

          /* Reduce motion → disable 3D animations */
          @media (prefers-reduced-motion: reduce) {
            .theme-fx-layer { animation: none !important; transform: none !important; }
            .theme-planet { animation: none !important; }
            .particle-layer, .particle-layer::before, .particle-layer::after,
            .jets { animation: none !important; }
            [data-theme="dust-explosion"] body,
            [data-theme="whirlpool"] body,
            [data-theme="interstellar"] body,
            [data-theme="solar-spiral"] body { animation: none !important; }
          }

          /* Mobile: simpler 3D (skip front layer animation = save battery) */
          @media (max-width: 768px) {
            .theme-fx-layer.fx-front { animation-duration: 30s !important; }
            .theme-fx { perspective: 800px; }
            /* Shrink planets via zoom (doesn't conflict with transform: rotateX/spin) */
            .theme-planet { zoom: 0.65; }
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
          {/* Planets — visible only di galaxy variants (deepspace/solar/mars) */}
          <div className="theme-planet planet-1"></div>
          <div className="theme-planet planet-2"></div>
          <div className="theme-planet planet-3"></div>
        </div>
        {/* Helper layers — visible only di tema cinematic 3D HD (supernova/binary-star/blackhole-anime/galactic-nebula) */}
        <div className="particle-layer" aria-hidden="true"></div>
        <div className="jets" aria-hidden="true"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
