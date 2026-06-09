'use client';

// Cihaz Alım Talepleri sekmesi — buyback taleplerini listele + durum yönet.
//   Liste:  GET   /api/admin/buybacks            (?status= ile filtre)
//   Durum:  PATCH /api/admin/buybacks            {id, status}
// adminFetch (401→refresh→retry) ile çağrılır. Fiyatlar DECIMAL → string gelir, Number() ile biçimle.
import { useState, useEffect, useCallback } from 'react';
import { adminFetch, ApiError } from '@/lib/adminApi';

type Status = 'pending' | 'contacted' | 'completed' | 'rejected';

interface Buyback {
  id: number;
  customer_name: string;
  customer_phone: string;
  kvkk_consent: number;
  price_group: string;
  model: string;
  storage: string;
  screen_status: string;
  battery_status: string;
  cosmetic_status: string;
  has_box_invoice: number;
  offered_price_min: string;
  offered_price_max: string;
  status: Status;
  created_at: string;
}

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Bekliyor',
  contacted: 'İletişime geçildi',
  completed: 'Tamamlandı',
  rejected: 'Reddedildi',
};
const STATUS_ORDER: Status[] = ['pending', 'contacted', 'completed', 'rejected'];

function money(v: string): string {
  const n = Number(v);
  return Number.isFinite(n) ? new Intl.NumberFormat('tr-TR').format(n) : v;
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function BuybacksTab({ onAuthExpired }: { onAuthExpired: (e: unknown) => void }) {
  const [rows, setRows] = useState<Buyback[]>([]);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [rowError, setRowError] = useState('');

  const load = useCallback((status: 'all' | Status) => {
    setLoading(true);
    setLoadError('');
    const path = status === 'all' ? '/api/admin/buybacks' : `/api/admin/buybacks?status=${status}`;
    adminFetch<Buyback[]>(path)
      .then((data) => setRows(data ?? []))
      .catch((err) => {
        if (err instanceof ApiError) setLoadError(err.message);
        else { onAuthExpired(err); setLoadError('Talepler yüklenemedi.'); }
      })
      .finally(() => setLoading(false));
  }, [onAuthExpired]);

  useEffect(() => { load(filter); }, [load, filter]);

  async function changeStatus(id: number, status: Status) {
    setUpdating(id);
    setRowError('');
    try {
      await adminFetch('/api/admin/buybacks', { method: 'PATCH', body: { id, status } });
      // Filtre 'all' ise yerinde güncelle; aksi halde filtreden düşebilir → yeniden yükle.
      if (filter === 'all') {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      } else {
        load(filter);
      }
    } catch (err) {
      if (err instanceof ApiError) setRowError(err.message);
      else { onAuthExpired(err); setRowError('Durum güncellenemedi.'); }
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">
            Cihaz alım talepleri
            {!loading && <span className="admin-count">{rows.length}</span>}
          </h2>
          <p className="admin-panel-desc" style={{ marginBottom: 0 }}>
            Müşterilerin gönderdiği alım taleplerini görüntüleyin ve durumlarını yönetin.
          </p>
        </div>
        <div className="admin-seg">
          <button type="button" className={'admin-seg-btn' + (filter === 'all' ? ' is-on' : '')}
            onClick={() => setFilter('all')}>Tümü</button>
          {STATUS_ORDER.map((s) => (
            <button key={s} type="button" className={'admin-seg-btn' + (filter === s ? ' is-on' : '')}
              onClick={() => setFilter(s)}>{STATUS_LABEL[s]}</button>
          ))}
        </div>
      </div>

      {rowError && <div className="admin-alert admin-alert-error" style={{ marginTop: 16 }}>{rowError}</div>}
      {loadError && <div className="admin-alert admin-alert-error" style={{ marginTop: 16 }}>{loadError}</div>}

      {loading ? (
        <div className="admin-empty">Yükleniyor…</div>
      ) : rows.length === 0 ? (
        <div className="admin-empty">Bu filtrede talep bulunmuyor.</div>
      ) : (
        <div className="admin-table-wrap" style={{ marginTop: 18 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Müşteri</th>
                <th>Cihaz</th>
                <th style={{ width: 150 }}>Teklif (TL)</th>
                <th style={{ width: 180 }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--fg-3)' }}>{dateLabel(r.created_at)}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.customer_name}</div>
                    <a href={`tel:${r.customer_phone}`} style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{r.customer_phone}</a>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.model}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                      {r.storage !== 'na' ? r.storage + ' · ' : ''}
                      {r.screen_status} · {r.battery_status} · {r.cosmetic_status}
                      {r.has_box_invoice ? ' · kutu+fatura' : ''}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {money(r.offered_price_min)} – {money(r.offered_price_max)}
                  </td>
                  <td>
                    <span className={'admin-status admin-status-' + r.status}>{STATUS_LABEL[r.status]}</span>
                    <select
                      className="field admin-select admin-status-select"
                      value={r.status}
                      disabled={updating === r.id}
                      onChange={(e) => changeStatus(r.id, e.target.value as Status)}
                    >
                      {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
