'use client';

// Cihazlar sekmesi — DB cihaz listesi + yeni cihaz ekleme + arama + silme.
//   Liste:  GET    /api/devices            → {id, brand, model}
//   Ekle:   POST   /api/admin/devices      → {brand, model, price_group}
//   Sil:    DELETE /api/admin/devices      → {model, price_group}
//   Grup seçenekleri ve model→grup eşlemesi: GET /api/price-rules.price_rules
import { useState, useEffect, useCallback, useMemo, FormEvent } from 'react';
import { adminFetch, ApiError } from '@/lib/adminApi';
import Icon from '@/components/Icon';

interface Device { id: number; brand: string; model: string }
interface RuleGroup { models: string[] }

export default function DevicesTab({ onAuthExpired }: { onAuthExpired: (e: unknown) => void }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  // model → fiyat grubu eşlemesi (silme isteği price_group ister)
  const [groupOf, setGroupOf] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [priceGroup, setPriceGroup] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  // Arama + silme durumları
  const [query, setQuery] = useState('');
  const [confirmModel, setConfirmModel] = useState('');
  const [deleting, setDeleting] = useState('');
  const [rowError, setRowError] = useState('');

  const loadDevices = useCallback(() => {
    return fetch('/api/devices')
      .then((r) => r.json())
      .then((j) => setDevices((j.data ?? []) as Device[]));
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/devices').then((r) => r.json()),
      fetch('/api/price-rules').then((r) => r.json()),
    ])
      .then(([dev, pr]) => {
        if (!active) return;
        setDevices((dev.data ?? []) as Device[]);
        const rules = (pr.data?.price_rules ?? {}) as Record<string, RuleGroup>;
        const keys = Object.keys(rules).sort();
        setGroups(keys);
        setPriceGroup(keys[0] ?? '');
        // model → grup haritası: her grubun models[] listesinden türetilir.
        const map: Record<string, string> = {};
        for (const key of keys) {
          for (const m of rules[key].models ?? []) map[m] = key;
        }
        setGroupOf(map);
      })
      .catch(() => { if (active) setLoadError('Veriler yüklenemedi.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    if (!q) return devices;
    return devices.filter(
      (d) => d.model.toLocaleLowerCase('tr').includes(q) || d.brand.toLocaleLowerCase('tr').includes(q),
    );
  }, [devices, query]);

  function validate(): string | null {
    const b = brand.trim();
    const m = model.trim();
    if (!b || b.length > 50) return 'Marka 1–50 karakter olmalı.';
    if (!m || m.length > 100) return 'Model 1–100 karakter olmalı.';
    if (!priceGroup) return 'Fiyat grubu seçin.';
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    const v = validate();
    if (v) { setFormError(v); return; }
    setSubmitting(true);
    try {
      await adminFetch('/api/admin/devices', {
        method: 'POST',
        body: { brand: brand.trim(), model: model.trim(), price_group: priceGroup },
      });
      // Yeni model → grup haritasına işle (silme için lazım), listeyi tazele.
      setGroupOf((prev) => ({ ...prev, [model.trim()]: priceGroup }));
      setSuccess(`${model.trim()} eklendi.`);
      setModel('');
      await loadDevices();
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message);
      else { onAuthExpired(err); setFormError('İşlem yapılamadı.'); }
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(d: Device) {
    setRowError('');
    const group = groupOf[d.model];
    if (!group) {
      setRowError(`"${d.model}" hiçbir fiyat grubuna bağlı değil; panelden silinemiyor.`);
      setConfirmModel('');
      return;
    }
    setDeleting(d.model);
    try {
      await adminFetch('/api/admin/devices', {
        method: 'DELETE',
        body: { model: d.model, price_group: group },
      });
      setConfirmModel('');
      await loadDevices();
    } catch (err) {
      if (err instanceof ApiError) setRowError(err.message);
      else { onAuthExpired(err); setRowError('Silinemedi.'); }
    } finally {
      setDeleting('');
    }
  }

  return (
    <div className="admin-grid">
      {/* Ekleme formu */}
      <section className="admin-panel">
        <h2 className="admin-panel-title">Yeni cihaz ekle</h2>
        <p className="admin-panel-desc">
          Cihaz DB&apos;ye eklenir ve seçilen fiyat grubuna iliştirilir (fiyat motorunda görünür).
        </p>
        <form onSubmit={onSubmit} className="admin-form">
          {formError && <div className="admin-alert admin-alert-error">{formError}</div>}
          {success && <div className="admin-alert admin-alert-ok">{success}</div>}

          <label className="admin-field-group">
            <span className="admin-label">Marka</span>
            <input className="field" value={brand} maxLength={50}
              onChange={(e) => setBrand(e.target.value)} />
          </label>

          <label className="admin-field-group">
            <span className="admin-label">Model</span>
            <input className="field" value={model} maxLength={100} placeholder="örn. iPhone 16 Pro"
              onChange={(e) => setModel(e.target.value)} />
          </label>

          <label className="admin-field-group">
            <span className="admin-label">Fiyat grubu</span>
            <select className="field admin-select" value={priceGroup}
              onChange={(e) => setPriceGroup(e.target.value)} disabled={!groups.length}>
              {groups.length === 0 && <option value="">— grup yok —</option>}
              {groups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <span className="admin-hint">Yeni model, bu grubun fiyatlarını miras alır.</span>
          </label>

          <button type="submit" className="btn btn-primary" disabled={submitting}
            style={{ justifyContent: 'center' }}>
            {submitting ? 'Ekleniyor…' : 'Cihaz ekle'}
          </button>
        </form>
      </section>

      {/* Liste */}
      <section className="admin-panel">
        <h2 className="admin-panel-title">
          Kayıtlı cihazlar <span className="admin-count">{devices.length}</span>
        </h2>

        {!loading && !loadError && devices.length > 0 && (
          <div className="admin-search-wrap">
            <Icon name="search" size={16} />
            <input
              className="field admin-search"
              type="search"
              placeholder="Model veya marka ara…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cihaz ara"
            />
          </div>
        )}

        {rowError && <div className="admin-alert admin-alert-error" style={{ marginBottom: 12 }}>{rowError}</div>}

        {loading ? (
          <div className="admin-empty">Yükleniyor…</div>
        ) : loadError ? (
          <div className="admin-alert admin-alert-error">{loadError}</div>
        ) : devices.length === 0 ? (
          <div className="admin-empty">Henüz cihaz yok.</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">&quot;{query}&quot; ile eşleşen cihaz yok.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Marka</th><th>Model</th><th style={{ width: 96, textAlign: 'right' }}>İşlem</th></tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}>
                    <td>{d.brand}</td>
                    <td>{d.model}</td>
                    <td style={{ textAlign: 'right' }}>
                      {confirmModel === d.model ? (
                        <span className="admin-row-confirm">
                          <button type="button" className="admin-link-danger" disabled={deleting === d.model}
                            onClick={() => onDelete(d)}>
                            {deleting === d.model ? 'Siliniyor…' : 'Sil'}
                          </button>
                          <button type="button" className="admin-link-muted" disabled={deleting === d.model}
                            onClick={() => setConfirmModel('')}>
                            Vazgeç
                          </button>
                        </span>
                      ) : (
                        <button type="button" className="admin-icon-btn admin-icon-btn-danger"
                          aria-label={`${d.model} sil`} title="Sil"
                          onClick={() => { setRowError(''); setConfirmModel(d.model); }}>
                          <Icon name="trash" size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
