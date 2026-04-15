export const metadata = { title: 'Football Bot Dashboard' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* Background obsidian dengan subtle crystal pattern */
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image:
              /* Crystal facets — ice blue glows */
              radial-gradient(circle at 15% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 25%),
              radial-gradient(circle at 85% 15%, rgba(14, 165, 233, 0.06) 0%, transparent 30%),
              radial-gradient(circle at 25% 80%, rgba(34, 211, 238, 0.05) 0%, transparent 28%),
              radial-gradient(circle at 80% 85%, rgba(8, 145, 178, 0.07) 0%, transparent 30%),
              /* Sharp crystal lines */
              linear-gradient(135deg, transparent 48%, rgba(103, 232, 249, 0.02) 49%, rgba(103, 232, 249, 0.02) 51%, transparent 52%),
              linear-gradient(45deg, transparent 48%, rgba(103, 232, 249, 0.015) 49%, rgba(103, 232, 249, 0.015) 51%, transparent 52%);
            background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 120px 120px, 120px 120px;
            pointer-events: none;
            z-index: 0;
          }
          /* Icy top border glow */
          body::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg,
              transparent 0%,
              rgba(6, 182, 212, 0.4) 20%,
              rgba(103, 232, 249, 0.6) 50%,
              rgba(6, 182, 212, 0.4) 80%,
              transparent 100%);
            pointer-events: none;
            z-index: 99;
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
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
        `}} />
      </head>
      <body style={{
        margin: 0,
        fontFamily: "'Segoe UI', 'Inter', sans-serif",
        background: 'linear-gradient(180deg, #020617 0%, #0f172a 40%, #0c1220 70%, #020617 100%)',
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
