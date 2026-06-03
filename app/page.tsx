'use client';

// PhoneLab — Ana sayfa. Faz 1 art-direction (kalıp-kırma):
//  • Hero: image-as-canvas (3D tuval + metin sol-alt), badge/stat kaldırıldı
//  • Precision/dossier omurga: bölüm indeks no (01—05) + hairline + monospace
//  • Bölüm başlığı yerleşimi çeşitlendi (left / center / right / offset)
//  • Tek "Oversized Metrics Strip" (hero + about stat'ları birleşti)
//  • Mini minimalist "söz" bölümü (nefes/kapanış)
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Icon, { IconName } from '@/components/Icon';
import Nav from '@/components/Nav';
import Estimator from '@/components/Estimator';
import { WA_LINK } from '@/lib/site';

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false });

const DEVICES = [
  { icon: 'smartphone' as IconName, name: 'iPhone', repairs: ['Ekran', 'Pil', 'Arka cam', 'Kamera', 'Şarj girişi'], from: '800 ₺’den başlar' },
  { icon: 'tablet' as IconName, name: 'iPad', repairs: ['Ekran', 'Dokunmatik', 'Pil', 'Şarj girişi'], from: '1.300 ₺’den başlar' },
  { icon: 'watch' as IconName, name: 'Apple Watch', repairs: ['Ekran', 'Cam', 'Pil', 'Şarj sorunu'], from: '700 ₺’den başlar' },
  { icon: 'laptop' as IconName, name: 'Mac', repairs: ['Ekran', 'Klavye', 'Pil', 'Anakart', 'SSD'], from: '1.800 ₺’den başlar' },
];

const STEPS = [
  { n: '1', icon: 'truck' as IconName, title: 'Getirin', desc: 'Maltepe’deki atölyemize gelin veya kargo ile gönderin. Ücretsiz diagnostik ile cihazınızı 15 dakikada inceleriz.' },
  { n: '2', icon: 'wrench' as IconName, title: 'Tamir Edelim', desc: 'Onayınızdan sonra orijinal veya sertifikalı OEM parça ile onarım. Pil 45, ekran 90 dakikada hazır.' },
  { n: '3', icon: 'packageCheck' as IconName, title: 'Teslim Alın', desc: 'Onarım tamamlandığında SMS ile haber veririz. 6 ay parça garantisi ile cihazınızı teslim alırsınız.' },
];

const PROOF = [
  { icon: 'sparkle' as IconName, text: 'Orijinal veya sertifikalı OEM parça' },
  { icon: 'clock' as IconName, text: 'Aynı gün teslim — pil 45 dk, ekran 90 dk' },
  { icon: 'shield' as IconName, text: '6 ay parça garantisi' },
];

const DOSSIER = [
  { k: 'Konum', v: 'Maltepe, İstanbul' },
  { k: 'Uzmanlık', v: 'Apple cihaz onarımı' },
  { k: 'Yöntem', v: 'Mikroskop altında, kontrollü' },
  { k: 'Garanti', v: '6 ay parça' },
];

