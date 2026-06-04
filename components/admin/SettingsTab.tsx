'use client';

// Ayarlar sekmesi — Hakkımızda / İletişim / Sosyal bağlantılar.
//   Veri:   GET /api/price-rules.settings
//   Kaydet: PUT /api/admin/settings → {about, contact, social}
// Doğrulama (backend ile aynı): başlık+gövde zorunlu, whatsapp ^\d{8,15}$,
// e-posta boş ya da geçerli format.
import { useState, useEffect, useCallback, FormEvent } from 'react';
import { adminFetch, ApiError } from '@/lib/adminApi';

interface Settings {
  about: { title: string; body: string };
  contact: { phone: string; whatsapp: string; address: string; email: string };
  social: { instagram: string; google_maps: string };
}

const EMPTY: Settings = {
  about: { title: '', body: '' },
  contact: { phone: '', whatsapp: '', address: '', email: '' },
  social: { instagram: '', google_maps: '' },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SettingsTab({ onAuthExpired }: { onAuthExpired: (e: unknown) => void }) {
  const [s, setS] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    return fetch('/api/price-rules')
      .then((r) => r.json())
      .then((j) => {
        const cur = j.data?.settings as Settings | undefined;
        if (cur) setS({ about: { ...EMPTY.about, ...cur.about }, contact: { ...EMPTY.contact, ...cur.contact }, social: { ...EMPTY.social, ...cur.social } });
      })
      .catch(() => setLoadError('Ayarlar yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function up<K extends keyof Settings>(section: K, field: keyof Settings[K], value: string) {
    setS((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }) as Settings);
  }

  function validate(): string | null {
    if (!s.about.title.trim()) return 'Hakkımızda başlığı zorunlu.';
    if (s.about.title.length > 120) return 'Başlık en fazla 120 karakter.';
    if (!s.about.body.trim()) return 'Hakkımızda metni zorunlu.';
    if (s.about.body.length > 5000) return 'Metin en fazla 5000 karakter.';
    const wa = s.contact.whatsapp.trim();
    if (!/^\d{8,15}$/.test(wa)) return 'WhatsApp: sadece rakam, ülke koduyla (8–15 hane).';
    const email = s.contact.email.trim();
    if (email && !EMAIL_RE.test(email)) return 'Geçersiz e-posta adresi.';
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    const v = validate();
    if (v) { setFormError(v); return; }

    const body: Settings = {
      about: { title: s.about.title.trim(), body: s.about.body.trim() },
      contact: {
        phone: s.contact.phone.trim(),
        whatsapp: s.contact.whatsapp.trim(),
        address: s.contact.address.trim(),
        email: s.contact.email.trim(),
      },
      social: { instagram: s.social.instagram.trim(), google_maps: s.social.google_maps.trim() },
    };

    setSaving(true);
    try {
      await adminFetch('/api/admin/settings', { method: 'PUT', body });
      setSuccess('Ayarlar kaydedildi.');
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message);
      else { onAuthExpired(err); setFormError('Kaydedilemedi.'); }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-empty">Yükleniyor…</div>;
  if (loadError) return <div className="admin-alert admin-alert-error">{loadError}</div>;

  return (
    <form onSubmit={onSubmit} className="admin-grid">
      <section className="admin-panel" style={{ gridColumn: '1 / -1' }}>
        {formError && <div className="admin-alert admin-alert-error">{formError}</div>}
        {success && <div className="admin-alert admin-alert-ok">{success}</div>}
      </section>

      {/* Hakkımızda */}
      <section className="admin-panel">
        <h2 className="admin-panel-title">Hakkımızda</h2>
        <div className="admin-form">
          <label className="admin-field-group">
            <span className="admin-label">Başlık</span>
            <input className="field" maxLength={120} value={s.about.title}
              onChange={(e) => up('about', 'title', e.target.value)} />
          </label>
          <label className="admin-field-group">
            <span className="admin-label">Metin</span>
            <textarea className="field admin-textarea" maxLength={5000} rows={6} value={s.about.body}
              onChange={(e) => up('about', 'body', e.target.value)} />
            <span className="admin-hint">{s.about.body.length}/5000</span>
          </label>
        </div>
      </section>

      {/* İletişim */}
      <section className="admin-panel">
        <h2 className="admin-panel-title">İletişim</h2>
        <div className="admin-form">
          <label className="admin-field-group">
            <span className="admin-label">Telefon</span>
            <input className="field" maxLength={40} placeholder="+90 5xx xxx xx xx" value={s.contact.phone}
              onChange={(e) => up('contact', 'phone', e.target.value)} />
          </label>
          <label className="admin-field-group">
            <span className="admin-label">WhatsApp numarası</span>
            <input className="field" inputMode="numeric" placeholder="905345913671"
              value={s.contact.whatsapp}
              onChange={(e) => up('contact', 'whatsapp', e.target.value.replace(/[^\d]/g, ''))} />
            <span className="admin-hint">Sadece rakam, ülke koduyla (8–15 hane).</span>
          </label>
          <label className="admin-field-group">
            <span className="admin-label">Adres</span>
            <input className="field" maxLength={300} value={s.contact.address}
              onChange={(e) => up('contact', 'address', e.target.value)} />
          </label>
          <label className="admin-field-group">
            <span className="admin-label">E-posta <span className="admin-optional">(opsiyonel)</span></span>
            <input className="field" type="email" maxLength={120} value={s.contact.email}
              onChange={(e) => up('contact', 'email', e.target.value)} />
          </label>
        </div>
      </section>

      {/* Sosyal */}
      <section className="admin-panel">
        <h2 className="admin-panel-title">Bağlantılar</h2>
        <div className="admin-form">
          <label className="admin-field-group">
            <span className="admin-label">Instagram</span>
            <input className="field" maxLength={300} placeholder="https://instagram.com/…" value={s.social.instagram}
              onChange={(e) => up('social', 'instagram', e.target.value)} />
          </label>
          <label className="admin-field-group">
            <span className="admin-label">Google Haritalar</span>
            <input className="field" maxLength={500} placeholder="https://maps.google.com/…" value={s.social.google_maps}
              onChange={(e) => up('social', 'google_maps', e.target.value)} />
          </label>
        </div>
      </section>

      <section className="admin-panel" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
          {saving ? 'Kaydediliyor…' : 'Ayarları kaydet'}
        </button>
      </section>
    </form>
  );
}
