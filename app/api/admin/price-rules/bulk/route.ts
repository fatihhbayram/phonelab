// POST /api/admin/price-rules/bulk — seçili grup/arızalara toplu fiyat ayarı uygular.
// mode: 'percent' (yüzde) | 'fixed' (sabit TL); value: pozitif=artış, negatif=azalış.
// groups/issues boş bırakılırsa tüm gruplar / tüm arıza türleri hedeflenir.
import { NextResponse } from 'next/server';
import { readConfig, writeConfig, type PriceEntry } from '@/lib/config';
import { bulkPriceSchema } from '@/lib/validations/admin';

function adjust(amount: number, mode: 'percent' | 'fixed', value: number): number {
  const next = mode === 'percent' ? amount * (1 + value / 100) : amount + value;
  return Math.max(0, Math.round(next));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  const parsed = bulkPriceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Eksik veya hatalı alan', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { mode, value, groups, issues } = parsed.data;

  try {
    const config = readConfig();

    // Hedef grupları belirle ve doğrula
    const targetGroups = groups && groups.length > 0 ? groups : Object.keys(config.price_rules);
    for (const g of targetGroups) {
      if (!config.price_rules[g]) {
        return NextResponse.json({ error: `Geçersiz fiyat grubu: ${g}` }, { status: 400 });
      }
    }

    // Hedef arıza türlerini belirle ve doğrula
    const targetIssues = issues && issues.length > 0 ? issues : Object.keys(config.issue_types);
    for (const i of targetIssues) {
      if (!config.issue_types[i]) {
        return NextResponse.json({ error: `Geçersiz arıza türü: ${i}` }, { status: 400 });
      }
    }

    let updated = 0;
    for (const g of targetGroups) {
      const group = config.price_rules[g];
      for (const issue of targetIssues) {
        const entry = group[issue];
        if (entry && typeof entry === 'object' && 'min' in entry) {
          const e = entry as PriceEntry;
          const min = adjust(e.min, mode, value);
          let max = adjust(e.max, mode, value);
          if (max < min) max = min; // sıralama korunur
          e.min = min;
          e.max = max;
          updated++;
        }
      }
    }

    writeConfig(config);
    return NextResponse.json({
      data: { mode, value, groups: targetGroups.length, issues: targetIssues.length, updated },
    });
  } catch {
    return NextResponse.json({ error: 'Toplu güncelleme başarısız' }, { status: 500 });
  }
}
