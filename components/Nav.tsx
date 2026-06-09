'use client';

// Nav — logo (gerçek PhoneLab PNG) + menü + tema toggle + WhatsApp
import Image from 'next/image';
import Icon from './Icon';
import { WA_LINK } from '@/lib/site';

export default function Nav({ theme, onThemeToggle, waLink = WA_LINK }: { theme: string; onThemeToggle: () => void; waLink?: string }) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#top" aria-label="PhoneLab" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            className="brand-logo"
            src="/assets/logo/phonelab_logo_dahk.png"
            alt="PhoneLab"
            width={168}
            height={112}
            priority
            style={{ height: 56, width: 'auto' }}
          />
        </a>
        <nav className="nav-links">
          <a href="#devices" className="nav-link">Cihazlar</a>
          <a href="#how" className="nav-link">Nasıl Çalışır</a>
          <a href="#estimator" className="nav-link">Fiyat Tahmini</a>
          <a href="/cihazini-sat" className="nav-link">Cihazını Sat</a>
          <a href="#about" className="nav-link">Hakkımızda</a>
          <a href="#contact" className="nav-link">İletişim</a>
        </nav>
        <div className="nav-actions">
          <button className="theme-toggle" onClick={onThemeToggle} aria-label="Tema">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          </button>
          <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa btn-sm">
            <Icon name="whatsapp" size={16} /> WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
