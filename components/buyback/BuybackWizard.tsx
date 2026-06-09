'use client';

// BuybackWizard — /cihazini-sat çok adımlı cihaz alım sihirbazı.
//   Meta:     GET  /api/buyback/calculate   → options + uygun model listesi (açılışta 1 kez)
//   Teklif:   POST /api/buyback/calculate   → her seçim sonrası canlı teklif aralığı (DB'ye yazmaz)
//   Gönder:   POST /api/buyback/submit      → KVKK onaylı kayıt + whatsapp_url'e yönlendirme
// Seçenek key'leri ve modeller metadata'dan gelir; frontend'de sabitleme yok.
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import OptionGroup, { type BuybackOption } from './OptionGroup';

interface BuybackOptions {
  storage: BuybackOption[];
  screen: BuybackOption[];
  battery: BuybackOption[];
  cosmetic: BuybackOption[];
  box_invoice: BuybackOption[];
}
interface ModelRow { model: string; price_group: string }
interface Meta { currency: string; options: BuybackOptions; models: ModelRow[] }

interface Quote {
  model: string;
  currency: string;
  offered_price_min: number;
  offered_price_max: number;
  labels: Record<string, string>;
}
interface SubmitResult {
  id: number;
  model: string;
  offered_price_min: number;
  offered_price_max: number;
  currency: string;
  whatsapp_url: string;
}

interface Selection {
  model: string;
  storage: string;
  screen_status: string;
  battery_status: string;
  cosmetic_status: string;
  has_box_invoice: boolean;
}

const STEPS = [
  { title: 'Cihaz kimliği', desc: 'Modelinizi ve depolama kapasitesini seçin.' },
  { title: 'Durum & donanım', desc: 'Ekran ve batarya durumunu işaretleyin.' },
  { title: 'Kozmetik & belgeler', desc: 'Kasa görünümü ve kutu/fatura bilgisi.' },
  { title: 'Teklif & iletişim', desc: 'Teklifinizi görün, sizi arayalım.' },
];

function categoryOf(model: string): string {
  if (model.startsWith('iPhone')) return 'iPhone';
  if (model.startsWith('iPad')) return 'iPad';
  if (model.startsWith('Apple Watch')) return 'Apple Watch';
  return 'Diğer';
}

function fmt(v: number): string {
  return new Intl.NumberFormat('tr-TR').format(v);
}

const PHONE_RE = /^[0-9+\s()-]{7,20}$/;

