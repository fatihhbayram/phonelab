import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PhoneLab — iPhone & Apple Tamir Servisi İstanbul',
  description: 'iPhone, iPad ve Apple Watch tamir hizmetleri. Hızlı, güvenilir, garantili.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
