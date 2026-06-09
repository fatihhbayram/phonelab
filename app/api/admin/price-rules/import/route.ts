// POST /api/admin/price-rules/import — CSV ile fiyat kurallarını toplu günceller.
// Gövde: ham text/csv VEYA JSON { "csv": "..." }. Kolonlar: group,issue,min,max,days.
// Doğrulama tümü-veya-hiçbiri: tek satır bile hatalıysa hiçbir şey yazılmaz (atomik).
import { NextResponse } from 'next/server';
import { readConfig, writeConfig, type PriceEntry } from '@/lib/config';
import { parsePriceRulesCsv } from '@/lib/priceCsv';

export async function POST(request: Request) {
  // Gövdeyi içeriğe göre oku: JSON ise csv alanı, değilse ham metin.
  let csvText: string;
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const json = (await request.json()) as { csv?: unknown };
      if (typeof json.csv !== 'string') {
        return NextResponse.json({ error: 'csv alanı (string) gerekli' }, { status: 400 });
      }
      csvText = json.csv;
    } else {
      csvText = await request.text();
    }
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  if (csvText.trim() === '') {
    return NextResponse.json({ error: 'Boş CSV' }, { status: 400 });
  }

  try {
    const config = readConfig();
    const validGroups = new Set(Object.keys(config.price_rules));
    const validIssues = new Set(Object.keys(config.issue_types));

    const { rows, errors } = parsePriceRulesCsv(csvText, validGroups, validIssues);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV doğrulama hatası — hiçbir değişiklik uygulanmadı', details: errors },
        { status: 400 },
      );
    }
    if (rows.length === 0) {
      return NextResponse.json({ error: 'İçe aktarılacak geçerli satır yok' }, { status: 400 });
    }

    // Tüm satırlar geçerli → bellekte uygula, sonra tek seferde yaz.
    for (const { group, issue, entry } of rows) {
      config.price_rules[group][issue] = entry as PriceEntry;
    }
    writeConfig(config);

    return NextResponse.json({ data: { imported: rows.length } });
  } catch {
    return NextResponse.json({ error: 'CSV içe aktarılamadı' }, { status: 500 });
  }
}
