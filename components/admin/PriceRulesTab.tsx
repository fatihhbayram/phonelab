'use client';

// Fiyatlar sekmesi — bir grubun arıza fiyatlarını düzenle + grup oluştur/klonla,
// toplu fiyat ayarı, CSV dışa/içe aktarma.
//   Veri:     GET  /api/price-rules                 → issue_types + price_rules
//   Kaydet:   PUT  /api/admin/price-rules           → {group, prices:{[issue]:{min,max,days}}}
//   Yeni grup: POST /api/admin/price-rules          → {group, clone_from?}
//   Toplu:    POST /api/admin/price-rules/bulk      → {mode, value, groups?, issues?}
//   Dışa:     GET  /api/admin/price-rules/export    → text/csv (indirme)
//   İçe:      POST /api/admin/price-rules/import    → text/csv (atomik, satır-satır hata döner)
import { useState, useEffect, useCallback, useRef, FormEvent } from 'react';
import { adminFetch, adminRequest, adminDownload, ApiError } from '@/lib/adminApi';
import Icon from '@/components/Icon';
import AdminModal from '@/components/admin/AdminModal';

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

  // Araç çubuğu durumları
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string; details?: string[] } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // preferKey verilirse yükleme sonrası o grup seçilir (yeni grup oluşturunca).
  const load = useCallback((preferKey?: string) => {
    setLoading(true);
    return fetch('/api/price-rules')
      .then((r) => r.json())
      .then((j) => {
        const it = (j.data?.issue_types ?? {}) as Issues;
        const pr = (j.data?.price_rules ?? {}) as Rules;
        setIssues(it);
        setRules(pr);
        const keys = Object.keys(pr).sort();
        const pick = preferKey && pr[preferKey] ? preferKey : (keys[0] ?? '');
        setGroupKey(pick);
        if (pick) setDraft(toDraft(pr[pick], it));
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
      setRules((prev) => ({ ...prev, [groupKey]: { ...prev[groupKey], ...prices } }));
      setSuccess('Fiyatlar güncellendi.');
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message);
      else { onAuthExpired(err); setFormError('Kaydedilemedi.'); }
    } finally {
      setSaving(false);
    }
  }

  // ---------- CSV dışa aktar ----------
  async function onExport() {
    setImportMsg(null);
    setExporting(true);
    try {
      await adminDownload('/api/admin/price-rules/export', 'phonelab-price-rules.csv');
    } catch (err) {
      if (err instanceof ApiError) setImportMsg({ ok: false, text: err.message });
      else { onAuthExpired(err); setImportMsg({ ok: false, text: 'CSV indirilemedi.' }); }
    } finally {
      setExporting(false);
    }
  }

  // ---------- CSV içe aktar ----------
  async function onImportFile(file: File) {
    setImportMsg(null);
    setImporting(true);
    try {
      const csv = await file.text();
      const res = await adminRequest('/api/admin/price-rules/import', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: csv,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // import uçu details'i string[] olarak döner (satır-satır hata)
        const details = Array.isArray(json?.details) ? (json.details as string[]) : undefined;
        setImportMsg({ ok: false, text: json?.error ?? 'İçe aktarılamadı.', details });
        return;
      }
      setImportMsg({ ok: true, text: `${json?.data?.imported ?? 0} satır içe aktarıldı.` });
      await load(groupKey);
    } catch (err) {
      onAuthExpired(err);
      setImportMsg({ ok: false, text: 'İçe aktarılamadı.' });
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  if (loading) return <div className="admin-empty">Yükleniyor…</div>;
  if (loadError) return <div className="admin-alert admin-alert-error">{loadError}</div>;

  const groupKeys = Object.keys(rules).sort();
  const models = rules[groupKey]?.models ?? [];
  const issueKeys = Object.keys(issues);

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">Fiyat grupları</h2>
          <p className="admin-panel-desc" style={{ marginBottom: 0 }}>
            Bir grup seçip arıza başına fiyat/gün düzenleyin; ya da grup oluşturun, toplu ayarlayın, CSV ile taşıyın.
          </p>
        </div>
        <div className="admin-toolbar">
          <button type="button" className="btn btn-secondary btn-sm admin-tool-btn" onClick={() => setShowCreate(true)}>
            <Icon name="plus" size={15} /> Yeni grup
          </button>
          <button type="button" className="btn btn-secondary btn-sm admin-tool-btn" onClick={() => setShowBulk(true)}>
            <Icon name="zap" size={15} /> Toplu ayarla
          </button>
          <button type="button" className="btn btn-secondary btn-sm admin-tool-btn" onClick={onExport} disabled={exporting}>
            <Icon name="download" size={15} /> {exporting ? 'İndiriliyor…' : 'CSV indir'}
          </button>
          <button type="button" className="btn btn-secondary btn-sm admin-tool-btn"
            onClick={() => fileInput.current?.click()} disabled={importing}>
            <Icon name="upload" size={15} /> {importing ? 'Yükleniyor…' : 'CSV yükle'}
          </button>
          <input ref={fileInput} type="file" accept=".csv,text/csv" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportFile(f); }} />
        </div>
      </div>

      {importMsg && (
        <div className={'admin-alert ' + (importMsg.ok ? 'admin-alert-ok' : 'admin-alert-error')} style={{ marginTop: 16 }}>
          <div>{importMsg.text}</div>
          {importMsg.details && importMsg.details.length > 0 && (
            <ul className="admin-detail-list">
              {importMsg.details.slice(0, 12).map((d, i) => <li key={i}>{d}</li>)}
              {importMsg.details.length > 12 && <li>…ve {importMsg.details.length - 12} hata daha</li>}
            </ul>
          )}
        </div>
      )}

      <div className="admin-field-group" style={{ maxWidth: 420, marginTop: 20 }}>
        <span className="admin-label">Grup</span>
        <select className="field admin-select" value={groupKey} onChange={(e) => selectGroup(e.target.value)}>
          {groupKeys.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        {models.length > 0
          ? <span className="admin-hint">Modeller: {models.join(', ')}</span>
          : <span className="admin-hint">Bu grupta henüz model yok — Cihazlar sekmesinden ekleyin.</span>}
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

      {showCreate && (
        <CreateGroupModal
          groups={groupKeys}
          onClose={() => setShowCreate(false)}
          onAuthExpired={onAuthExpired}
          onCreated={async (newKey) => { setShowCreate(false); await load(newKey); setSuccess(`"${newKey}" grubu oluşturuldu.`); }}
        />
      )}

      {showBulk && (
        <BulkUpdateModal
          groups={groupKeys}
          issues={issues}
          currentGroup={groupKey}
          onClose={() => setShowBulk(false)}
          onAuthExpired={onAuthExpired}
          onApplied={async (updated) => { setShowBulk(false); await load(groupKey); setSuccess(`Toplu güncelleme uygulandı (${updated} fiyat değişti).`); }}
        />
      )}
    </div>
  );
}

