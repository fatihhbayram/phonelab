'use client';

// global-error — App Router kök hata sınırı. Kök layout'u DA değiştirir, bu yüzden
// kendi <html>/<body>'sini render eder. globals.css burada yüklü olmayabileceğinden
// renkler sabit (deep-dark tema) verilir.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
          background: '#0A0E14', color: '#F5F5F7', textAlign: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, letterSpacing: '0.08em', color: '#2BC2D4' }}>
          HATA
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
          Bir şeyler ters gitti
        </h1>
        <p style={{ fontSize: 15, color: '#8E8E93', maxWidth: 380, lineHeight: 1.5, margin: 0 }}>
          Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: 8, cursor: 'pointer', border: 'none', borderRadius: 9999,
            padding: '12px 24px', fontSize: 15, fontWeight: 600,
            background: '#2BC2D4', color: '#042027',
          }}
        >
          Tekrar dene
        </button>
      </body>
    </html>
  );
}