export default function Home() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('phonelab-theme') || 'dark';
    setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('phonelab-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div id="top" style={{ background: 'var(--bg-1)', color: 'var(--fg-1)', minHeight: '100vh' }}>
      <Nav theme={theme} onThemeToggle={toggleTheme} />

      {/* HERO — image-as-canvas, metin sol-alt */}
      <section className="hero-canvas">
        <div className="hero-canvas-3d"><ThreeBackground /></div>
        <div className="hero-3d-glow" />
        <div className="hero-scrim" />
        <div className="hero-content container">
          <span className="hero-kicker">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
            İstanbul · Maltepe — Apple onarım laboratuvarı
          </span>
          <h1 className="hero-title">iPhone’unuz<br /><span className="accent">güvende.</span></h1>
          <p className="hero-lead">iPhone, iPad, Apple Watch ve Mac için uzman onarım. Orijinal parça, şeffaf fiyat, aynı gün teslim.</p>
          <div className="hero-cta-row">
            <a href="#estimator" className="btn btn-primary">Fiyat tahmini al <Icon name="arrowRight" size={16} /></a>
            <a href={WA_LINK} target="_blank" rel="noreferrer" className="btn btn-wa">
              <Icon name="whatsapp" size={18} /> WhatsApp ile İletişim
            </a>
          </div>
        </div>
      </section>

      {/* METRİK ŞERİDİ — güven (hero + about stat'ları birleşti) */}
      <section className="metrics" aria-label="Güven göstergeleri">
        <div className="container metrics-inner">
          <Metric k="4.9" unit="★" l="Google · 320+ yorum" />
          <Metric k="12.000+" l="Tamamlanan onarım" />
          <Metric k="8" unit=" yıl" l="Sektör tecrübesi" />
          <Metric k="%98" l="Müşteri memnuniyeti" />
        </div>
      </section>

      {/* 01 · CİHAZLAR — left lead */}
      <Section id="devices" alt>
        <SectionHead
          index="01" eyebrow="Cihazlar"
          title="Tüm Apple cihazlarına servis"
          lead="Her cihaz laboratuvarda tam diagnostikten geçer. Değişmesi gereken parçalar önceden bildirilir — onayınız olmadan işlem başlamaz."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {DEVICES.map((d) => (
            <div key={d.name} className="device-card">
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--brand-ring)' }}>
                <Icon name={d.icon} size={26} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 12 }}>{d.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {d.repairs.map((r) => (
                    <span key={r} style={{ fontSize: 12.5, color: 'var(--fg-2)', background: 'var(--bg-3)', padding: '4px 10px', borderRadius: 9999, border: '1px solid var(--line-1)' }}>{r}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{d.from}</span>
                <a href="#estimator" style={{ color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13.5, fontWeight: 600 }}>Fiyat <Icon name="arrowRight" size={14} /></a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 02 · NASIL ÇALIŞIR — center */}
      <Section id="how">
        <SectionHead
          index="02" eyebrow="Nasıl Çalışır" align="center"
          title="Üç adımda onarım"
          lead="Getir → Tamir → Teslim Al. Süreç boyunca her aşamada bilgilendirilirsiniz."
        />
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.n} className="card" style={{ padding: '32px 28px' }}>
              <div className="step-num">{s.n}</div>
              <div style={{ color: 'var(--brand)', marginBottom: 14 }}><Icon name={s.icon} size={26} /></div>
              <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--fg-2)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* 03 · FİYAT TAHMİN — sağ caption + sol görsel (estimator) */}
      <Section id="estimator" alt>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 64, alignItems: 'center' }} className="estimator-grid">
          <Estimator />
          <div>
            <SectionHead
              index="03" eyebrow="Fiyat Tahmini" align="right"
              title="Cihazınızı seçin. Tahmini görün."
              lead="Model ve arıza türünü seçtiğinizde anında tahmini aralığı görürsünüz. Kesin fiyat için bilgilerinizi WhatsApp üzerinden paylaşın — teknisyenimiz 15 dakika içinde yanıtlar."
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28, alignItems: 'flex-end' }}>
              {PROOF.map((p) => (
                <div key={p.text} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15.5, color: 'var(--fg-2)' }}>
                  <span style={{ color: 'var(--brand)' }}><Icon name={p.icon} size={20} /></span>{p.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 04 · HAKKIMIZDA — off-grid offset + dossier */}
      <Section id="about">
        <SectionHead
          index="04" eyebrow="Hakkımızda" align="offset"
          title="Laboratuvar disiplini, şeffaf servis"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="about-grid">
          <div>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--fg-2)', marginBottom: 18 }}>PhoneLab, Apple cihazları için kurulmuş bağımsız bir onarım atölyesidir. Maltepe’deki temiz çalışma ortamımızda her onarım mikroskop altında, kontrollü adımlarla yapılır.</p>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--fg-2)' }}>Pazarlık yok, sürpriz ücret yok. Cihazınız teşhisten geçer, parça önerisi onayınıza sunulur, işlem ardından garanti ile teslim edilir.</p>
          </div>
          <div className="dossier">
            {DOSSIER.map((d) => (
              <div key={d.k} className="dossier-row">
                <span className="dossier-k">{d.k}</span>
                <span className="dossier-v">{d.v}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 05 · İLETİŞİM — left + editorial side-image (map) */}
      <Section id="contact" alt>
        <SectionHead
          index="05" eyebrow="İletişim"
          title="Maltepe, İstanbul"
          lead="Randevu ile gelin; cihazınızı 15 dakikada inceleyelim. Kargo ile de onarım kabul ediyoruz."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 32, alignItems: 'stretch' }} className="contact-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ContactRow icon="mapPin" title="Adres" lines={['Cevizli Mah. Zuhal Cad. Ritim İstanbul', 'A1 Blok No:46 A, İç Kapı No: 366', 'Maltepe / İstanbul']} />
            <ContactRow icon="phone" title="Telefon" lines={['+90 534 591 36 71']} />
            <a href={WA_LINK} target="_blank" rel="noreferrer" className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', padding: '20px 22px' }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,211,102,0.14)', color: 'var(--whatsapp)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="whatsapp" size={22} /></span>
              <span>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg-1)' }}>WhatsApp</span>
                <span style={{ display: 'block', fontSize: 13.5, color: 'var(--fg-3)' }}>Görselini paylaş, 15 dk’da yanıt al</span>
              </span>
              <span style={{ marginLeft: 'auto', color: 'var(--fg-3)' }}><Icon name="arrowRight" size={18} /></span>
            </a>
            <ContactRow icon="clock" title="Çalışma saatleri" lines={['Pazartesi – Cumartesi', '09:00 – 19:00']} />
          </div>
          <MapCard />
        </div>
      </Section>

      {/* MINI — söz / kapanış (nefes) */}
      <section className="statement container">
        <p className="statement-text">Pazarlık yok, sürpriz ücret yok. <span className="hl">6 ay parça garantisi.</span></p>
        <p className="statement-sub">Cihazınız teşhisten geçer, onayınızla onarılır, garantiyle teslim edilir.</p>
      </section>

      <Footer />
    </div>
  );
}

