// GET  /api/buyback/calculate — sihirbaz için seçenekler + uygun model listesi + WhatsApp şablonu (public).
// Sprint 6 (Karar 12): sitede fiyat hesaplanmaz/gösterilmez. Sihirbaz seçimleri frontend'te
// WhatsApp mesajına dönüşür, fiyatı mağaza sahibi verir. POST teklif hesaplama devre dışı (410).
import { NextResponse } from 'next/server';
import { readBuybackRules, eligibleModels } from '@/lib/buyback';
import { readConfig } from '@/lib/config';

export async function GET() {
  try {
    const rules = readBuybackRules();
    const cfg = readConfig();
    return NextResponse.json({
      data: {
        currency: rules.currency,
        options: rules.options,
        models: eligibleModels(rules),
        // Frontend wa.me linkini bundan üretir: {model}/{storage}/{screen}/{battery}/{cosmetic}/{box}.
        whatsapp: {
          number: cfg.whatsapp.number,
          template: cfg.whatsapp.buyback_template ?? '',
        },
      },
    });
  } catch {
    return NextResponse.json({ error: 'Alım kuralları yüklenemedi' }, { status: 500 });
  }
}

// Sprint 6: fiyat sunucuda hesaplanmaz; teklif akışı WhatsApp'a taşındı. Motor (lib/buyback.ts)
// ve config/buyback_rules.json kod olarak korunur — yalnızca bu uç nokta devre dışı.
export function POST() {
  return NextResponse.json(
    {
      error: 'Bu uç nokta kullanım dışı. Cihaz alım teklifi WhatsApp üzerinden mağaza tarafından verilir.',
      code: 'GONE',
    },
    { status: 410 },
  );
}
