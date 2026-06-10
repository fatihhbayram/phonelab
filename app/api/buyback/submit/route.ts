// POST /api/buyback/submit — Sprint 6 (Karar 12) ile devre dışı (410 Gone).
// Sitede fiyat hesaplanmaz ve kişisel veri toplanmaz; teklif akışı WhatsApp üzerinden yürür.
// buyback_requests tablosu, lib/buyback.ts ve config/buyback_rules.json kod olarak KORUNUR (silinmedi).
import { NextResponse } from 'next/server';

export function POST() {
  return NextResponse.json(
    {
      error: 'Bu uç nokta kullanım dışı. Cihaz alım teklifi WhatsApp üzerinden mağaza tarafından verilir.',
      code: 'GONE',
    },
    { status: 410 },
  );
}
