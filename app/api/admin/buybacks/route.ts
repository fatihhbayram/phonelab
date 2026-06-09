// GET   /api/admin/buybacks — alım taleplerini listeler (en yeni önce). ?status= ile filtre.
// PATCH /api/admin/buybacks — bir talebin durumunu günceller {id, status}.
// /api/admin/* → middleware.ts JWT koruması otomatik geçerli (ek koruma yazılmadı).
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { buybackStatusSchema, buybackStatuses } from '@/lib/validations/buyback';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  if (status && !(buybackStatuses as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'Geçersiz durum filtresi' }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const cols =
      'id, customer_name, customer_phone, kvkk_consent, price_group, model, storage, ' +
      'screen_status, battery_status, cosmetic_status, has_box_invoice, ' +
      'offered_price_min, offered_price_max, status, created_at';
    const [rows] = status
      ? await conn.execute(
          `SELECT ${cols} FROM buyback_requests WHERE status = ? ORDER BY created_at DESC LIMIT 500`,
          [status],
        )
      : await conn.execute(
          `SELECT ${cols} FROM buyback_requests ORDER BY created_at DESC LIMIT 500`,
        );
    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json({ error: 'Talepler yüklenemedi' }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = buybackStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı alan', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { id, status } = parsed.data;

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      'UPDATE buyback_requests SET status = ? WHERE id = ?',
      [status, id],
    );
    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affected === 0) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }
    return NextResponse.json({ data: { id, status } });
  } catch {
    return NextResponse.json({ error: 'Durum güncellenemedi' }, { status: 500 });
  } finally {
    conn.release();
  }
}
