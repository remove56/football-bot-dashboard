export const metadata = { title: 'Football Bot Dashboard' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', sans-serif", background: '#0a0e1a', color: '#e5e7eb', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
