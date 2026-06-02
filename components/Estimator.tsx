'use client';

// Estimator — GERÇEK veriden beslenen fiyat tahmin sihirbazı.
// Kaynak: GET /api/price-rules  →  config/whatsapp.json
//   • issue_types  (9 arıza türü, TR etiket)
//   • price_rules  (model grubu → arıza başına {min,max,days})
//   • whatsapp     (numara + message_template)
// Cihaz/model/fiyat artık koda gömülü değil; backend config'i tek doğru kaynak.
import { useState, useEffect, useMemo } from 'react';
import Icon from './Icon';

interface IssuePrice { min: number; max: number; days: number }
interface RuleGroup { models: string[]; [issue: string]: IssuePrice | string[] }
interface PriceData {
  issue_types: Record<string, { label: string }>;
  price_rules: Record<string, RuleGroup>;
  whatsapp: { number: string; message_template: string };
}

function fmt(v: number) {
  return new Intl.NumberFormat('tr-TR').format(v) + ' ₺';
}

function categoryOf(model: string): string {
  if (model.startsWith('iPhone')) return 'iPhone';
  if (model.startsWith('iPad')) return 'iPad';
  if (model.startsWith('Apple Watch')) return 'Apple Watch';
  return 'Diğer';
}

export default function Estimator({ variant = 'panel' }: { variant?: 'panel' | 'inline' }) {
  const [data, setData] = useState<PriceData | null>(null);
  const [error, setError] = useState(false);

  const [category, setCategory] = useState('');
  const [model, setModel] = useState('');
  const [issue, setIssue] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/price-rules')
      .then((r) => r.json())
      .then((json) => { if (active) setData(json.data as PriceData); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  // model → rule grubu anahtarı eşlemesi + kategorilere göre model listesi
  const { modelToRule, categories, modelsByCat } = useMemo(() => {
    const modelToRule: Record<string, string> = {};
    const modelsByCat: Record<string, string[]> = {};
    const categories: string[] = [];
    if (data) {
      for (const [ruleKey, group] of Object.entries(data.price_rules)) {
        for (const m of group.models) {
          modelToRule[m] = ruleKey;
          const cat = categoryOf(m);
          if (!modelsByCat[cat]) { modelsByCat[cat] = []; categories.push(cat); }
          modelsByCat[cat].push(m);
        }
      }
    }
    return { modelToRule, categories, modelsByCat };
  }, [data]);

  // veri gelince ilk seçimleri kur
  useEffect(() => {
    if (data && categories.length && !category) {
      const firstCat = categories[0];
      setCategory(firstCat);
      setModel(modelsByCat[firstCat][0]);
      setIssue(Object.keys(data.issue_types)[0]);
    }
  }, [data, categories, modelsByCat, category]);

  if (error) {
    return (
      <div style={panelStyle(variant)}>
        <div style={{ fontSize: 15, color: 'var(--fg-2)' }}>Fiyat verisi şu an yüklenemedi. Lütfen WhatsApp’tan yazın.</div>
      </div>
    );
  }
  if (!data || !category) {
    return (
      <div style={panelStyle(variant)}>
        <div style={{ fontSize: 15, color: 'var(--fg-3)' }}>Fiyat tahmini yükleniyor…</div>
      </div>
    );
  }

  const models = modelsByCat[category] || [];
  const ruleKey = modelToRule[model];
  const rule = ruleKey ? data.price_rules[ruleKey] : undefined;
  const issueKeys = Object.keys(data.issue_types);
  const activeIssue = issueKeys.includes(issue) ? issue : issueKeys[0];
  const price = rule && rule[activeIssue] && Array.isArray((rule[activeIssue] as string[])) === false
    ? (rule[activeIssue] as IssuePrice)
    : undefined;

  const issueLabel = data.issue_types[activeIssue]?.label ?? activeIssue;
  const priceRange = price ? `${fmt(price.min)} — ${fmt(price.max)}` : '—';

  const waNumber = (data.whatsapp.number || '').replace(/\D/g, '');
  const waText = data.whatsapp.message_template
    .replace('{model}', model)
    .replace('{issue}', issueLabel)
    .replace('{price_range}', price ? `${price.min} - ${price.max}` : '—');
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <div style={panelStyle(variant)}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Fiyat tahmini</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
          Onarım tutarınızı hesaplayın
        </div>
      </div>

      {/* Cihaz kategorisi */}
      <div style={{ display: 'flex', gap: 6, background: 'var(--bg-3)', padding: 4, borderRadius: 12, flexWrap: 'wrap' }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => { setCategory(c); setModel(modelsByCat[c][0]); }}
            style={{
              flex: '1 1 0', minWidth: 84, border: 'none', padding: '10px 0', borderRadius: 8, cursor: 'pointer',
              background: category === c ? 'var(--bg-1)' : 'transparent',
              color: category === c ? 'var(--fg-1)' : 'var(--fg-2)',
              fontWeight: 500, fontSize: 13.5, boxShadow: category === c ? 'var(--shadow-1)' : 'none',
              transition: 'all 140ms', fontFamily: 'inherit',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Model */}
      <div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 500, marginBottom: 6 }}>Model</div>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="field"
          style={{
            appearance: 'none', cursor: 'pointer',
            backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%2386868B%22 stroke-width=%221.5%22 fill=%22none%22/></svg>")',
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36,
          }}
        >
          {models.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Arıza türü */}
      <div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 500, marginBottom: 8 }}>Arıza türü</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {issueKeys.map((k) => {
            const active = k === activeIssue;
            return (
              <button
                key={k}
                onClick={() => setIssue(k)}
                style={{
                  border: '1px solid ' + (active ? 'var(--brand)' : 'var(--line-2)'),
                  background: active ? 'var(--brand-soft)' : 'transparent',
                  color: active ? 'var(--brand)' : 'var(--fg-2)',
                  padding: '8px 14px', borderRadius: 9999, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, transition: 'all 140ms', fontFamily: 'inherit',
                }}
              >
                {data.issue_types[k].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sonuç */}
      <div style={{ background: 'var(--bg-2)', borderRadius: 16, padding: '20px 22px', border: '1px solid var(--line-1)' }}>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 6 }}>
          Tahmini aralık
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--fg-1)', lineHeight: 1.1 }}>
          {price ? <>{fmt(price.min)} <span style={{ color: 'var(--fg-3)', fontWeight: 500 }}>—</span> {fmt(price.max)}</> : 'Mevcut değil'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 8 }}>
          {price ? `Tahmini süre: ${price.days} iş günü · ` : ''}Kesin fiyat, cihazın durumu incelendikten sonra belirlenir.
        </div>
      </div>

      <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa" style={{ justifyContent: 'center' }}>
        <Icon name="whatsapp" size={18} /> Kesin fiyat için WhatsApp
      </a>
    </div>
  );
}

function panelStyle(variant: 'panel' | 'inline'): React.CSSProperties {
  return {
    background: 'var(--bg-elev)',
    border: '1px solid var(--line-1)',
    borderRadius: 24,
    padding: 28,
    boxShadow: 'var(--shadow-2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    maxWidth: variant === 'inline' ? '100%' : 460,
  };
}
