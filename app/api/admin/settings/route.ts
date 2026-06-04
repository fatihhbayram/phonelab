// PUT /api/admin/settings — site ayarlarını (about / contact / social) günceller.
import { NextResponse } from 'next/server';
import { readConfig, writeConfig } from '@/lib/config';
import { settingsSchema } from '@/lib/validations/admin';

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı alan', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const config = readConfig();
    config.settings = parsed.data;
    writeConfig(config);
    return NextResponse.json({ data: parsed.data });
  } catch {
    return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 });
  }
}
