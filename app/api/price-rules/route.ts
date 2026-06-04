// GET /api/price-rules — Apple fiyat kuralları + site ayarları (public).
// Taze okunur (lib/config) ki admin paneli güncellemesi anında yansısın.
import { NextResponse } from 'next/server';
import { readConfig } from '@/lib/config';

export async function GET() {
  try {
    const config = readConfig();
    return NextResponse.json({
      data: {
        issue_types: config.issue_types,
        price_rules: config.price_rules,
        whatsapp: config.whatsapp,
        settings: config.settings,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Fiyat kuralları yüklenemedi' }, { status: 500 });
  }
}
