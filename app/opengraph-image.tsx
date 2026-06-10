// OG image (WhatsApp/sosyal link önizleme kartı) — next/og ile koddan üretilir.
// Logo + slogan kartı (proje sahibi kararı). 1200×630.
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const alt = 'PhoneLab — iPhone & Apple Tamir Servisi · Maltepe, İstanbul';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), 'public/assets/logo/phonelab_main_logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0B2740 0%, #14517A 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* logo (kendi açık zeminiyle temiz okunur kart) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="PhoneLab" width={560} height={302} style={{ borderRadius: 28 }} />
        <div
          style={{
            marginTop: 44,
            fontSize: 38,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}
        >
          iPhone &amp; Apple Tamir Servisi
        </div>
        <div style={{ marginTop: 12, fontSize: 26, color: '#4FE2EF', fontWeight: 600 }}>
          Maltepe, İstanbul · Orijinal parça · Aynı gün teslim
        </div>
        <div style={{ marginTop: 36, width: 120, height: 5, background: '#2BC2D4', borderRadius: 9999 }} />
      </div>
    ),
    { ...size },
  );
}
