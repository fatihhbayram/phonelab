// POST /api/admin/auth/logout — access + refresh cookie'lerini temizler.
import { NextResponse } from 'next/server';
import { cookieOptions, ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_PATH } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ data: { ok: true } });
  // maxAge 0 → tarayıcı siler; refresh cookie aynı path ile temizlenmeli
  res.cookies.set(ACCESS_COOKIE, '', cookieOptions(0));
  res.cookies.set(REFRESH_COOKIE, '', cookieOptions(0, REFRESH_PATH));
  return res;
}
