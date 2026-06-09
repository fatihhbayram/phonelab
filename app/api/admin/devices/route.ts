// POST /api/admin/devices — yeni cihazı DB'ye ekler + config price_rules grubuna iliştirir.
// DB insert ile config yazımı tek transaction'da tutulur; biri başarısız olursa rollback.
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { readConfig, writeConfig } from '@/lib/config';
import { newDeviceSchema, deleteDeviceSchema } from '@/lib/validations/admin';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = newDeviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı alan', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { brand, model, price_group } = parsed.data;

  // Fiyat grubu config'te yoksa cihaza fiyat atanamaz
  const config = readConfig();
  const group = config.price_rules[price_group];
  if (!group) {
    return NextResponse.json({ error: 'Geçersiz fiyat grubu' }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('INSERT INTO devices (brand, model) VALUES (?, ?)', [brand, model]);

    if (!group.models.includes(model)) {
      group.models.push(model);
    }
    writeConfig(config);

    await conn.commit();
    return NextResponse.json({ data: { brand, model, price_group } }, { status: 201 });
  } catch {
    await conn.rollback();
    return NextResponse.json({ error: 'Cihaz eklenemedi' }, { status: 500 });
  } finally {
    conn.release();
  }
}

// DELETE /api/admin/devices — cihazı DB'den ve config price_rules grubundan kaldırır.
// İki işlem tek transaction'da; biri başarısız olursa rollback.
export async function DELETE(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = deleteDeviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı alan', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { model, price_group } = parsed.data;

  const config = readConfig();
  const group = config.price_rules[price_group];
  if (!group) {
    return NextResponse.json({ error: 'Geçersiz fiyat grubu' }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute(
      'DELETE FROM devices WHERE model = ?',
      [model],
    );

    const idx = group.models.indexOf(model);
    if (idx !== -1) {
      group.models.splice(idx, 1);
    }
    writeConfig(config);

    await conn.commit();
    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    return NextResponse.json({ data: { model, price_group, db_removed: affected } });
  } catch {
    await conn.rollback();
    return NextResponse.json({ error: 'Cihaz silinemedi' }, { status: 500 });
  } finally {
    conn.release();
  }
}
