// GET  /api/buyback/calculate — sihirbaz için seçenekler + uygun model listesi (public).
// POST /api/buyback/calculate — cihaz seçimine göre teklif aralığı hesaplar (public, DB'ye yazmaz).
import { NextResponse } from 'next/server';
import { readBuybackRules, eligibleModels, calculateQuote } from '@/lib/buyback';
import { buybackSelectionSchema } from '@/lib/validations/buyback';

export async function GET() {
  try {
    const rules = readBuybackRules();
    return NextResponse.json({
      data: {
        currency: rules.currency,
        options: rules.options,
        models: eligibleModels(rules),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Alım kuralları yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = buybackSelectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı alan', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const rules = readBuybackRules();
    const quote = calculateQuote(parsed.data, rules);
    if (!quote) {
      return NextResponse.json({ error: 'Geçersiz cihaz veya durum seçimi' }, { status: 400 });
    }
    return NextResponse.json({
      data: {
        model: quote.model,
        currency: rules.currency,
        offered_price_min: quote.offered_price_min,
        offered_price_max: quote.offered_price_max,
        labels: quote.labels,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Teklif hesaplanamadı' }, { status: 500 });
  }
}