function Metric({ k, unit, l }: { k: string; unit?: string; l: string }) {
  return (
    <div className="metric">
      <div className="metric-k">{k}{unit ? <span className="unit">{unit}</span> : null}</div>
      <div className="metric-l">{l}</div>
    </div>
  );
}

function ContactRow({ icon, title, lines, muted }: { icon: IconName; title: string; lines: string[]; muted?: boolean }) {
  return (
    <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '20px 22px' }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--brand-ring)' }}><Icon name={icon} size={22} /></span>
      <div>
        <div style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</div>
        {lines.map((ln, i) => (
          <div key={i} style={{ fontSize: 15, lineHeight: 1.5, color: muted ? 'var(--fg-3)' : 'var(--fg-1)' }}>{ln}</div>
        ))}
      </div>
    </div>
  );
}

function MapCard() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 320 }}>
      <div style={{ position: 'relative', flex: 1, background: 'var(--bg-3)', minHeight: 240 }}>
        <svg width="100%" height="100%" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
          <rect width="600" height="360" fill="var(--bg-3)" />
          {[...Array(7)].map((_, i) => (<line key={'h' + i} x1="0" y1={i * 52 + 20} x2="600" y2={i * 52 + 20} stroke="var(--line-1)" strokeWidth="1.5" />))}
          {[...Array(11)].map((_, i) => (<line key={'v' + i} x1={i * 56 + 20} y1="0" x2={i * 56 + 20} y2="360" stroke="var(--line-1)" strokeWidth="1.5" />))}
          <path d="M-20 250 L180 200 L300 240 L460 180 L640 220" fill="none" stroke="var(--brand)" strokeOpacity="0.35" strokeWidth="6" />
          <path d="M120 -20 L160 120 L140 240 L200 380" fill="none" stroke="var(--line-2)" strokeWidth="8" />
          <path d="M380 -20 L360 140 L420 260 L400 380" fill="none" stroke="var(--line-2)" strokeWidth="8" />
          <circle cx="300" cy="180" r="42" fill="var(--brand-soft)" />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-100%)', color: 'var(--brand)', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))' }}>
          <Icon name="mapPin" size={40} />
        </div>
      </div>
      <a href="https://maps.google.com/?q=Ritim+İstanbul+Maltepe" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ margin: 16, justifyContent: 'center' }}>
        <Icon name="mapPin" size={16} /> Google Haritalar’da aç
      </a>
    </div>
  );
}

