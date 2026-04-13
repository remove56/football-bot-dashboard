export const metadata = { title: 'Football Bot Dashboard' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fireGlow {
            0%, 100% { opacity: 0.6; transform: translateY(0) scale(1); }
            50% { opacity: 1; transform: translateY(-5px) scale(1.02); }
          }
          @keyframes emberFloat {
            0% { transform: translateY(100vh) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 0.5; }
            100% { transform: translateY(-20vh) translateX(50px); opacity: 0; }
          }
          body::before {
            content: '';
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30vh;
            background: radial-gradient(ellipse at bottom,
              rgba(220, 38, 38, 0.15) 0%,
              rgba(249, 115, 22, 0.08) 20%,
              rgba(251, 146, 60, 0.03) 40%,
              transparent 70%);
            pointer-events: none;
            z-index: 1;
            animation: fireGlow 3s ease-in-out infinite;
          }
          body::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image:
              radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.05) 0%, transparent 30%),
              radial-gradient(circle at 80% 90%, rgba(249, 115, 22, 0.04) 0%, transparent 25%),
              radial-gradient(circle at 50% 100%, rgba(251, 146, 60, 0.03) 0%, transparent 35%);
            pointer-events: none;
            z-index: 0;
          }
          /* Scrollbar fiery theme */
          ::-webkit-scrollbar { width: 10px; height: 10px; }
          ::-webkit-scrollbar-track { background: #0c0a09; }
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #7c2d12, #451a03);
            border-radius: 5px;
            border: 1px solid #1c1917;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #dc2626, #7c2d12);
          }
          input:focus, select:focus, textarea:focus {
            border-color: #f97316 !important;
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2) !important;
          }
          button:hover, [role="button"]:hover {
            filter: brightness(1.15);
            transform: translateY(-1px);
          }
        `}} />
      </head>
      <body style={{
        margin: 0,
        fontFamily: "'Segoe UI', sans-serif",
        background: 'linear-gradient(180deg, #0a0400 0%, #0c0a09 50%, #1a0a00 100%)',
        color: '#fef3c7',
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
