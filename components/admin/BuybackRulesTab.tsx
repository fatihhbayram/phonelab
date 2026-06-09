'use client';

// Alım Fiyatları sekmesi (Sprint 5.1) — cihaz alım kurallarını yönet.
//   Veri:  GET /api/admin/buyback-rules     → { rules, groups }
//   Kaydet: PUT /api/admin/buyback-rules    → kısmi & atomik patch (base_prices / spread / round_to / options)
// adminFetch (401→refresh→retry). Yazınca calculate/submit taze okur, sihirbaza anında yansır.
// Üç alt görünüm: Baz Fiyatlar · Katsayılar · Genel. Her biri ayrı kısmi PUT yollar.
import { useState, useEffect, useMemo, useCallback } from 'react';
import { adminFetch, ApiError } from '@/lib/adminApi';
import Icon from '@/components/Icon';

interface Opt { key: string; label: string; factor: number }
interface Options {
  storage: Opt[]; screen: Opt[]; battery: Opt[]; cosmetic: Opt[]; box_invoice: Opt[];
}
interface Rules {
  currency: string; spread: number; round_to: number;
  whatsapp_template: string; options: Options; base_prices: Record<string, number>;
}
interface GroupMeta { group: string; models: string[]; base_price: number | null }
interface ApiData { rules: Rules; groups: GroupMeta[] }

type View = 'prices' | 'factors' | 'general';
type OptionCategory = keyof Options;

const CATEGORY_LABEL: Record<OptionCategory, string> = {
  storage: 'Depolama',
  screen: 'Ekran',
  battery: 'Batarya',
  cosmetic: 'Kozmetik',
  box_invoice: 'Kutu / Fatura',
};
const CATEGORIES: OptionCategory[] = ['storage', 'screen', 'battery', 'cosmetic', 'box_invoice'];

const trLower = (s: string) => s.toLocaleLowerCase('tr');

export default function BuybackRulesTab({ onAuthExpired }: { onAuthExpired: (e: unknown) => void }) {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [view, setView] = useState<View>('prices');

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    return adminFetch<ApiData>('/api/admin/buyback-rules')
      .then((d) => setData(d))
      .catch((err) => {
        if (err instanceof ApiError) setLoadError(err.message);
        else { onAuthExpired(err); setLoadError('Alım kuralları yüklenemedi.'); }
      })
      .finally(() => setLoading(false));
  }, [onAuthExpired]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="admin-empty">Yükleniyor…</div>;
  if (loadError) return <div className="admin-alert admin-alert-error">{loadError}</div>;
  if (!data) return null;

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">Cihaz alım fiyatları</h2>
          <p className="admin-panel-desc" style={{ marginBottom: 0 }}>
            Kusursuz cihaz baz fiyatlarını, durum katsayılarını ve teklif aralığını yönetin.
            Değişiklik kaydedildiğinde <strong>/cihazini-sat</strong> sihirbazına anında yansır.
          </p>
        </div>
        <div className="admin-seg">
          <button type="button" className={'admin-seg-btn' + (view === 'prices' ? ' is-on' : '')}
            onClick={() => setView('prices')}>Baz Fiyatlar</button>
          <button type="button" className={'admin-seg-btn' + (view === 'factors' ? ' is-on' : '')}
            onClick={() => setView('factors')}>Katsayılar</button>
          <button type="button" className={'admin-seg-btn' + (view === 'general' ? ' is-on' : '')}
            onClick={() => setView('general')}>Genel</button>
        </div>
      </div>

      {view === 'prices' && <BasePricesEditor data={data} onSaved={load} onAuthExpired={onAuthExpired} />}
      {view === 'factors' && <FactorsEditor rules={data.rules} onSaved={load} onAuthExpired={onAuthExpired} />}
      {view === 'general' && <GeneralEditor rules={data.rules} onSaved={load} onAuthExpired={onAuthExpired} />}
    </div>
  );
}

