// POST /api/admin/auth/refresh — geçerli refresh cookie ile yeni access + refresh üretir.
// Refresh token rotasyonu: her yenilemede yeni 7g refresh verilir (sliding session).
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  cookieOptions,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
  REFRESH_PATH,
} from '@/lib/auth';

export async function POST() {
  const token = cookies().get(REFRESH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token, 'refresh');
    const identity = { id: Number(payload.sub), username: payload.username };

    const [access, refresh] = await Promise.all([
      createAccessToken(identity),
      createRefreshToken(identity),
    ]);

    const res = NextResponse.json({ data: { username: identity.username } });
    res.cookies.set(ACCESS_COOKIE, access, cookieOptions(ACCESS_MAX_AGE));
    res.cookies.set(REFRESH_COOKIE, refresh, cookieOptions(REFRESH_MAX_AGE, REFRESH_PATH));
    return res;
  } catch {
    return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 });
  }
}
