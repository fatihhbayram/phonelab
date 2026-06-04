'use client';

// /admin/login — yönetim girişi. Başarılı POST cookie set eder, dashboard'a yönlendirir.
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ApiError } from '@/lib/adminApi';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Zaten oturumu varsa doğrudan dashboard'a al.
  useEffect(() => {
    fetch('/api/admin/auth/me', { credentials: 'include' })
      .then((r) => { if (r.ok) router.replace('/admin/dashboard'); })
      .catch(() => {});
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (!res.ok) {
        let msg = 'Giriş yapılamadı';
        try { const b = await res.json(); if (b?.error) msg = b.error; } catch {}
        throw new ApiError(msg, res.status);
      }
      router.replace('/admin/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Bağlantı hatası, tekrar deneyin');
      setLoading(false);
    }
  }

  return (
    <div className="admin-auth">
      <form className="admin-auth-card" onSubmit={onSubmit}>
        <div className="admin-auth-head">
          <Image
            src="/assets/logo/phonelab_logo_dahk.png"
            alt="PhoneLab"
            width={150}
            height={100}
            priority
            style={{ height: 48, width: 'auto' }}
          />
          <div className="eyebrow" style={{ marginTop: 18 }}>Yönetim Paneli</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4 }}>
            Giriş yapın
          </h1>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <label className="admin-field-group">
          <span className="admin-label">Kullanıcı adı</span>
          <input
            className="field"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className="admin-field-group">
          <span className="admin-label">Şifre</span>
          <input
            className="field"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', width: '100%' }}>
          {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
      </form>
    </div>
  );
}
