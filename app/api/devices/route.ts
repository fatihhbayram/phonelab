import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT id, brand, model FROM devices ORDER BY brand, model'
    );
    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json({ error: 'Cihazlar yüklenemedi' }, { status: 500 });
  } finally {
    conn.release();
  }
}