// ---------- Yeni grup / klon modalı ----------
function CreateGroupModal({
  groups, onClose, onCreated, onAuthExpired,
}: {
  groups: string[];
  onClose: () => void;
  onCreated: (newKey: string) => void;
  onAuthExpired: (e: unknown) => void;
}) {
  const [group, setGroup] = useState('');
  const [cloneFrom, setCloneFrom] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const key = group.trim();
    if (!/^[a-z0-9_]+$/.test(key)) {
      setError('Grup anahtarı yalnızca küçük harf, rakam ve alt çizgi içerebilir.');
      return;
    }
    if (groups.includes(key)) { setError('Bu fiyat grubu zaten var.'); return; }
    setBusy(true);
    try {
      await adminFetch('/api/admin/price-rules', {
        method: 'POST',
        body: cloneFrom ? { group: key, clone_from: cloneFrom } : { group: key },
      });
      onCreated(key);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else { onAuthExpired(err); setError('Grup oluşturulamadı.'); }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminModal title="Yeni fiyat grubu" onClose={onClose}>
      <form onSubmit={submit} className="admin-form">
        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <label className="admin-field-group">
          <span className="admin-label">Grup anahtarı</span>
          <input className="field" value={group} maxLength={100} autoFocus placeholder="örn. iphone_18"
            onChange={(e) => setGroup(e.target.value.toLocaleLowerCase('en'))} />
          <span className="admin-hint">Küçük harf, rakam, alt çizgi. Modeller sonra Cihazlar sekmesinden eklenir.</span>
        </label>

        <label className="admin-field-group">
          <span className="admin-label">Fiyatları klonla <span className="admin-optional">(opsiyonel)</span></span>
          <select className="field admin-select" value={cloneFrom} onChange={(e) => setCloneFrom(e.target.value)}>
            <option value="">Sıfırdan (tüm arızalar 0)</option>
            {groups.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <span className="admin-hint">Seçilirse o grubun arıza fiyatları kopyalanır (modeller hariç).</span>
        </label>

        <div className="admin-modal-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={busy}>Vazgeç</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? 'Oluşturuluyor…' : 'Oluştur'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

// ---------- Toplu fiyat güncelleme modalı ----------
function BulkUpdateModal({
  groups, issues, currentGroup, onClose, onApplied, onAuthExpired,
}: {
  groups: string[];
  issues: Issues;
  currentGroup: string;
  onClose: () => void;
  onApplied: (updated: number) => void;
  onAuthExpired: (e: unknown) => void;
}) {
  const [mode, setMode] = useState<'percent' | 'fixed'>('percent');
  const [direction, setDirection] = useState<'inc' | 'dec'>('inc');
  const [amount, setAmount] = useState('');
  const [scope, setScope] = useState<'all' | string>('all'); // 'all' veya grup anahtarı
  const [issueScope, setIssueScope] = useState<'all' | string>('all'); // 'all' veya arıza anahtarı
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const issueKeys = Object.keys(issues);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const mag = Number(amount);
    if (!Number.isFinite(mag) || mag <= 0) { setError('Geçerli bir pozitif değer girin.'); return; }
    if (mode === 'percent' && direction === 'dec' && mag > 100) {
      setError('Yüzde azalış %100’den fazla olamaz.'); return;
    }
    const value = direction === 'dec' ? -mag : mag;

    const body: { mode: string; value: number; groups?: string[]; issues?: string[] } = { mode, value };
    if (scope !== 'all') body.groups = [scope];
    if (issueScope !== 'all') body.issues = [issueScope];

    setBusy(true);
    try {
      const data = await adminFetch<{ updated: number }>('/api/admin/price-rules/bulk', {
        method: 'POST',
        body,
      });
      onApplied(data?.updated ?? 0);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else { onAuthExpired(err); setError('Toplu güncelleme başarısız.'); }
    } finally {
      setBusy(false);
    }
  }

  const unit = mode === 'percent' ? '%' : '₺';

  return (
    <AdminModal title="Toplu fiyat ayarı" onClose={onClose}>
      <form onSubmit={submit} className="admin-form">
        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        <p className="admin-hint" style={{ marginTop: -4 }}>
          Seçilen kapsamdaki tüm <strong>min</strong> ve <strong>max</strong> fiyatlar ayarlanır (gün değişmez).
        </p>

        <div className="admin-field-group">
          <span className="admin-label">Tür</span>
          <div className="admin-seg">
            <button type="button" className={'admin-seg-btn' + (mode === 'percent' ? ' is-on' : '')}
              onClick={() => setMode('percent')}>Yüzde (%)</button>
            <button type="button" className={'admin-seg-btn' + (mode === 'fixed' ? ' is-on' : '')}
              onClick={() => setMode('fixed')}>Sabit (₺)</button>
          </div>
        </div>

        <div className="admin-field-group">
          <span className="admin-label">Yön</span>
          <div className="admin-seg">
            <button type="button" className={'admin-seg-btn' + (direction === 'inc' ? ' is-on' : '')}
              onClick={() => setDirection('inc')}>Artış (+)</button>
            <button type="button" className={'admin-seg-btn' + (direction === 'dec' ? ' is-on' : '')}
              onClick={() => setDirection('dec')}>Azalış (−)</button>
          </div>
        </div>

        <label className="admin-field-group">
          <span className="admin-label">Miktar ({unit})</span>
          <input className="field admin-num" inputMode="numeric" value={amount} autoFocus
            placeholder={mode === 'percent' ? 'örn. 10' : 'örn. 500'}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} />
        </label>

        <label className="admin-field-group">
          <span className="admin-label">Hedef grup</span>
          <select className="field admin-select" value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="all">Tüm gruplar</option>
            {groups.map((g) => <option key={g} value={g}>{g === currentGroup ? `${g} (seçili)` : g}</option>)}
          </select>
        </label>

        <label className="admin-field-group">
          <span className="admin-label">Hedef arıza</span>
          <select className="field admin-select" value={issueScope} onChange={(e) => setIssueScope(e.target.value)}>
            <option value="all">Tüm arıza türleri</option>
            {issueKeys.map((k) => <option key={k} value={k}>{issues[k].label}</option>)}
          </select>
        </label>

        <div className="admin-modal-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={busy}>Vazgeç</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? 'Uygulanıyor…' : 'Uygula'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
