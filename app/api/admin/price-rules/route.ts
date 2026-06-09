// PUT /api/admin/price-rules — bir fiyat grubunun arıza fiyatlarını günceller.
import { NextResponse } from 'next/server';
import { readConfig, writeConfig, type PriceEntry, type PriceGroup } from '@/lib/config';
import { updatePriceRuleSchema, createPriceGroupSchema } from '@/lib/validations/admin';
import { clonePriceEntries } from '@/lib/priceCsv';

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

// POST /api/admin/price-rules — yeni fiyat grubu oluşturur veya mevcut bir gruptan klonlar.
// clone_from verilirse o grubun arıza fiyatları kopyalanır; yoksa tüm arızalar 0/0/1 başlar.
// Yeni grup models[] boş başlar — cihazlar POST /api/admin/devices ile eklenir.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = createPriceGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı alan', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { group: newKey, clone_from } = parsed.data;

  try {
    const config = readConfig();
    if (config.price_rules[newKey]) {
      return NextResponse.json({ error: 'Bu fiyat grubu zaten var' }, { status: 409 });
    }

    const issueKeys = Object.keys(config.issue_types);
    let prices: Record<string, PriceEntry>;
    if (clone_from) {
      const source = config.price_rules[clone_from];
      if (!source) {
        return NextResponse.json({ error: 'Klonlanacak grup bulunamadı' }, { status: 400 });
      }
      prices = clonePriceEntries(source, issueKeys);
    } else {
      prices = Object.fromEntries(issueKeys.map((i) => [i, { min: 0, max: 0, days: 1 }]));
    }

    const group: PriceGroup = { models: [], ...prices };
    config.price_rules[newKey] = group;
    writeConfig(config);

    return NextResponse.json({ data: { group: newKey, ...group } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Fiyat grubu oluşturulamadı' }, { status: 500 });
  }
}
