'use client';

// BuybackWizard — /cihazini-sat çok adımlı cihaz alım sihirbazı (Sprint 6: fiyatsız WhatsApp akışı).
//   Meta: GET /api/buyback/calculate → { currency, options, models, whatsapp:{number,template} } (açılışta 1 kez)
// Fiyat sitede HESAPLANMAZ/GÖSTERİLMEZ; kişisel veri (ad/telefon) TOPLANMAZ.
// Seçimler şablondaki {model}/{storage}/{screen}/{battery}/{cosmetic}/{box} yerlerine
// options metadata'sındaki key→label eşlemesiyle yazılır ve wa.me linki üretilir.
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import OptionGroup, { type BuybackOption } from './OptionGroup';

// Beklenti satırı (fiyat motivasyonunun yerini dolduran güven mesajı).
// Not: ileride config/whatsapp.json'dan (response_time) okunabilir — şimdilik sabit kopya.
const RESPONSE_TIME_NOTE = 'Mesai saatlerinde ortalama ~15 dakika içinde WhatsApp’tan yanıt veriyoruz.';

// Adım 4 "Sırada ne var?" anlatımı — fiyat yerine süreç şeffaflığı.
const NEXT_STEPS: { t: string; d: string }[] = [
  { t: 'Mesajınız bize ulaşır', d: 'Seçimleriniz WhatsApp mesajına madde madde eklenir; tek dokunuşla gönderirsiniz.' },
  { t: 'Cihazınız değerlendirilir', d: 'Model ve durum bilgilerinize göre en uygun alım teklifini hazırlarız.' },
  { t: 'Teklifiniz WhatsApp’tan gelir', d: 'Net teklifimizi aynı sohbet üzerinden size iletiriz.' },
];

interface BuybackOptions {
  storage: BuybackOption[];
  screen: BuybackOption[];
  battery: BuybackOption[];
  cosmetic: BuybackOption[];
  box_invoice: BuybackOption[];
}
interface ModelRow { model: string; price_group: string }
interface WhatsappMeta { number: string; template: string }
interface Meta {
  currency: string;
  options: BuybackOptions;
  models: ModelRow[];
  whatsapp: WhatsappMeta;
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
  { title: 'Özet & WhatsApp', desc: 'Seçimlerinizi kontrol edip WhatsApp’tan teklif alın.' },
];

function categoryOf(model: string): string {
  if (model.startsWith('iPhone')) return 'iPhone';
  if (model.startsWith('iPad')) return 'iPad';
  if (model.startsWith('Apple Watch')) return 'Apple Watch';
  return 'Diğer';
}

function labelOf(list: BuybackOption[], key: string): string {
  return list.find((x) => x.key === key)?.label ?? '—';
}

// Şablonu seçilen etiketlerle doldurup wa.me linkini üret.
function buildWaLink(wa: WhatsappMeta, sel: Selection, o: BuybackOptions): string {
  const values: Record<string, string> = {
    model: sel.model,
    storage: labelOf(o.storage, sel.storage),
    screen: labelOf(o.screen, sel.screen_status),
    battery: labelOf(o.battery, sel.battery_status),
    cosmetic: labelOf(o.cosmetic, sel.cosmetic_status),
    box: labelOf(o.box_invoice, sel.has_box_invoice ? 'yes' : 'no'),
  };
  const text = wa.template.replace(/\{(\w+)\}/g, (_m, k: string) => values[k] ?? '');
  return `https://wa.me/${wa.number}?text=${encodeURIComponent(text)}`;
}

