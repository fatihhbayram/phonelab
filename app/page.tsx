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
import { WA_NUMBER } from '@/lib/site';

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false });

// Admin panelinden (GET /api/price-rules.settings) gelen dinamik içerik.
interface SiteSettings {
  about: { title: string; body: string };
  contact: { phone: string; whatsapp: string; address: string; email: string };
  social: { instagram: string; google_maps: string };
}

// Ayar alanı boşsa mevcut statik metne düş — boş ayar sayfayı bozmasın.
const pick = (v: string | undefined, fallback: string) => (v && v.trim() ? v.trim() : fallback);

function waLinkFrom(number: string) {
  const n = (number || '').replace(/\D/g, '') || WA_NUMBER;
  return `https://wa.me/${n}?text=` + encodeURIComponent('Merhaba PhoneLab, cihazım için bilgi almak istiyorum.');
}

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
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  // 3D sahne yalnızca mount'tan sonra (client) render edilir; statik prerender
  // ağacına hiç girmez. Next 14.2'de ssr:false dinamik import'un build sırasında
  // "useContext null" hatası vermesini bu kesin olarak önler.
  const [mounted, setMounted] = useState(false);
  // Mobil (≤900px) veya prefers-reduced-motion: ağır Three.js/GLB yerine statik
  // poster göster (performans + erişilebilirlik). Poster yoksa glow/scrim graceful fallback.
  const [staticHero, setStaticHero] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('phonelab-theme') || 'dark';
    setTheme(saved);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)');
    const update = () => setStaticHero(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('phonelab-theme', theme);
  }, [theme]);

  // Admin panelinden yönetilen içerik (Hakkımızda / İletişim / bağlantılar).
  useEffect(() => {
    let active = true;
    fetch('/api/price-rules')
      .then((r) => r.json())
      .then((j) => { if (active && j?.data?.settings) setSettings(j.data.settings as SiteSettings); })
      .catch(() => { /* ayar gelmezse statik fallback'ler kullanılır */ });
    return () => { active = false; };
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Dinamik değerler — boşsa mevcut statik metne düşer.
  const aboutTitle = pick(settings?.about?.title, 'Laboratuvar disiplini, şeffaf servis');
  const aboutBody = pick(
    settings?.about?.body,
    'PhoneLab, Apple cihazları için kurulmuş bağımsız bir onarım atölyesidir. Maltepe’deki temiz çalışma ortamımızda her onarım mikroskop altında, kontrollü adımlarla yapılır.\n\nPazarlık yok, sürpriz ücret yok. Cihazınız teşhisten geçer, parça önerisi onayınıza sunulur, işlem ardından garanti ile teslim edilir.',
  );
  const aboutParas = aboutBody.split(/\n{2,}|\n/).map((s) => s.trim()).filter(Boolean);

  const phone = pick(settings?.contact?.phone, '+90 534 591 36 71');
  const addressLines = pick(
    settings?.contact?.address,
    'Cevizli Mah. Zuhal Cad. Ritim İstanbul\nA1 Blok No:46 A, İç Kapı No: 366\nMaltepe / İstanbul',
  ).split('\n').map((s) => s.trim()).filter(Boolean);
  const email = settings?.contact?.email?.trim() || '';

  const waLink = waLinkFrom(settings?.contact?.whatsapp || WA_NUMBER);
  const instagram = pick(settings?.social?.instagram, 'https://www.instagram.com/phonelab_tr');
  const googleMaps = pick(settings?.social?.google_maps, 'https://maps.google.com/?q=Ritim+İstanbul+Maltepe');

  return (
    <div id="top" style={{ background: 'var(--bg-1)', color: 'var(--fg-1)', minHeight: '100vh' }}>
      <Nav theme={theme} onThemeToggle={toggleTheme} waLink={waLink} />

      {/* HERO — image-as-canvas, metin sol-alt */}
      <section className="hero-canvas">
        <div className="hero-canvas-3d">
          {mounted ? (staticHero ? <HeroPoster /> : <ThreeBackground />) : null}
        </div>
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
            <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa-outline">
              <Icon name="whatsapp" size={18} /> WhatsApp ile İletişim
            </a>
          </div>
        </div>
      </section>

      {/* METRİK ŞERİDİ — Karar 14: gerçek Google verisi gelene kadar gizlendi.
          Metric bileşeni ve .metrics CSS'i KORUNUR (ileride geri açılabilir). */}

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

      {/* CİHAZINI SAT — convert band (buyback sihirbazına giriş) */}
      <section
        aria-label="Cihazını sat"
        style={{
          position: 'relative', overflow: 'hidden',
          borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)',
          background: 'radial-gradient(78% 140% at 50% 0%, var(--brand-soft) 0%, transparent 62%), var(--bg-1)',
        }}
      >
        <div
          className="container"
          style={{ padding: '84px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}
        >
          <div style={{ flex: '1 1 440px' }}>
            <span className="hero-kicker" style={{ marginBottom: 14 }}>
              <Icon name="packageCheck" size={15} /> Cihazını Sat
            </span>
            <h2 className="section-title" style={{ marginBottom: 14 }}>
              Eski Apple cihazınız <span style={{ color: 'var(--brand)' }}>anında nakite</span> dönüşsün
            </h2>
            <p className="section-lead" style={{ marginBottom: 0, maxWidth: 560 }}>
              Modelinizi ve durumunu birkaç adımda seçin, tahmini alım teklifinizi hemen görün. Beğenirseniz WhatsApp’tan tek dokunuşla tamamlayın.
            </p>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <a href="/cihazini-sat" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 28px' }}>
              Teklif al <Icon name="arrowRight" size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 04 · HAKKIMIZDA — off-grid offset + dossier */}
      <Section id="about">
        <SectionHead
          index="04" eyebrow="Hakkımızda" align="offset"
          title={aboutTitle}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="about-grid">
          <div>
            {aboutParas.map((p, i) => (
              <p key={i} style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--fg-2)', marginBottom: i < aboutParas.length - 1 ? 18 : 0 }}>{p}</p>
            ))}
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
            <ContactRow icon="mapPin" title="Adres" lines={addressLines} />
            <ContactRow icon="phone" title="Telefon" lines={[phone]} />
            {email ? <ContactRow icon="mail" title="E-posta" lines={[email]} /> : null}
            <a href={waLink} target="_blank" rel="noreferrer" className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', padding: '20px 22px' }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,211,102,0.14)', color: 'var(--whatsapp)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="whatsapp" size={22} /></span>
              <span>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg-1)' }}>WhatsApp</span>
                <span style={{ display: 'block', fontSize: 13.5, color: 'var(--fg-3)' }}>Görselini paylaş, 15 dk’da yanıt al</span>
              </span>
              <span style={{ marginLeft: 'auto', color: 'var(--fg-3)' }}><Icon name="arrowRight" size={18} /></span>
            </a>
            <ContactRow icon="clock" title="Çalışma saatleri" lines={['Pazartesi – Cumartesi', '09:00 – 19:00']} />
          </div>
          <MapCard mapsUrl={googleMaps} query={addressLines.join(', ')} />
        </div>
      </Section>

      {/* MINI — söz / kapanış (nefes) */}
      <section className="statement container">
        <p className="statement-text">Pazarlık yok, sürpriz ücret yok. <span className="hl">6 ay parça garantisi.</span></p>
        <p className="statement-sub">Cihazınız teşhisten geçer, onayınızla onarılır, garantiyle teslim edilir.</p>
      </section>

      <Footer instagram={instagram} googleMaps={googleMaps} waLink={waLink} />
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

// Mobil/erişilebilirlik için hero 3D yerine statik poster. Görsel
// public/assets/images/hero-poster.webp; yoksa alttaki glow/scrim graceful fallback kalır.
function HeroPoster() {
  return (
    <Image
      src="/assets/images/hero-poster.webp"
      alt=""
      aria-hidden
      fill
      priority
      sizes="100vw"
      style={{ objectFit: 'cover', objectPosition: 'center' }}
    />
  );
}

// Gerçek Google Maps embed (lazy iframe). Sorgu adresten üretilir → API anahtarı
// gerekmez. Kart çerçevesi + "Haritalar'da aç" linki korunur.
function MapCard({ mapsUrl, query }: { mapsUrl: string; query: string }) {
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=tr&z=16&output=embed`;
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 320 }}>
      <div style={{ position: 'relative', flex: 1, background: 'var(--bg-3)', minHeight: 240 }}>
        <iframe
          title="PhoneLab konum haritası"
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
      <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ margin: 16, justifyContent: 'center' }}>
        <Icon name="mapPin" size={16} /> Google Haritalar’da aç
      </a>
    </div>
  );
}

function Footer({ instagram, googleMaps, waLink }: { instagram: string; googleMaps: string; waLink: string }) {
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
              <FooterSocial icon="instagram" href={instagram} />
              <FooterSocial icon="youtube" href="https://www.youtube.com/@phonelabtr" />
              <FooterSocial icon="google" href={googleMaps} />
              <FooterSocial icon="whatsapp" href={waLink} />
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
            <a href="/gizlilik" style={{ color: 'var(--fg-3)' }}>Gizlilik</a>
            <a href="/kullanim-kosullari" style={{ color: 'var(--fg-3)' }}>Kullanım koşulları</a>
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
