// POST /api/admin/auth — admin login. Başarılıysa access(15m)+refresh(7d) cookie set eder.
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { loginSchema } from '@/lib/validations/admin';
import {
  createAccessToken,
  createRefreshToken,
  cookieOptions,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
  REFRESH_PATH,
} from '@/lib/auth';

interface AdminRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute<AdminRow[]>(
      'SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1',
      [parsed.data.username],
    );

    const admin = rows[0];
    // Generic mesaj + her durumda bcrypt çalışsın (timing) diye sahte hash ile karşılaştır
    const hash = admin?.password_hash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
    const ok = await bcrypt.compare(parsed.data.password, hash);

    if (!admin || !ok) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
    }

    const identity = { id: admin.id, username: admin.username };
    const [access, refresh] = await Promise.all([
      createAccessToken(identity),
      createRefreshToken(identity),
    ]);

    const res = NextResponse.json({ data: { username: admin.username } });
    res.cookies.set(ACCESS_COOKIE, access, cookieOptions(ACCESS_MAX_AGE));
    res.cookies.set(REFRESH_COOKIE, refresh, cookieOptions(REFRESH_MAX_AGE, REFRESH_PATH));
    return res;
  } catch {
    return NextResponse.json({ error: 'Giriş yapılamadı' }, { status: 500 });
  } finally {
    conn.release();
  }
}
