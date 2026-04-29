export const metadata = { title: 'Football Bot Dashboard' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* ============================================================
             THEME SYSTEM — Single theme: Cosmic Fusion (forced for all users)
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


          /* ============================================================
             🌠 COSMIC FUSION — kombinasi Galaxy + Spiral + Supernova
             User minta gabungkan 3 tema favorit jadi 1 mega-cosmic.
             ============================================================ */

          [data-theme="cosmic-fusion"] body {
            background: radial-gradient(ellipse at 30% 30%, #1a0a3e 0%, #0a0420 35%, #0a0010 70%, #000 100%) !important;
            color: #fef3c7 !important;
            font-family: 'Georgia', 'Times New Roman', serif !important;
            letter-spacing: 0.025em;
          }
          [data-theme="cosmic-fusion"] h1,
          [data-theme="cosmic-fusion"] h2,
          [data-theme="cosmic-fusion"] h3 {
            font-family: 'Impact', 'Arial Black', sans-serif !important;
            text-transform: uppercase !important;
            letter-spacing: 0.07em !important;
            text-shadow:
              0 0 25px rgba(254, 243, 199, 0.6),
              0 0 45px rgba(168, 85, 247, 0.5),
              0 0 70px rgba(251, 146, 60, 0.4) !important;
          }
          /* Multi-color nebula background — DIMMED biar gak overpower stars */
          [data-theme="cosmic-fusion"] body::before {
            content: '';
            position: fixed; inset: 0;
            background-image:
              radial-gradient(ellipse 1000px 600px at 25% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 60%),
              radial-gradient(ellipse 800px 500px at 75% 60%, rgba(236, 72, 153, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 700px 400px at 50% 70%, rgba(59, 130, 246, 0.10) 0%, transparent 60%),
              radial-gradient(ellipse 600px 400px at 80% 25%, rgba(251, 146, 60, 0.10) 0%, transparent 65%);
            animation: fusionNebulaShift 25s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
          }
          /* Stars layer STATIC (60 stars, always visible, gentle twinkle) — bukan warp lagi */
          [data-theme="cosmic-fusion"] body::after {
            content: '';
            position: fixed; inset: 0;
            height: 100vh; bottom: 0; z-index: 0;
            background-image:
              radial-gradient(1px 1px at 3% 5%, rgba(255, 255, 255, 0.70), transparent),
              radial-gradient(1px 1px at 7% 18%, rgba(165, 243, 252, 0.65), transparent),
              radial-gradient(1px 1px at 11% 32%, rgba(254, 240, 138, 0.70), transparent),
              radial-gradient(1px 1px at 15% 47%, rgba(255, 255, 255, 0.75), transparent),
              radial-gradient(1px 1px at 19% 61%, rgba(167, 139, 250, 0.70), transparent),
              radial-gradient(1px 1px at 23% 76%, rgba(252, 165, 165, 0.65), transparent),
              radial-gradient(1px 1px at 27% 9%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 31% 23%, rgba(96, 165, 250, 0.70), transparent),
              radial-gradient(1px 1px at 35% 38%, rgba(254, 243, 199, 0.75), transparent),
              radial-gradient(1px 1px at 39% 54%, rgba(165, 243, 252, 0.65), transparent),
              radial-gradient(1px 1px at 43% 69%, rgba(255, 255, 255, 0.70), transparent),
              radial-gradient(1px 1px at 47% 84%, rgba(254, 240, 138, 0.65), transparent),
              radial-gradient(1px 1px at 51% 14%, rgba(167, 139, 250, 0.70), transparent),
              radial-gradient(1px 1px at 55% 28%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 59% 43%, rgba(252, 165, 165, 0.70), transparent),
              radial-gradient(1px 1px at 63% 58%, rgba(96, 165, 250, 0.65), transparent),
              radial-gradient(1px 1px at 67% 72%, rgba(255, 255, 255, 0.75), transparent),
              radial-gradient(1px 1px at 71% 88%, rgba(254, 243, 199, 0.70), transparent),
              radial-gradient(1px 1px at 75% 18%, rgba(165, 243, 252, 0.65), transparent),
              radial-gradient(1px 1px at 79% 33%, rgba(255, 255, 255, 0.70), transparent),
              radial-gradient(1px 1px at 83% 48%, rgba(167, 139, 250, 0.65), transparent),
              radial-gradient(1px 1px at 87% 62%, rgba(254, 240, 138, 0.70), transparent),
              radial-gradient(1px 1px at 91% 78%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 95% 92%, rgba(252, 165, 165, 0.70), transparent),
              radial-gradient(1px 1px at 99% 25%, rgba(96, 165, 250, 0.70), transparent),
              radial-gradient(1px 1px at 5% 96%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 9% 80%, rgba(254, 243, 199, 0.70), transparent),
              radial-gradient(1px 1px at 13% 67%, rgba(165, 243, 252, 0.65), transparent),
              radial-gradient(1px 1px at 17% 11%, rgba(255, 255, 255, 0.75), transparent),
              radial-gradient(1px 1px at 21% 54%, rgba(167, 139, 250, 0.65), transparent),
              radial-gradient(1px 1px at 25% 41%, rgba(252, 165, 165, 0.70), transparent),
              radial-gradient(1px 1px at 29% 87%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 33% 6%, rgba(96, 165, 250, 0.70), transparent),
              radial-gradient(1px 1px at 37% 78%, rgba(254, 240, 138, 0.70), transparent),
              radial-gradient(1px 1px at 41% 25%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 45% 50%, rgba(165, 243, 252, 0.75), transparent),
              radial-gradient(1px 1px at 49% 95%, rgba(167, 139, 250, 0.65), transparent),
              radial-gradient(1px 1px at 53% 65%, rgba(255, 255, 255, 0.70), transparent),
              radial-gradient(1px 1px at 57% 8%, rgba(254, 243, 199, 0.70), transparent),
              radial-gradient(1px 1px at 61% 35%, rgba(252, 165, 165, 0.65), transparent),
              radial-gradient(1px 1px at 65% 90%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 69% 49%, rgba(96, 165, 250, 0.70), transparent),
              radial-gradient(1px 1px at 73% 76%, rgba(165, 243, 252, 0.65), transparent),
              radial-gradient(1px 1px at 77% 4%, rgba(255, 255, 255, 0.75), transparent),
              radial-gradient(1px 1px at 81% 22%, rgba(167, 139, 250, 0.70), transparent),
              radial-gradient(1px 1px at 85% 38%, rgba(254, 240, 138, 0.65), transparent),
              radial-gradient(1px 1px at 89% 55%, rgba(252, 165, 165, 0.70), transparent),
              radial-gradient(1px 1px at 93% 71%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 97% 88%, rgba(96, 165, 250, 0.75), transparent),
              radial-gradient(1px 1px at 6% 50%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 14% 88%, rgba(254, 243, 199, 0.70), transparent),
              radial-gradient(1px 1px at 22% 5%, rgba(165, 243, 252, 0.65), transparent),
              radial-gradient(1px 1px at 30% 92%, rgba(167, 139, 250, 0.75), transparent),
              radial-gradient(1px 1px at 38% 16%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 46% 73%, rgba(252, 165, 165, 0.70), transparent),
              radial-gradient(1px 1px at 54% 45%, rgba(254, 240, 138, 0.65), transparent),
              radial-gradient(1px 1px at 62% 12%, rgba(255, 255, 255, 0.70), transparent),
              radial-gradient(1px 1px at 70% 82%, rgba(96, 165, 250, 0.65), transparent),
              radial-gradient(1px 1px at 78% 59%, rgba(165, 243, 252, 0.70), transparent),
              radial-gradient(1px 1px at 86% 16%, rgba(254, 243, 199, 0.65), transparent),
              radial-gradient(1px 1px at 94% 47%, rgba(255, 255, 255, 0.75), transparent);
            background-size: 100% 100%;
            box-shadow: none;
            animation: fusionStarsTwinkle 4s ease-in-out infinite;
            opacity: 0.85;
            pointer-events: none;
          }
          /* WARP FAR STARS — bintang jauh zoom slow (galaxy hyperspace, slowest) */
          [data-theme="cosmic-fusion"] .theme-fx-layer.fx-back {
            background-image:
              radial-gradient(1px 1px at 5% 10%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1px 1px at 12% 22%, rgba(165, 243, 252, 0.80), transparent),
              radial-gradient(1px 1px at 19% 35%, rgba(254, 240, 138, 0.85), transparent),
              radial-gradient(1px 1px at 26% 48%, rgba(255, 255, 255, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 33% 61%, rgba(167, 139, 250, 0.85), transparent),
              radial-gradient(1px 1px at 40% 74%, rgba(252, 165, 165, 0.80), transparent),
              radial-gradient(1px 1px at 47% 87%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 54% 12%, rgba(96, 165, 250, 0.80), transparent),
              radial-gradient(1px 1px at 61% 25%, rgba(254, 243, 199, 0.85), transparent),
              radial-gradient(1px 1px at 68% 38%, rgba(165, 243, 252, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 75% 51%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1px 1px at 82% 64%, rgba(167, 139, 250, 0.80), transparent),
              radial-gradient(1px 1px at 89% 77%, rgba(252, 165, 165, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 96% 90%, rgba(254, 240, 138, 0.80), transparent),
              radial-gradient(1px 1px at 8% 65%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1px 1px at 16% 82%, rgba(96, 165, 250, 0.80), transparent),
              radial-gradient(1px 1px at 24% 95%, rgba(254, 243, 199, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 32% 8%, rgba(165, 243, 252, 0.80), transparent),
              radial-gradient(1px 1px at 38% 19%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1px 1px at 44% 32%, rgba(252, 165, 165, 0.80), transparent),
              radial-gradient(1px 1px at 50% 45%, rgba(167, 139, 250, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 56% 58%, rgba(255, 255, 255, 0.80), transparent),
              radial-gradient(1px 1px at 62% 71%, rgba(254, 240, 138, 0.85), transparent),
              radial-gradient(1px 1px at 68% 84%, rgba(96, 165, 250, 0.80), transparent),
              radial-gradient(1px 1px at 74% 5%, rgba(165, 243, 252, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 80% 18%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1px 1px at 86% 31%, rgba(254, 243, 199, 0.80), transparent),
              radial-gradient(1px 1px at 92% 44%, rgba(167, 139, 250, 0.85), transparent),
              radial-gradient(1px 1px at 98% 57%, rgba(252, 165, 165, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 4% 38%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1px 1px at 10% 51%, rgba(254, 240, 138, 0.80), transparent),
              radial-gradient(1px 1px at 18% 76%, rgba(96, 165, 250, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 28% 14%, rgba(165, 243, 252, 0.85), transparent),
              radial-gradient(1px 1px at 36% 29%, rgba(254, 243, 199, 0.80), transparent),
              radial-gradient(1px 1px at 42% 52%, rgba(167, 139, 250, 0.85), transparent),
              radial-gradient(1px 1px at 48% 75%, rgba(252, 165, 165, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 54% 92%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1px 1px at 60% 16%, rgba(96, 165, 250, 0.80), transparent),
              radial-gradient(1px 1px at 66% 39%, rgba(254, 240, 138, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 72% 62%, rgba(165, 243, 252, 0.80), transparent),
              radial-gradient(1px 1px at 78% 85%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1px 1px at 84% 9%, rgba(167, 139, 250, 0.80), transparent),
              radial-gradient(1px 1px at 90% 22%, rgba(254, 243, 199, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 96% 35%, rgba(252, 165, 165, 0.80), transparent),
              radial-gradient(1px 1px at 14% 47%, rgba(255, 255, 255, 0.80), transparent),
              radial-gradient(1px 1px at 22% 68%, rgba(96, 165, 250, 0.85), transparent),
              radial-gradient(1px 1px at 30% 91%, rgba(165, 243, 252, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 46% 6%, rgba(254, 243, 199, 0.85), transparent),
              radial-gradient(1px 1px at 58% 28%, rgba(167, 139, 250, 0.80), transparent),
              radial-gradient(1px 1px at 70% 49%, rgba(252, 165, 165, 0.85), transparent);
            background-size: 100% 100%;
            animation: fusionStarsWarpFar 12s linear infinite;
          }
          /* Bintang ORBIT memutar sekitar pusat (50 stars, very dim alpha 0.25-0.35) */
          [data-theme="cosmic-fusion"] .theme-fx-layer.fx-mid {
            background-image:
              radial-gradient(1px 1px at 4% 6%, rgba(255, 255, 255, 0.70), transparent),
              radial-gradient(1px 1px at 10% 18%, rgba(165, 243, 252, 0.65), transparent),
              radial-gradient(1px 1px at 16% 32%, rgba(254, 240, 138, 0.70), transparent),
              radial-gradient(1px 1px at 22% 46%, rgba(167, 139, 250, 0.65), transparent),
              radial-gradient(1px 1px at 28% 60%, rgba(255, 255, 255, 0.75), transparent),
              radial-gradient(1px 1px at 34% 74%, rgba(252, 165, 165, 0.65), transparent),
              radial-gradient(1px 1px at 40% 88%, rgba(96, 165, 250, 0.70), transparent),
              radial-gradient(1px 1px at 46% 8%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 52% 22%, rgba(254, 243, 199, 0.70), transparent),
              radial-gradient(1px 1px at 58% 36%, rgba(165, 243, 252, 0.75), transparent),
              radial-gradient(1px 1px at 64% 50%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 70% 64%, rgba(167, 139, 250, 0.70), transparent),
              radial-gradient(1px 1px at 76% 78%, rgba(252, 165, 165, 0.65), transparent),
              radial-gradient(1px 1px at 82% 14%, rgba(255, 255, 255, 0.70), transparent),
              radial-gradient(1px 1px at 88% 28%, rgba(96, 165, 250, 0.75), transparent),
              radial-gradient(1px 1px at 94% 42%, rgba(254, 240, 138, 0.65), transparent),
              radial-gradient(1px 1px at 8% 88%, rgba(255, 255, 255, 0.70), transparent),
              radial-gradient(1px 1px at 14% 56%, rgba(165, 243, 252, 0.65), transparent),
              radial-gradient(1px 1px at 20% 12%, rgba(167, 139, 250, 0.75), transparent),
              radial-gradient(1px 1px at 26% 78%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 32% 38%, rgba(254, 243, 199, 0.70), transparent),
              radial-gradient(1px 1px at 38% 24%, rgba(252, 165, 165, 0.70), transparent),
              radial-gradient(1px 1px at 44% 64%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 50% 92%, rgba(96, 165, 250, 0.70), transparent),
              radial-gradient(1px 1px at 56% 4%, rgba(165, 243, 252, 0.65), transparent),
              radial-gradient(1px 1px at 62% 28%, rgba(255, 255, 255, 0.75), transparent),
              radial-gradient(1px 1px at 68% 84%, rgba(167, 139, 250, 0.65), transparent),
              radial-gradient(1px 1px at 74% 42%, rgba(254, 240, 138, 0.70), transparent),
              radial-gradient(1px 1px at 80% 96%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 86% 56%, rgba(252, 165, 165, 0.70), transparent),
              radial-gradient(1px 1px at 92% 70%, rgba(254, 243, 199, 0.65), transparent),
              radial-gradient(1px 1px at 98% 84%, rgba(96, 165, 250, 0.70), transparent),
              radial-gradient(1px 1px at 2% 24%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 6% 42%, rgba(165, 243, 252, 0.70), transparent),
              radial-gradient(1px 1px at 12% 68%, rgba(167, 139, 250, 0.65), transparent),
              radial-gradient(1px 1px at 18% 84%, rgba(255, 255, 255, 0.75), transparent),
              radial-gradient(1px 1px at 24% 4%, rgba(254, 240, 138, 0.65), transparent),
              radial-gradient(1px 1px at 30% 16%, rgba(96, 165, 250, 0.70), transparent),
              radial-gradient(1px 1px at 36% 50%, rgba(252, 165, 165, 0.65), transparent),
              radial-gradient(1px 1px at 42% 92%, rgba(255, 255, 255, 0.70), transparent),
              radial-gradient(1px 1px at 48% 36%, rgba(254, 243, 199, 0.65), transparent),
              radial-gradient(1px 1px at 54% 76%, rgba(165, 243, 252, 0.70), transparent),
              radial-gradient(1px 1px at 60% 16%, rgba(167, 139, 250, 0.65), transparent),
              radial-gradient(1px 1px at 66% 42%, rgba(255, 255, 255, 0.75), transparent),
              radial-gradient(1px 1px at 72% 96%, rgba(96, 165, 250, 0.65), transparent),
              radial-gradient(1px 1px at 78% 22%, rgba(254, 240, 138, 0.70), transparent),
              radial-gradient(1px 1px at 84% 70%, rgba(255, 255, 255, 0.65), transparent),
              radial-gradient(1px 1px at 90% 6%, rgba(252, 165, 165, 0.70), transparent),
              radial-gradient(1px 1px at 96% 96%, rgba(165, 243, 252, 0.65), transparent),
              radial-gradient(1px 1px at 0% 60%, rgba(254, 243, 199, 0.70), transparent);
            background-size: 100% 100%;
            animation: fusionStarsOrbit 80s linear infinite;
          }
          /* Tambahkan medium warp stars layer pakai planet-2 background-image trick — tapi planet-2 udah dipakai mini spiral.
             Solusi: pakai pseudo ::before/::after di .theme-fx-layer.fx-mid untuk medium warp */
          [data-theme="cosmic-fusion"] .theme-fx-layer.fx-mid::before {
            content: '';
            position: absolute; inset: 0;
            background-image:
              radial-gradient(1.5px 1.5px at 5% 8%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 12% 22%, rgba(165, 243, 252, 0.80), transparent),
              radial-gradient(2px 2px at 19% 36%, rgba(254, 240, 138, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 26% 50%, rgba(255, 255, 255, 0.80), transparent),
              radial-gradient(2px 2px at 33% 64%, rgba(167, 139, 250, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 40% 78%, rgba(252, 165, 165, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 47% 92%, rgba(96, 165, 250, 0.85), transparent),
              radial-gradient(2px 2px at 54% 6%, rgba(255, 255, 255, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 61% 20%, rgba(254, 243, 199, 0.85), transparent),
              radial-gradient(2px 2px at 68% 34%, rgba(165, 243, 252, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 75% 48%, rgba(167, 139, 250, 0.85), transparent),
              radial-gradient(2px 2px at 82% 62%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 89% 76%, rgba(254, 240, 138, 0.80), transparent),
              radial-gradient(2px 2px at 96% 90%, rgba(252, 165, 165, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 8% 50%, rgba(255, 255, 255, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 16% 75%, rgba(96, 165, 250, 0.85), transparent),
              radial-gradient(2px 2px at 24% 12%, rgba(254, 243, 199, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 32% 88%, rgba(165, 243, 252, 0.80), transparent),
              radial-gradient(2px 2px at 44% 28%, rgba(167, 139, 250, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 52% 56%, rgba(252, 165, 165, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 60% 80%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(2px 2px at 68% 8%, rgba(254, 240, 138, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 76% 30%, rgba(96, 165, 250, 0.85), transparent),
              radial-gradient(2px 2px at 84% 56%, rgba(167, 139, 250, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 92% 32%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(2px 2px at 4% 70%, rgba(254, 243, 199, 0.80), transparent),
              radial-gradient(1.5px 1.5px at 14% 42%, rgba(165, 243, 252, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 28% 60%, rgba(255, 255, 255, 0.80), transparent),
              radial-gradient(2px 2px at 38% 18%, rgba(167, 139, 250, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 48% 70%, rgba(252, 165, 165, 0.80), transparent),
              radial-gradient(2px 2px at 58% 38%, rgba(254, 240, 138, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 72% 88%, rgba(255, 255, 255, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 88% 8%, rgba(96, 165, 250, 0.80), transparent),
              radial-gradient(2px 2px at 22% 4%, rgba(165, 243, 252, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 64% 96%, rgba(254, 243, 199, 0.80), transparent);
            background-size: 100% 100%;
            animation: fusionStarsWarpMid 6s linear infinite;
            pointer-events: none;
          }
          /* Layer 3 (front): HYPERSPACE WARP stars FRONT — paling cepat, paling dekat */
          [data-theme="cosmic-fusion"] .theme-fx-layer.fx-front {
            background-image:
              radial-gradient(2px 2px at 5% 10%, rgba(255, 255, 255, 0.95), transparent),
              radial-gradient(2px 2px at 14% 23%, rgba(147, 197, 253, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 22% 36%, rgba(253, 230, 138, 0.95), transparent),
              radial-gradient(2px 2px at 30% 49%, rgba(255, 255, 255, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 38% 62%, rgba(196, 181, 253, 0.95), transparent),
              radial-gradient(2px 2px at 46% 75%, rgba(253, 164, 175, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 54% 88%, rgba(255, 255, 255, 0.95), transparent),
              radial-gradient(2px 2px at 62% 5%, rgba(165, 243, 252, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 70% 18%, rgba(254, 243, 199, 0.95), transparent),
              radial-gradient(2px 2px at 78% 31%, rgba(167, 139, 250, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 86% 44%, rgba(255, 255, 255, 0.95), transparent),
              radial-gradient(2px 2px at 94% 57%, rgba(252, 165, 165, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 8% 70%, rgba(255, 255, 255, 0.95), transparent),
              radial-gradient(2px 2px at 18% 83%, rgba(96, 165, 250, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 28% 96%, rgba(254, 240, 138, 0.95), transparent),
              radial-gradient(2px 2px at 38% 8%, rgba(165, 243, 252, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 48% 21%, rgba(255, 255, 255, 0.95), transparent),
              radial-gradient(2px 2px at 58% 34%, rgba(167, 139, 250, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 68% 47%, rgba(252, 165, 165, 0.95), transparent),
              radial-gradient(2px 2px at 78% 60%, rgba(254, 243, 199, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 88% 73%, rgba(255, 255, 255, 0.95), transparent),
              radial-gradient(2px 2px at 98% 86%, rgba(96, 165, 250, 0.90), transparent),
              radial-gradient(2px 2px at 12% 38%, rgba(255, 255, 255, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 22% 56%, rgba(254, 240, 138, 0.95), transparent),
              radial-gradient(2px 2px at 32% 74%, rgba(196, 181, 253, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 42% 92%, rgba(165, 243, 252, 0.95), transparent),
              radial-gradient(2px 2px at 52% 6%, rgba(255, 255, 255, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 62% 24%, rgba(252, 165, 165, 0.95), transparent),
              radial-gradient(2px 2px at 72% 42%, rgba(167, 139, 250, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 82% 60%, rgba(254, 243, 199, 0.95), transparent),
              radial-gradient(2px 2px at 92% 78%, rgba(255, 255, 255, 0.90), transparent),
              radial-gradient(2.5px 2.5px at 6% 26%, rgba(165, 243, 252, 0.90), transparent),
              radial-gradient(2px 2px at 26% 14%, rgba(96, 165, 250, 0.95), transparent),
              radial-gradient(2.5px 2.5px at 56% 46%, rgba(254, 240, 138, 0.90), transparent),
              radial-gradient(2px 2px at 76% 86%, rgba(255, 255, 255, 0.95), transparent);
            background-size: 100% 100%;
            animation: fusionWarp 4s linear infinite;
          }
          [data-theme="cosmic-fusion"] .theme-planet { display: block !important; }
          /* SUPERNOVA explosion at top-right — DIMMED (sebelumnya bikin tengah terang) */
          [data-theme="cosmic-fusion"] .planet-1 {
            width: 900px; height: 900px;
            top: -250px; right: -350px;
            background: radial-gradient(circle at center,
              rgba(255, 250, 230, 0.40) 0%,
              rgba(255, 209, 102, 0.22) 10%,
              rgba(255, 134, 51, 0.15) 25%,
              rgba(186, 51, 26, 0.08) 50%,
              transparent 75%);
            border-radius: 50%;
            filter: blur(8px);
            animation: fusionSupernovaBreath 8s ease-in-out infinite;
          }
          /* Secondary spiral galaxy at bottom-left — DIMMED */
          [data-theme="cosmic-fusion"] .planet-2 {
            width: 500px; height: 500px;
            bottom: -180px; left: -180px;
            background: conic-gradient(from 0deg at 50% 50%,
              transparent 0deg,
              rgba(34, 211, 238, 0.12) 30deg,
              transparent 80deg,
              rgba(96, 165, 250, 0.10) 130deg,
              transparent 200deg,
              rgba(34, 211, 238, 0.12) 250deg,
              transparent 320deg);
            border-radius: 50%;
            filter: blur(15px);
            animation: fusionMiniSpiral 35s linear infinite;
          }
          /* Stellar core at center — DIMATIKAN (display:none) supaya area tengah gak silau */
          [data-theme="cosmic-fusion"] .planet-3 {
            display: none !important;
          }
          /* Particle layer: shockwave rings — DIMMED + lebih halus */
          [data-theme="cosmic-fusion"] .particle-layer {
            position: fixed; inset: 0;
            pointer-events: none; z-index: 1; overflow: hidden;
          }
          [data-theme="cosmic-fusion"] .particle-layer::before,
          [data-theme="cosmic-fusion"] .particle-layer::after {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 280px; height: 280px;
            margin: -140px 0 0 -140px;
            border: 1px solid rgba(254, 243, 199, 0.15);
            border-radius: 50%;
            animation: fusionShockwave 6s ease-out infinite;
          }
          [data-theme="cosmic-fusion"] .particle-layer::after {
            border-color: rgba(168, 85, 247, 0.15);
            animation-delay: 3s;
          }

          @keyframes fusionNebulaShift {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.85; }
            50%      { transform: scale(1.08) rotate(2deg); opacity: 1; }
          }
          @keyframes fusionStarsTwinkle {
            0%, 100% { opacity: 0.85; filter: brightness(1); }
            50%      { opacity: 1; filter: brightness(1.4); }
          }
          /* HYPERSPACE WARP — bintang zoom dari kejauhan ke depan (galaxy-style)
             Slow: 8s untuk far stars (bg::after) — terasa pelan jauh
             Mid:  6s untuk middle stars (fx-mid::before) — speed sedang
             Front 4s warp existing di fx-front (fusionWarp) — paling cepat
             Total 3-tier warp depth = continuous hyperspace feel */
          @keyframes fusionStarsWarpSlow {
            0%   { transform: scale(0.2); opacity: 0; }
            15%  { opacity: 0.55; }
            70%  { opacity: 0.65; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes fusionStarsWarpMid {
            0%   { transform: scale(0.15); opacity: 0; }
            20%  { opacity: 0.85; }
            100% { transform: scale(2.8); opacity: 0; }
          }
          @keyframes fusionStarsWarpFar {
            0%   { transform: scale(0.1); opacity: 0; }
            25%  { opacity: 0.85; }
            75%  { opacity: 0.85; }
            100% { transform: scale(2); opacity: 0; }
          }
          /* Bintang ORBIT memutar sekitar pusat (replace spiral arms) */
          @keyframes fusionStarsOrbit {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes fusionNebulaRotate {
            from { transform: translateZ(-500px) rotate(0deg); }
            to   { transform: translateZ(-500px) rotate(360deg); }
          }
          @keyframes fusionWarp {
            0%   { transform: translateZ(-800px) scale(0.05); opacity: 0; }
            20%  { opacity: 1; }
            100% { transform: translateZ(400px) scale(3); opacity: 0; }
          }
          @keyframes fusionSupernovaBreath {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.85; filter: blur(3px); }
            50%      { transform: scale(1.1) rotate(3deg); opacity: 1; filter: blur(2px); }
          }
          @keyframes fusionMiniSpiral {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes fusionCorePulse {
            0%, 100% { transform: scale(1); filter: blur(2px) brightness(1); }
            50%      { transform: scale(1.15); filter: blur(2px) brightness(1.4); }
          }
          @keyframes fusionShockwave {
            0%   { transform: scale(0.3); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
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
          /* Reduce motion → disable 3D animations */
          @media (prefers-reduced-motion: reduce) {
            .theme-fx-layer { animation: none !important; transform: none !important; }
            .theme-planet { animation: none !important; }
            .particle-layer, .particle-layer::before, .particle-layer::after,
            .jets { animation: none !important; }
            body::before, body::after { animation: none !important; }
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
        {/* 3D parallax layers untuk Cosmic Fusion (back/mid/front + warp + orbital) */}
        <div className="theme-fx" aria-hidden="true">
          <div className="theme-fx-layer fx-back"></div>
          <div className="theme-fx-layer fx-mid"></div>
          <div className="theme-fx-layer fx-front"></div>
          {/* Planets: planet-1 = supernova explosion, planet-2 = mini spiral, planet-3 = hidden */}
          <div className="theme-planet planet-1"></div>
          <div className="theme-planet planet-2"></div>
          <div className="theme-planet planet-3"></div>
        </div>
        {/* Particle layer untuk shockwave rings */}
        <div className="particle-layer" aria-hidden="true"></div>
        <div className="jets" aria-hidden="true"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
