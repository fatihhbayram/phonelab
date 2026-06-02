import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PhoneLab — iPhone & Apple Tamir Servisi İstanbul',
  description:
    'iPhone, iPad, Apple Watch ve Mac için uzman onarım. Orijinal parça, şeffaf fiyat, aynı gün teslim. Maltepe, İstanbul.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-theme="dark" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to avoid a light→dark flash */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('phonelab-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
