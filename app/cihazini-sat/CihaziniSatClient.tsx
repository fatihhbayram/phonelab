'use client';

// /cihazini-sat — Cihaz Alım (Buyback) sihirbazı (client kabuğu).
// Slim sayfa-yerel header (logo → ana sayfa, tema toggle, WhatsApp) + BuybackWizard + mini footer.
// metadata, server component page.tsx'ten gelir (legal sayfa deseni).
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/Icon';
import BuybackWizard from '@/components/buyback/BuybackWizard';
import { WA_LINK } from '@/lib/site';
import './buyback.css';

export default function CihaziniSatPage() {
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
    <div className="bw-page">
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

      <section className="bw-head">
        <div className="bw-head-inner">
          <span className="bw-kicker">
            <Icon name="packageCheck" size={15} /> Cihazını Sat
          </span>
          <h1 className="bw-title">Apple cihazınız için WhatsApp’tan teklif alın</h1>
          <p className="bw-lead">
            Birkaç adımda modelinizi ve durumunu seçin; seçimleriniz WhatsApp mesajına madde madde
            eklensin. Size en uygun alım teklifini WhatsApp üzerinden hızlıca iletelim.
          </p>
        </div>
      </section>

      <main className="bw-body">
        <BuybackWizard />
      </main>

      <footer className="bw-foot">
        <div className="bw-foot-inner">
          <span>© {new Date().getFullYear()} PhoneLab · Maltepe, İstanbul</span>
          <Link href="/">Ana sayfaya dön</Link>
        </div>
      </footer>
    </div>
  );
}
