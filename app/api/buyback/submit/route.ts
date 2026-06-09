// POST /api/buyback/submit — teklifi kaydeder (KVKK onayıyla) + WhatsApp yönlendirme linki döner (public).
// Fiyat DAİMA sunucuda yeniden hesaplanır; client'tan gelen tutara güvenilmez.
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { readBuybackRules, calculateQuote, buildWhatsappUrl } from '@/lib/buyback';
import { buybackSubmitSchema } from '@/lib/validations/buyback';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = buybackSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı alan', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const conn = await pool.getConnection();
  try {
    const rules = readBuybackRules();
    const quote = calculateQuote(d, rules);
    if (!quote) {
      return NextResponse.json({ error: 'Geçersiz cihaz veya durum seçimi' }, { status: 400 });
    }

    const [result] = await conn.execute(
      `INSERT INTO buyback_requests
        (customer_name, customer_phone, kvkk_consent, price_group, model, storage,
         screen_status, battery_status, cosmetic_status, has_box_invoice,
         offered_price_min, offered_price_max)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.customer_name,
        d.customer_phone,
        d.kvkk_consent ? 1 : 0,
        quote.price_group,
        quote.model,
        d.storage,
        d.screen_status,
        d.battery_status,
        d.cosmetic_status,
        d.has_box_invoice ? 1 : 0,
        quote.offered_price_min,
        quote.offered_price_max,
      ],
    );

    const id = (result as { insertId?: number }).insertId ?? null;
    const whatsapp_url = buildWhatsappUrl(quote, rules, {
      name: d.customer_name,
      phone: d.customer_phone,
    });

    return NextResponse.json(
      {
        data: {
          id,
          model: quote.model,
          offered_price_min: quote.offered_price_min,
          offered_price_max: quote.offered_price_max,
          currency: rules.currency,
          whatsapp_url,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Talep kaydedilemedi' }, { status: 500 });
  } finally {
    conn.release();
  }
}
