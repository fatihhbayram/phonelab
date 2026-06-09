// GET /api/admin/price-rules/export — fiyat kurallarını CSV dosyası olarak indirir.
// Çıktı kolonları: group,issue,min,max,days (import ile round-trip uyumlu).
import { NextResponse } from 'next/server';
import { readConfig } from '@/lib/config';
import { priceRulesToCsv } from '@/lib/priceCsv';

export async function GET() {
  try {
    const config = readConfig();
    const csv = priceRulesToCsv(config);
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="phonelab-price-rules-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'CSV dışa aktarılamadı' }, { status: 500 });
  }
}
