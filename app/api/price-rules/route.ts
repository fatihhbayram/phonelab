import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

let cachedConfig: Record<string, unknown> | null = null;

function loadConfig() {
  if (!cachedConfig) {
    const filePath = join(process.cwd(), 'config', 'whatsapp.json');
    cachedConfig = JSON.parse(readFileSync(filePath, 'utf-8'));
  }
  return cachedConfig;
}

export async function GET() {
  try {
    const config = loadConfig();
    return NextResponse.json({
      data: {
        issue_types: config.issue_types,
        price_rules: config.price_rules,
        whatsapp: config.whatsapp,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Fiyat kuralları yüklenemedi' }, { status: 500 });
  }
}