// ============ BAZ FİYATLAR ============
function BasePricesEditor({
  data, onSaved, onAuthExpired,
}: { data: ApiData; onSaved: () => void; onAuthExpired: (e: unknown) => void }) {
  // group → string (input). null/undefined → boş.
  const initial = useMemo(() => {
    const d: Record<string, string> = {};
    for (const g of data.groups) d[g.group] = g.base_price == null ? '' : String(g.base_price);
    return d;
  }, [data]);

  const [draft, setDraft] = useState<Record<string, string>>(initial);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const filtered = useMemo(() => {
    const q = trLower(query.trim());
    if (!q) return data.groups;
    return data.groups.filter(
      (g) => trLower(g.group).includes(q) || g.models.some((m) => trLower(m).includes(q)),
    );
  }, [data.groups, query]);

  function setCell(group: string, value: string) {
    const clean = value.replace(/[^\d]/g, '');
    setDraft((d) => ({ ...d, [group]: clean }));
    setSuccess('');
  }

  // Yalnızca DEĞİŞEN ve geçerli (boş olmayan) baz fiyatları yolla. Boş → atlanır (unset yok).
  function changedPrices(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const g of data.groups) {
      const v = draft[g.group];
      if (v === '' || v === undefined) continue;
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0 || n > 10_000_000) continue;
      if (g.base_price == null || g.base_price !== n) out[g.group] = n;
    }
    return out;
  }

  async function onSubmit() {
    setError(''); setSuccess('');
    const base_prices = changedPrices();
    const count = Object.keys(base_prices).length;
    if (count === 0) { setError('Kaydedilecek değişiklik yok.'); return; }
    setSaving(true);
    try {
      await adminFetch('/api/admin/buyback-rules', { method: 'PUT', body: { base_prices } });
      setSuccess(`${count} grup baz fiyatı güncellendi.`);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else { onAuthExpired(err); setError('Kaydedilemedi.'); }
    } finally {
      setSaving(false);
    }
  }

  const definedCount = data.groups.filter((g) => g.base_price != null).length;

  return (
    <div style={{ marginTop: 20 }}>
      <p className="admin-hint" style={{ marginBottom: 12 }}>
        Kusursuz (sıfır ayar) cihazın baz alım fiyatı (₺). Durum katsayıları bu değerin üzerine uygulanır.
        {' '}{definedCount}/{data.groups.length} grup tanımlı.
      </p>

      <div className="admin-search-wrap">
        <Icon name="search" size={16} />
        <input className="field admin-search" placeholder="Grup veya model ara…" value={query}
          onChange={(e) => setQuery(e.target.value)} />
      </div>

      {error && <div className="admin-alert admin-alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="admin-alert admin-alert-ok" style={{ marginBottom: 12 }}>{success}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fiyat grubu</th>
              <th>Modeller</th>
              <th style={{ width: 170 }}>Baz fiyat (₺)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={3} className="admin-empty">Eşleşen grup yok.</td></tr>
            ) : filtered.map((g) => {
              const undefinedPrice = g.base_price == null && (draft[g.group] ?? '') === '';
              return (
                <tr key={g.group}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{g.group}</td>
                  <td style={{ color: 'var(--fg-3)', fontSize: 13 }}>{g.models.join(', ')}</td>
                  <td>
                    <input
                      className="field admin-num"
                      inputMode="numeric"
                      placeholder={undefinedPrice ? 'tanımsız' : '0'}
                      value={draft[g.group] ?? ''}
                      onChange={(e) => setCell(g.group, e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 18 }}>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={onSubmit}>
          {saving ? 'Kaydediliyor…' : 'Baz fiyatları kaydet'}
        </button>
      </div>
    </div>
  );
}

// ============ KATSAYILAR (options) ============
type OptDraft = { key: string; label: string; factor: string };

function FactorsEditor({
  rules, onSaved, onAuthExpired,
}: { rules: Rules; onSaved: () => void; onAuthExpired: (e: unknown) => void }) {
  const [cat, setCat] = useState<OptionCategory>('storage');
  const [rows, setRows] = useState<OptDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Kategori değişince taslağı o kategorinin mevcut seçeneklerinden kur.
  useEffect(() => {
    setRows(rules.options[cat].map((o) => ({ key: o.key, label: o.label, factor: String(o.factor) })));
    setError(''); setSuccess('');
  }, [cat, rules]);

  function setRow(i: number, field: keyof OptDraft, value: string) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
    setSuccess('');
  }
  function addRow() { setRows((rs) => [...rs, { key: '', label: '', factor: '1' }]); }
  function removeRow(i: number) { setRows((rs) => rs.filter((_, idx) => idx !== i)); }

  function validate(): string | null {
    if (rows.length === 0) return 'En az bir seçenek olmalı.';
    const keys = new Set<string>();
    for (const r of rows) {
      const key = r.key.trim();
      if (!key) return 'Tüm seçeneklerin bir anahtarı olmalı.';
      if (key.length > 30) return `Anahtar en fazla 30 karakter: "${key}".`;
      if (keys.has(key)) return `Anahtar benzersiz olmalı: "${key}".`;
      keys.add(key);
      if (!r.label.trim()) return `"${key}" için etiket gerekli.`;
      const f = Number(r.factor);
      if (!Number.isFinite(f) || f <= 0 || f > 10) return `"${key}" katsayısı 0–10 aralığında (0 hariç) olmalı.`;
    }
    if (cat === 'box_invoice' && !(keys.has('yes') && keys.has('no'))) {
      return "Kutu/Fatura için 'yes' ve 'no' anahtarları zorunludur.";
    }
    return null;
  }

  async function onSubmit() {
    setError(''); setSuccess('');
    const v = validate();
    if (v) { setError(v); return; }
    const list: Opt[] = rows.map((r) => ({ key: r.key.trim(), label: r.label.trim(), factor: Number(r.factor) }));
    setSaving(true);
    try {
      await adminFetch('/api/admin/buyback-rules', { method: 'PUT', body: { options: { [cat]: list } } });
      setSuccess(`${CATEGORY_LABEL[cat]} katsayıları güncellendi.`);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else { onAuthExpired(err); setError('Kaydedilemedi.'); }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div className="admin-field-group" style={{ maxWidth: 320, marginBottom: 16 }}>
        <span className="admin-label">Durum kategorisi</span>
        <select className="field admin-select" value={cat} onChange={(e) => setCat(e.target.value as OptionCategory)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
        <span className="admin-hint">
          Katsayı, baz fiyatla çarpılır (1.0 = etkisiz, 0.85 = %15 düşüş, 1.08 = %8 artış).
          {cat === 'box_invoice' && " 'yes' ve 'no' anahtarları zorunludur."}
        </span>
      </div>

      {error && <div className="admin-alert admin-alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="admin-alert admin-alert-ok" style={{ marginBottom: 12 }}>{success}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 150 }}>Anahtar</th>
              <th>Etiket (kullanıcıya görünen)</th>
              <th style={{ width: 110 }}>Katsayı</th>
              <th style={{ width: 56 }} aria-label="İşlem" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>
                  <input className="field" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
                    value={r.key} maxLength={30} placeholder="örn. flawless"
                    onChange={(e) => setRow(i, 'key', e.target.value.replace(/\s/g, ''))} />
                </td>
                <td>
                  <input className="field" value={r.label} maxLength={120} placeholder="örn. Kusursuz (çiziksiz)"
                    onChange={(e) => setRow(i, 'label', e.target.value)} />
                </td>
                <td>
                  <input className="field admin-num" inputMode="decimal" value={r.factor} placeholder="1.0"
                    onChange={(e) => setRow(i, 'factor', e.target.value.replace(/[^\d.]/g, ''))} />
                </td>
                <td>
                  <button type="button" className="admin-icon-btn admin-icon-btn-danger" aria-label="Sil"
                    onClick={() => removeRow(i)} disabled={rows.length <= 1}>
                    <Icon name="trash" size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary btn-sm admin-tool-btn" onClick={addRow}>
          <Icon name="plus" size={15} /> Seçenek ekle
        </button>
        <span style={{ flex: 1 }} />
        <button type="button" className="btn btn-primary" disabled={saving} onClick={onSubmit}>
          {saving ? 'Kaydediliyor…' : `${CATEGORY_LABEL[cat]} katsayılarını kaydet`}
        </button>
      </div>
    </div>
  );
}

// ============ GENEL (spread + round_to) ============
function GeneralEditor({
  rules, onSaved, onAuthExpired,
}: { rules: Rules; onSaved: () => void; onAuthExpired: (e: unknown) => void }) {
  // spread (0–0.9 kesir) → yüzde olarak göster/düzenle.
  const [spreadPct, setSpreadPct] = useState(String(Math.round(rules.spread * 100)));
  const [roundTo, setRoundTo] = useState(String(rules.round_to));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function validate(): string | null {
    const p = Number(spreadPct);
    if (!Number.isFinite(p) || p < 0 || p > 90) return 'Teklif aralığı yayılımı %0–%90 olmalı.';
    const r = Number(roundTo);
    if (!Number.isInteger(r) || r < 1 || r > 10_000) return 'Yuvarlama 1–10000 arası tam sayı olmalı.';
    return null;
  }

  async function onSubmit() {
    setError(''); setSuccess('');
    const v = validate();
    if (v) { setError(v); return; }
    setSaving(true);
    try {
      await adminFetch('/api/admin/buyback-rules', {
        method: 'PUT',
        body: { spread: Number(spreadPct) / 100, round_to: Number(roundTo) },
      });
      setSuccess('Genel ayarlar güncellendi.');
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else { onAuthExpired(err); setError('Kaydedilemedi.'); }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 20, maxWidth: 440 }}>
      {error && <div className="admin-alert admin-alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="admin-alert admin-alert-ok" style={{ marginBottom: 12 }}>{success}</div>}

      <div className="admin-form">
        <label className="admin-field-group">
          <span className="admin-label">Teklif aralığı yayılımı (%)</span>
          <input className="field admin-num" inputMode="numeric" value={spreadPct}
            onChange={(e) => setSpreadPct(e.target.value.replace(/[^\d]/g, ''))} />
          <span className="admin-hint">
            Teklif, hesaplanan fiyatın ± bu yüzdesi olarak aralık gösterilir (örn. %6 → min/max).
          </span>
        </label>

        <label className="admin-field-group">
          <span className="admin-label">Yuvarlama adımı (₺)</span>
          <input className="field admin-num" inputMode="numeric" value={roundTo}
            onChange={(e) => setRoundTo(e.target.value.replace(/[^\d]/g, ''))} />
          <span className="admin-hint">Min ve max teklif bu değere yuvarlanır (örn. 50 → en yakın 50 ₺).</span>
        </label>

        <div>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={onSubmit}>
            {saving ? 'Kaydediliyor…' : 'Genel ayarları kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