function Footer() {
  const cols = [
    { h: 'Cihazlar', links: [
      { t: 'iPhone', href: '#devices' }, { t: 'iPad', href: '#devices' },
      { t: 'Apple Watch', href: '#devices' }, { t: 'Mac', href: '#devices' },
    ] },
    { h: 'Servis', links: [
      { t: 'Fiyat tahmini', href: '#estimator' }, { t: 'Nasıl çalışır', href: '#how' },
      { t: 'Garanti', href: '#about' }, { t: 'Kargo ile onarım', href: '#contact' },
    ] },
    { h: 'Kurumsal', links: [
      { t: 'Hakkımızda', href: '#about' }, { t: 'İletişim', href: '#contact' },
    ] },
  ];
  return (
    <footer style={{ borderTop: '1px solid var(--line-1)', background: 'var(--bg-1)', paddingTop: 64, paddingBottom: 40 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3, 1fr)', gap: 40, marginBottom: 48 }} className="footer-grid">
          <div>
            <Image className="footer-logo" src="/assets/logo/phonelab_logo_dahk.png" alt="PhoneLab" width={144} height={96} style={{ height: 48, width: 'auto' }} />
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--fg-3)', marginTop: 16, maxWidth: 280 }}>Apple cihazları için bağımsız, uzman onarım servisi. Maltepe, İstanbul.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <FooterSocial icon="instagram" href="https://www.instagram.com/phonelab_tr" />
              <FooterSocial icon="youtube" href="https://www.youtube.com/@phonelabtr" />
              <FooterSocial icon="google" />
              <FooterSocial icon="whatsapp" href={WA_LINK} />
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.h}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {c.links.map((l) => <a key={l.t} href={l.href} style={{ fontSize: 14, color: 'var(--fg-3)' }} className="nav-link">{l.t}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--line-1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--fg-3)' }}>
          <div>© 2026 PhoneLab · Maltepe, İstanbul</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#" style={{ color: 'var(--fg-3)' }}>Gizlilik</a>
            <a href="#" style={{ color: 'var(--fg-3)' }}>Kullanım koşulları</a>
          </div>
        </div>
        {/* Geliştirici kredisi */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 14, color: 'var(--fg-3)' }}>
          <span>Developed by</span>
          <FooterSocial icon="github" href="https://github.com/fatihhbayram" />
          <FooterSocial icon="linkedin" href="https://www.linkedin.com/in/fatihhbayramm/" />
          <a href="mailto:adentechio.fb@gmail.com" style={{ color: 'var(--brand)', fontWeight: 700, letterSpacing: '-0.01em' }}>adentechio</a>
        </div>
      </div>
    </footer>
  );
}

function FooterSocial({ icon, href = '#' }: { icon: IconName; href?: string }) {
  return (
    <a href={href} target={href !== '#' ? '_blank' : undefined} rel="noreferrer" className={`social-chip social-chip--${icon}`} aria-label={icon}>
      <Icon name={icon} size={17} />
    </a>
  );
}

function SectionHead({
  index, eyebrow, title, lead, align = 'left',
}: { index: string; eyebrow: string; title: string; lead?: string; align?: 'left' | 'center' | 'right' | 'offset' }) {
  return (
    <div className={`shead shead--${align}`}>
      <div className="shead-top">
        <span className="shead-index">{index}</span>
        <span className="shead-eyebrow">{eyebrow}</span>
        <span className="shead-rule" />
      </div>
      <h2 className="section-title">{title}</h2>
      {lead ? <p className="section-lead">{lead}</p> : null}
    </div>
  );
}

function Section({ id, alt, children, style }: { id?: string; alt?: boolean; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section id={id} className={`section ${alt ? 'section-alt' : ''}`} style={style}>
      <div className="container">{children}</div>
    </section>
  );
}
