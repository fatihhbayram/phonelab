'use client';

// /admin/dashboard — yönetim paneli kabuğu.
// Mount'ta GET /me ile oturum doğrulanır; yoksa client-side /admin/login'e yönlendirir.
// Sekmeler: Cihazlar · Fiyatlar · Ayarlar. Veri kaynağı GET /api/price-rules + /api/devices.
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchMe, logout, AuthExpiredError, type AdminIdentity } from '@/lib/adminApi';
import DevicesTab from '@/components/admin/DevicesTab';
import PriceRulesTab from '@/components/admin/PriceRulesTab';
import SettingsTab from '@/components/admin/SettingsTab';

type Tab = 'devices' | 'prices' | 'settings';

const TABS: { key: Tab; label: string }[] = [
  { key: 'devices', label: 'Cihazlar' },
  { key: 'prices', label: 'Fiyatlar' },
  { key: 'settings', label: 'Ayarlar' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('devices');

  const goLogin = useCallback(() => router.replace('/admin/login'), [router]);

  useEffect(() => {
    let active = true;
    fetchMe()
      .then((me) => { if (active) { setAdmin(me); setChecking(false); } })
      .catch(() => { if (active) goLogin(); });
    return () => { active = false; };
  }, [goLogin]);

  async function onLogout() {
    await logout();
    goLogin();
  }

  // Sekmeler oturum bitince ortak davranış: login'e at.
  const handleExpired = useCallback((err: unknown) => {
    if (err instanceof AuthExpiredError) goLogin();
  }, [goLogin]);

  if (checking) {
    return (
      <div className="admin-loading">Oturum doğrulanıyor…</div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Image
              src="/assets/logo/phonelab_logo_dahk.png"
              alt="PhoneLab"
              width={120}
              height={80}
              style={{ height: 38, width: 'auto' }}
            />
            <span className="admin-topbar-tag">Yönetim</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {admin && <span className="admin-user">{admin.username}</span>}
            <button className="btn btn-secondary btn-sm" onClick={onLogout}>Çıkış</button>
          </div>
        </div>
      </header>

      <nav className="admin-tabs">
        <div className="admin-tabs-inner">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={'admin-tab' + (tab === t.key ? ' admin-tab-active' : '')}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="admin-main">
        {tab === 'devices' && <DevicesTab onAuthExpired={handleExpired} />}
        {tab === 'prices' && <PriceRulesTab onAuthExpired={handleExpired} />}
        {tab === 'settings' && <SettingsTab onAuthExpired={handleExpired} />}
      </main>
    </div>
  );
}
