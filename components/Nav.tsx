'use client';

// Nav — logo (gerçek PhoneLab PNG) + menü + tema toggle + WhatsApp
// Mobil (≤900px): hamburger butonu + tam ekran sheet (scroll kilidi, Esc/backdrop kapatma).
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Icon from './Icon';
import { WA_LINK } from '@/lib/site';

const LINKS = [
  { href: '#devices', label: 'Cihazlar' },
  { href: '#how', label: 'Nasıl Çalışır' },
  { href: '#estimator', label: 'Fiyat Tahmini' },
  { href: '/cihazini-sat', label: 'Cihazını Sat' },
  { href: '#about', label: 'Hakkımızda' },
  { href: '#contact', label: 'İletişim' },
];

export default function Nav({ theme, onThemeToggle, waLink = WA_LINK }: { theme: string; onThemeToggle: () => void; waLink?: string }) {
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Sheet açıkken: scroll kilidi + Esc + focus trap (açılışta ilk linke odak,
  // kapanışta burger'a dönüş, Tab sheet içinde döner).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const sheet = sheetRef.current;
    const focusables: HTMLElement[] = sheet
      ? (Array.from(sheet.querySelectorAll('a[href], button:not([disabled])')) as HTMLElement[])
      : [];
    // açılışta ilk gezinme linkine odak
    (sheet?.querySelector<HTMLElement>('.nav-sheet-link') ?? focusables[0])?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'Tab' && focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      burgerRef.current?.focus();   // kapanışta odağı burger'a geri ver
    };
  }, [open]);

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
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={onThemeToggle}
            aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          </button>
          <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa btn-sm nav-wa">
            <Icon name="whatsapp" size={16} /> WhatsApp
          </a>
          <button
            ref={burgerRef}
            className="nav-burger"
            onClick={() => setOpen(true)}
            aria-label="Menüyü aç"
            aria-expanded={open}
            aria-controls="nav-sheet"
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>

      {/* MOBİL SHEET */}
      {open && (
        <div className="nav-sheet-backdrop" onClick={() => setOpen(false)}>
          <div
            ref={sheetRef}
            id="nav-sheet"
            className="nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Menü"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nav-sheet-head">
              <span className="nav-sheet-title">Menü</span>
              <button className="nav-burger" onClick={() => setOpen(false)} aria-label="Menüyü kapat">
                <Icon name="close" size={22} />
              </button>
            </div>
            <nav className="nav-sheet-links">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="nav-sheet-link" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="nav-sheet-cta">
              <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa" onClick={() => setOpen(false)}>
                <Icon name="whatsapp" size={18} /> WhatsApp
              </a>
              <a href="/cihazini-sat" className="btn btn-primary" onClick={() => setOpen(false)}>
                Cihazını Sat
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