export default function BuybackWizard() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [metaError, setMetaError] = useState(false);

  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selection | null>(null);

  // Canlı teklif
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // İletişim formu
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [kvkk, setKvkk] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState<SubmitResult | null>(null);

  // --- metadata yükle ---
  useEffect(() => {
    let active = true;
    fetch('/api/buyback/calculate')
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        const m = j.data as Meta;
        setMeta(m);
        const firstModel = m.models[0]?.model ?? '';
        setSel({
          model: firstModel,
          storage: m.options.storage[0]?.key ?? 'na',
          screen_status: m.options.screen[0]?.key ?? '',
          battery_status: m.options.battery[0]?.key ?? '',
          cosmetic_status: m.options.cosmetic[0]?.key ?? '',
          has_box_invoice: false,
        });
      })
      .catch(() => { if (active) setMetaError(true); });
    return () => { active = false; };
  }, []);

  // model → kategori türetme
  const { categories, modelsByCat } = useMemo(() => {
    const modelsByCat: Record<string, string[]> = {};
    const categories: string[] = [];
    if (meta) {
      for (const { model } of meta.models) {
        const cat = categoryOf(model);
        if (!modelsByCat[cat]) { modelsByCat[cat] = []; categories.push(cat); }
        modelsByCat[cat].push(model);
      }
    }
    return { categories, modelsByCat };
  }, [meta]);

  const category = sel ? categoryOf(sel.model) : '';

  // --- canlı teklif: seçim değişince POST /calculate ---
  const selKey = sel ? JSON.stringify(sel) : '';
  const reqId = useRef(0);
  useEffect(() => {
    if (!sel || !sel.model) return;
    const id = ++reqId.current;
    setQuoteLoading(true);
    const ctrl = new AbortController();
    fetch('/api/buyback/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sel),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((j) => { if (id === reqId.current) { setQuote(j.data as Quote); setQuoteLoading(false); } })
      .catch((e) => {
        if (e?.name === 'AbortError') return;
        if (id === reqId.current) { setQuote(null); setQuoteLoading(false); }
      });
    return () => ctrl.abort();
  }, [selKey, sel]);

  const patch = useCallback((p: Partial<Selection>) => {
    setSel((s) => (s ? { ...s, ...p } : s));
  }, []);

  // --- form doğrulama ---
  const nameErr = name.trim().length < 2 ? 'Ad en az 2 karakter olmalı.' : '';
  const phoneErr = !PHONE_RE.test(phone.trim()) ? 'Geçerli bir telefon numarası girin.' : '';
  const canSubmit = !nameErr && !phoneErr && kvkk && !submitting;

  async function onSubmit() {
    setTouched(true);
    setSubmitError('');
    if (!sel || nameErr || phoneErr || !kvkk) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/buyback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sel,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          kvkk_consent: true,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(j?.error ?? 'Talep gönderilemedi. Lütfen tekrar deneyin.');
        return;
      }
      const result = j.data as SubmitResult;
      setDone(result);
      // WhatsApp'a yönlendir (yeni sekme)
      if (result.whatsapp_url) window.open(result.whatsapp_url, '_blank', 'noopener');
    } catch {
      setSubmitError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  }

  if (metaError) {
    return (
      <div className="bw-error">
        Cihaz alım hizmeti şu an yüklenemedi. Lütfen WhatsApp’tan bizimle iletişime geçin.
      </div>
    );
  }
  if (!meta || !sel) {
    return <div className="bw-loading">Cihaz alım sihirbazı yükleniyor…</div>;
  }

  const o = meta.options;
  const models = modelsByCat[category] ?? [];

  return (
    <div className="bw-grid">
      {/* SOL: adım gövdesi */}
      <div>
        <div className="bw-panel">
          {done ? (
            <SuccessView result={done} currency={meta.currency} />
          ) : (
            <>
              <div className="bw-step-head">
                <span className="bw-step-index">ADIM {String(step + 1).padStart(2, '0')} / 04</span>
                <h2 className="bw-step-title">{STEPS[step].title}</h2>
                <p className="bw-step-desc">{STEPS[step].desc}</p>
              </div>

              {/* ADIM 1 — model + kapasite */}
              {step === 0 && (
                <>
                  <div className="bw-field">
                    <span className="bw-field-label">Cihaz türü</span>
                    <div className="bw-tabs">
                      {categories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={'bw-tab' + (category === c ? ' is-on' : '')}
                          onClick={() => patch({ model: modelsByCat[c][0] })}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <span className="bw-field-label" style={{ marginTop: 4 }}>Model</span>
                    <select
                      className="field bw-select"
                      value={sel.model}
                      onChange={(e) => patch({ model: e.target.value })}
                    >
                      {models.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <OptionGroup
                    label="Depolama kapasitesi"
                    options={o.storage}
                    value={sel.storage}
                    onChange={(k) => patch({ storage: k })}
                  />
                </>
              )}

              {/* ADIM 2 — ekran + batarya */}
              {step === 1 && (
                <>
                  <OptionGroup
                    label="Ekran durumu"
                    options={o.screen}
                    value={sel.screen_status}
                    onChange={(k) => patch({ screen_status: k })}
                  />
                  <OptionGroup
                    label="Batarya sağlığı"
                    options={o.battery}
                    value={sel.battery_status}
                    onChange={(k) => patch({ battery_status: k })}
                  />
                </>
              )}

              {/* ADIM 3 — kozmetik + kutu/fatura */}
              {step === 2 && (
                <>
                  <OptionGroup
                    label="Kasa / kozmetik durumu"
                    options={o.cosmetic}
                    value={sel.cosmetic_status}
                    onChange={(k) => patch({ cosmetic_status: k })}
                  />
                  <OptionGroup
                    label="Kutu ve fatura"
                    options={o.box_invoice}
                    value={sel.has_box_invoice ? 'yes' : 'no'}
                    onChange={(k) => patch({ has_box_invoice: k === 'yes' })}
                  />
                </>
              )}

              {/* ADIM 4 — iletişim formu */}
              {step === 3 && (
                <div className="bw-form">
                  {submitError && <div className="bw-alert bw-alert-error">{submitError}</div>}

                  <div className="bw-input-group">
                    <label className="bw-input-label" htmlFor="bw-name">Ad Soyad</label>
                    <input
                      id="bw-name"
                      className="field"
                      value={name}
                      maxLength={100}
                      placeholder="Adınız ve soyadınız"
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched(true)}
                    />
                    {touched && nameErr && <span className="bw-field-err">{nameErr}</span>}
                  </div>

                  <div className="bw-input-group">
                    <label className="bw-input-label" htmlFor="bw-phone">Telefon</label>
                    <input
                      id="bw-phone"
                      className="field"
                      value={phone}
                      inputMode="tel"
                      maxLength={20}
                      placeholder="05XX XXX XX XX"
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => setTouched(true)}
                    />
                    {touched && phoneErr && <span className="bw-field-err">{phoneErr}</span>}
                  </div>

                  <div
                    className={'bw-kvkk' + (kvkk ? ' is-on' : '')}
                    role="checkbox"
                    aria-checked={kvkk}
                    tabIndex={0}
                    onClick={() => setKvkk((v) => !v)}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setKvkk((v) => !v); } }}
                  >
                    <span className="bw-kvkk-box">
                      {kvkk && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l4 4 10-10" />
                        </svg>
                      )}
                    </span>
                    <span className="bw-kvkk-text">
                      <strong>KVKK aydınlatma metnini</strong> okudum; ad ve telefon bilgilerimin cihaz
                      alım teklifi için işlenmesine ve benimle iletişime geçilmesine onay veriyorum.
                    </span>
                  </div>
                </div>
              )}

              {/* navigasyon */}
              <div className="bw-actions">
                {step > 0 && (
                  <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}>
                    Geri
                  </button>
                )}
                <span className="bw-spacer" />
                {step < 3 ? (
                  <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
                    Devam et
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" disabled={!canSubmit} onClick={onSubmit}>
                    {submitting ? 'Gönderiliyor…' : 'Teklifi onayla & WhatsApp’a geç'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* SAĞ: canlı teklif paneli */}
      <aside>
        <div className="bw-offer">
          <div>
            <div className="bw-offer-eyebrow">Tahmini teklif</div>
            <div className="bw-offer-model">{sel.model}</div>
          </div>

          {quote ? (
            <div className="bw-offer-range">
              {fmt(quote.offered_price_min)}<span className="sep">–</span>{fmt(quote.offered_price_max)}
              <span className="cur">{quote.currency}</span>
            </div>
          ) : quoteLoading ? (
            <div className="bw-offer-loading">Hesaplanıyor…</div>
          ) : (
            <div className="bw-offer-loading">Seçimlerinizi yapın, teklif anında güncellenir.</div>
          )}

          <div className="bw-summary">
            <SummaryRow k="Model" v={sel.model} />
            <SummaryRow k="Depolama" v={labelOf(o.storage, sel.storage)} />
            <SummaryRow k="Ekran" v={labelOf(o.screen, sel.screen_status)} />
            <SummaryRow k="Batarya" v={labelOf(o.battery, sel.battery_status)} />
            <SummaryRow k="Kozmetik" v={labelOf(o.cosmetic, sel.cosmetic_status)} />
            <SummaryRow k="Kutu/Fatura" v={sel.has_box_invoice ? 'Var' : 'Yok'} />
          </div>

          <p className="bw-offer-note">
            Bu bir ön tahmindir. Kesin teklif, cihazınız incelendikten sonra netleşir.
          </p>
        </div>
      </aside>
    </div>
  );
}

function labelOf(list: BuybackOption[], key: string): string {
  return list.find((x) => x.key === key)?.label ?? '—';
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="bw-summary-row">
      <span className="bw-summary-k">{k}</span>
      <span className="bw-summary-v">{v}</span>
    </div>
  );
}

function SuccessView({ result, currency }: { result: SubmitResult; currency: string }) {
  return (
    <div className="bw-success">
      <span className="bw-success-mark">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l4 4 10-10" />
        </svg>
      </span>
      <h2 className="bw-success-title">Talebiniz alındı</h2>
      <p className="bw-success-text">
        <strong>{result.model}</strong> için ön teklifiniz{' '}
        <strong>{fmt(result.offered_price_min)}–{fmt(result.offered_price_max)} {currency}</strong>.
        WhatsApp sekmesi açıldı; açılmadıysa aşağıdaki butonu kullanın. Ekibimiz en kısa sürede sizinle iletişime geçecek.
      </p>
      {result.whatsapp_url && (
        <a href={result.whatsapp_url} target="_blank" rel="noreferrer" className="btn btn-wa" style={{ justifyContent: 'center' }}>
          WhatsApp’tan devam et
        </a>
      )}
    </div>
  );
}
