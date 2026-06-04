// GET /api/admin/auth/me — geçerli access token varsa admin bilgisini döner.
// (Bu yol middleware ile de korunuyor; burada access token tekrar doğrulanır.)
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, ACCESS_COOKIE } from '@/lib/auth';

export async function GET() {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token, 'access');
    return NextResponse.json({ data: { id: payload.sub, username: payload.username } });
  } catch {
    return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 });
  }
}
