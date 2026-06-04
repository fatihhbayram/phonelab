// PhoneLab — /api/admin/* koruması. Edge runtime'da jose ile access token doğrular.
import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken, ACCESS_COOKIE } from '@/lib/auth';

// Access token gerektirmeyen yollar: giriş, çıkış, refresh
const PUBLIC_PATHS = new Set([
  '/api/admin/auth',
  '/api/admin/auth/logout',
  '/api/admin/auth/refresh',
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    await verifyToken(token, 'access');
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
