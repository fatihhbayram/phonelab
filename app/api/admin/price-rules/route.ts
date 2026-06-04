// PUT /api/admin/price-rules — bir fiyat grubunun arıza fiyatlarını günceller.
import { NextResponse } from 'next/server';
import { readConfig, writeConfig, type PriceEntry } from '@/lib/config';
import { updatePriceRuleSchema } from '@/lib/validations/admin';

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = updatePriceRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı alan', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { group: groupKey, prices } = parsed.data;

  try {
    const config = readConfig();
    const group = config.price_rules[groupKey];
    if (!group) {
      return NextResponse.json({ error: 'Geçersiz fiyat grubu' }, { status: 400 });
    }

    // Sadece tanımlı arıza türleri güncellenebilir
    for (const issue of Object.keys(prices)) {
      if (!config.issue_types[issue]) {
        return NextResponse.json({ error: `Geçersiz arıza türü: ${issue}` }, { status: 400 });
      }
      group[issue] = prices[issue] as PriceEntry;
    }

    writeConfig(config);
    return NextResponse.json({ data: { group: groupKey, ...group } });
  } catch {
    return NextResponse.json({ error: 'Fiyatlar güncellenemedi' }, { status: 500 });
  }
}
