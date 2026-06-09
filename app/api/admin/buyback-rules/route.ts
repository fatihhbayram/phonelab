// GET /api/admin/buyback-rules — cihaz alım kurallarını (baz fiyat + katsayılar) döndürür.
// PUT /api/admin/buyback-rules — kısmi & atomik günceller (base_prices / spread / round_to / options).
// /api/admin/* → middleware.ts JWT koruması otomatik geçerli.
import { NextResponse } from 'next/server';
import { readConfig } from '@/lib/config';
import { readBuybackRules, writeBuybackRules } from '@/lib/buyback';
import { updateBuybackRulesSchema } from '@/lib/validations/buyback';

export async function GET() {
  try {
    const rules = readBuybackRules();
    const cfg = readConfig();
    // Editör için: tüm fiyat grupları + mevcut baz fiyatları (henüz tanımsızsa null)
    const groups = Object.entries(cfg.price_rules).map(([group, g]) => ({
      group,
      models: g.models,
      base_price: rules.base_prices[group] ?? null,
    }));
    return NextResponse.json({ data: { rules, groups } });
  } catch {
    return NextResponse.json({ error: 'Alım kuralları yüklenemedi' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = updateBuybackRulesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı alan', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const patch = parsed.data;

  try {
    const rules = readBuybackRules();

    // base_prices: yalnızca config'te tanımlı fiyat grupları için kabul edilir.
    if (patch.base_prices) {
      const validGroups = readConfig().price_rules;
      const unknown = Object.keys(patch.base_prices).filter((g) => !validGroups[g]);
      if (unknown.length > 0) {
        return NextResponse.json(
          { error: 'Geçersiz fiyat grubu', details: { base_prices: unknown } },
          { status: 400 },
        );
      }
      rules.base_prices = { ...rules.base_prices, ...patch.base_prices };
    }

    if (patch.spread !== undefined) rules.spread = patch.spread;
    if (patch.round_to !== undefined) rules.round_to = patch.round_to;

    // options: verilen her kategori tümüyle değiştirilir (verilmeyen kategori dokunulmaz).
    if (patch.options) {
      const o = patch.options;
      if (o.storage) rules.options.storage = o.storage;
      if (o.screen) rules.options.screen = o.screen;
      if (o.battery) rules.options.battery = o.battery;
      if (o.cosmetic) rules.options.cosmetic = o.cosmetic;
      if (o.box_invoice) rules.options.box_invoice = o.box_invoice;
    }

    writeBuybackRules(rules);
    return NextResponse.json({ data: { updated: true, rules } });
  } catch {
    return NextResponse.json({ error: 'Alım kuralları güncellenemedi' }, { status: 500 });
  }
}
