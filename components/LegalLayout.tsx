'use client';

// LegalLayout — /gizlilik ve /kullanim-kosullari için ortak statik sayfa şablonu.
// cihazini-sat sayfasıyla aynı slim header (logo → ana sayfa, tema toggle, WhatsApp) + mini footer.
import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/Icon';
import { WA_LINK } from '@/lib/site';
import './legal.css';

export default function LegalLayout({
  title, updated, children,
}: { title: string; updated: string; children: ReactNode }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(t);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('phonelab-theme', next); } catch { /* yok say */ }
    setTheme(next);
  }

  return (
    <div className="lg-page">
      <header className="nav">
        <div className="container nav-inner">
          <Link href="/" aria-label="PhoneLab — Ana sayfa" style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              className="brand-logo"
              src="/assets/logo/phonelab_logo_dahk.png"
              alt="PhoneLab"
              width={168}
              height={112}
              priority
              style={{ height: 56, width: 'auto' }}
            />
          </Link>
          <div className="nav-actions">
            <Link href="/" className="nav-link" style={{ marginRight: 6 }}>← Ana sayfa</Link>
            <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
            </button>
            <a href={WA_LINK} target="_blank" rel="noreferrer" className="btn btn-wa btn-sm">
              <Icon name="whatsapp" size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main className="lg-body">
        <h1 className="lg-title">{title}</h1>
        <p className="lg-updated">Son güncelleme: {updated}</p>
        <div className="lg-content">{children}</div>
      </main>

      <footer className="lg-foot">
        <div className="lg-foot-inner">
          <span>© {new Date().getFullYear()} PhoneLab · Maltepe, İstanbul</span>
          <Link href="/">Ana sayfaya dön</Link>
        </div>
      </footer>
    </div>
  );
}
