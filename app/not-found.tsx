// 404 — App Router özel "bulunamadı" sayfası.
// Bunun varlığı, Next 14.2'nin build sırasında pages-router varsayılan hata
// belgesini (<Html> içeren) statik üretmeye çalışmasını engeller.
import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
        background: 'var(--bg-1)', color: 'var(--fg-1)', textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.08em', color: 'var(--brand)' }}>
        404
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Sayfa bulunamadı</h1>
      <p style={{ fontSize: 15, color: 'var(--fg-3)', maxWidth: 380, lineHeight: 1.5 }}>
        Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
      </p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 8 }}>
        Ana sayfaya dön
      </Link>
    </main>
  );
}