export default function BuybackWizard() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [metaError, setMetaError] = useState(false);

  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selection | null>(null);

  // Adım değişiminde panel başına kaydır (özellikle mobil sticky "Devam" sonrası
  // kullanıcı yeni adımın başlığını görsün). İlk render'da kaydırma.
  const panelRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panelRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [step]);

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

  const patch = useCallback((p: Partial<Selection>) => {
    setSel((s) => (s ? { ...s, ...p } : s));
  }, []);

  const waLink = useMemo(
    () => (meta && sel ? buildWaLink(meta.whatsapp, sel, meta.options) : ''),
    [meta, sel],
  );

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
  const lastStep = STEPS.length - 1;

  return (
    <>
      {/* ADIM ŞERİDİ — sıralı adım listesi; tamamlanan adımlara geri tıklanabilir.
          (Sihirbaz adımları sekme değildir → tablist yerine liste + aria-current="step".) */}
      <ol className="bw-steps" aria-label="Sihirbaz adımları">
        {STEPS.map((s, i) => {
          const state = i === step ? 'is-active' : i < step ? 'is-done' : '';
          return (
            <li key={s.title} className="bw-step-item">
              <button
                type="button"
                aria-current={i === step ? 'step' : undefined}
                aria-label={`Adım ${i + 1}: ${s.title}`}
                className={'bw-step' + (state ? ' ' + state : '')}
                disabled={i > step}
                onClick={() => i <= step && setStep(i)}
              >
                <span className="bw-step-num">{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="bw-grid">
        {/* SOL: adım gövdesi */}
        <div>
          <div className="bw-panel" ref={panelRef}>
            <div className="bw-step-head">
              <span className="bw-step-index">ADIM {String(step + 1).padStart(2, '0')} / 0{STEPS.length}</span>
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

            {/* ADIM 4 — "Sırada ne var?" süreç anlatımı (özet sağ panelde + mobil bar'da;
                burada tekrar etmiyoruz → fiyatın yerini güven/şeffaflık dolduruyor). */}
            {step === 3 && (
              <div className="bw-review">
                <p className="bw-review-lead">
                  Seçimleriniz hazır. <strong>WhatsApp’tan teklif al</strong> dediğinizde seçimleriniz
                  mesaja madde madde eklenir ve bize ulaşır.
                </p>
                <ol className="bw-next">
                  {NEXT_STEPS.map((n, i) => (
                    <li key={n.t} className="bw-next-row">
                      <span className="bw-next-num">{i + 1}</span>
                      <span className="bw-next-text">
                        <strong>{n.t}</strong>
                        <span>{n.d}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="bw-next-eta">{RESPONSE_TIME_NOTE}</p>
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
              {step < lastStep ? (
                <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
                  Devam et
                </button>
              ) : (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-wa"
                  style={{ justifyContent: 'center' }}
                >
                  WhatsApp’tan teklif al
                </a>
              )}
            </div>
          </div>
        </div>

        {/* SAĞ: seçim özeti (fiyatsız) */}
        <aside>
          <div className="bw-offer">
            <div>
              <div className="bw-offer-eyebrow">Seçim özeti</div>
              <div className="bw-offer-model">{sel.model}</div>
            </div>

            <div className="bw-summary">
              <SummaryRow k="Model" v={sel.model} />
              <SummaryRow k="Depolama" v={labelOf(o.storage, sel.storage)} />
              <SummaryRow k="Ekran" v={labelOf(o.screen, sel.screen_status)} />
              <SummaryRow k="Batarya" v={labelOf(o.battery, sel.battery_status)} />
              <SummaryRow k="Kozmetik" v={labelOf(o.cosmetic, sel.cosmetic_status)} />
              <SummaryRow k="Kutu/Fatura" v={labelOf(o.box_invoice, sel.has_box_invoice ? 'yes' : 'no')} />
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn-wa"
              style={{ justifyContent: 'center' }}
            >
              WhatsApp’tan teklif al
            </a>

            <p className="bw-offer-note">
              Seçimleriniz WhatsApp mesajına madde madde eklenir. Kesin fiyat teklifi, cihazınız
              incelendikten sonra netleşir.
            </p>
          </div>
        </aside>
      </div>

      {/* MOBİL STICKY BAR (≤880px) — model + kompakt özet + Devam/WhatsApp */}
      <div className="bw-mbar">
        <div className="bw-mbar-info">
          <span className="bw-mbar-model">{sel.model}</span>
          <span className="bw-mbar-sub">{labelOf(o.storage, sel.storage)} · {category}</span>
        </div>
        {step < lastStep ? (
          <button type="button" className="btn btn-primary bw-mbar-cta" onClick={() => setStep((s) => s + 1)}>
            Devam
          </button>
        ) : (
          <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa bw-mbar-cta">
            WhatsApp’tan teklif al
          </a>
        )}
      </div>
    </>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="bw-summary-row">
      <span className="bw-summary-k">{k}</span>
      <span className="bw-summary-v">{v}</span>
    </div>
  );
}
