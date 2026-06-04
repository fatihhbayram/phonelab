'use client';

// Fiyatlar sekmesi — bir fiyat grubunun arıza başına {min,max,days} değerlerini düzenle.
//   Veri:   GET /api/price-rules        → issue_types + price_rules
//   Kaydet: PUT /api/admin/price-rules  → {group, prices:{[issue]:{min,max,days}}}
// Form doğrulaması (backend ile aynı): max ≥ min, days 0–60, tam sayı ≥ 0.
import { useState, useEffect, useCallback, FormEvent } from 'react';
import { adminFetch, ApiError } from '@/lib/adminApi';

interface Entry { min: number; max: number; days: number }
interface RuleGroup { models: string[]; [issue: string]: string[] | Entry }
type Issues = Record<string, { label: string }>;
type Rules = Record<string, RuleGroup>;

type Draft = Record<string, { min: string; max: string; days: string }>;

function toDraft(group: RuleGroup, issues: Issues): Draft {
  const d: Draft = {};
  for (const key of Object.keys(issues)) {
    const e = group[key];
    const entry = e && !Array.isArray(e) ? (e as Entry) : { min: 0, max: 0, days: 0 };
    d[key] = { min: String(entry.min), max: String(entry.max), days: String(entry.days) };
  }
  return d;
}

export default function PriceRulesTab({ onAuthExpired }: { onAuthExpired: (e: unknown) => void }) {
  const [issues, setIssues] = useState<Issues>({});
  const [rules, setRules] = useState<Rules>({});
  const [groupKey, setGroupKey] = useState('');
  const [draft, setDraft] = useState<Draft>({});
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
        const it = (j.data?.issue_types ?? {}) as Issues;
        const pr = (j.data?.price_rules ?? {}) as Rules;
        setIssues(it);
        setRules(pr);
        const first = Object.keys(pr).sort()[0] ?? '';
        setGroupKey(first);
        if (first) setDraft(toDraft(pr[first], it));
      })
      .catch(() => setLoadError('Fiyat verisi yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function selectGroup(key: string) {
    setGroupKey(key);
    setSuccess('');
    setFormError('');
    if (rules[key]) setDraft(toDraft(rules[key], issues));
  }

  function setCell(issue: string, field: 'min' | 'max' | 'days', value: string) {
    // sadece rakam
    const clean = value.replace(/[^\d]/g, '');
    setDraft((d) => ({ ...d, [issue]: { ...d[issue], [field]: clean } }));
  }

  function validate(): string | null {
    for (const key of Object.keys(issues)) {
      const row = draft[key];
      const min = Number(row.min || 0);
      const max = Number(row.max || 0);
      const days = Number(row.days || 0);
      const label = issues[key].label;
      if (max < min) return `"${label}": en yüksek fiyat, en düşükten küçük olamaz.`;
      if (days < 0 || days > 60) return `"${label}": gün 0–60 aralığında olmalı.`;
    }
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    const v = validate();
    if (v) { setFormError(v); return; }

    const prices: Record<string, Entry> = {};
    for (const key of Object.keys(issues)) {
      const row = draft[key];
      prices[key] = { min: Number(row.min || 0), max: Number(row.max || 0), days: Number(row.days || 0) };
    }

    setSaving(true);
    try {
      await adminFetch('/api/admin/price-rules', {
        method: 'PUT',
        body: { group: groupKey, prices },
      });
      // Seçimi/taslağı koru: kayıtlı değerleri yerel state'e işle, gruba sadık kal.
      setRules((prev) => ({ ...prev, [groupKey]: { ...prev[groupKey], ...prices } }));
      setSuccess('Fiyatlar güncellendi.');
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message);
      else { onAuthExpired(err); setFormError('Kaydedilemedi.'); }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-empty">Yükleniyor…</div>;
  if (loadError) return <div className="admin-alert admin-alert-error">{loadError}</div>;

  const groupKeys = Object.keys(rules).sort();
  const models = rules[groupKey]?.models ?? [];
  const issueKeys = Object.keys(issues);

  return (
    <div className="admin-panel">
      <h2 className="admin-panel-title">Fiyat grupları</h2>
      <p className="admin-panel-desc">
        Bir grup seçin, arıza başına en düşük/en yüksek tutar ve tahmini iş gününü düzenleyin.
      </p>

      <div className="admin-field-group" style={{ maxWidth: 420 }}>
        <span className="admin-label">Grup</span>
        <select className="field admin-select" value={groupKey} onChange={(e) => selectGroup(e.target.value)}>
          {groupKeys.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        {models.length > 0 && (
          <span className="admin-hint">Modeller: {models.join(', ')}</span>
        )}
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 20 }}>
        {formError && <div className="admin-alert admin-alert-error">{formError}</div>}
        {success && <div className="admin-alert admin-alert-ok">{success}</div>}

        <div className="admin-table-wrap">
          <table className="admin-table admin-price-table">
            <thead>
              <tr>
                <th>Arıza türü</th>
                <th style={{ width: 130 }}>En düşük (₺)</th>
                <th style={{ width: 130 }}>En yüksek (₺)</th>
                <th style={{ width: 100 }}>Gün</th>
              </tr>
            </thead>
            <tbody>
              {issueKeys.map((key) => {
                const row = draft[key] ?? { min: '0', max: '0', days: '0' };
                const invalid = Number(row.max || 0) < Number(row.min || 0);
                return (
                  <tr key={key}>
                    <td>{issues[key].label}</td>
                    <td>
                      <input className="field admin-num" inputMode="numeric" value={row.min}
                        onChange={(e) => setCell(key, 'min', e.target.value)} />
                    </td>
                    <td>
                      <input className={'field admin-num' + (invalid ? ' admin-num-bad' : '')} inputMode="numeric" value={row.max}
                        onChange={(e) => setCell(key, 'max', e.target.value)} />
                    </td>
                    <td>
                      <input className="field admin-num" inputMode="numeric" value={row.days}
                        onChange={(e) => setCell(key, 'days', e.target.value)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 18 }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
            {saving ? 'Kaydediliyor…' : 'Fiyatları kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
