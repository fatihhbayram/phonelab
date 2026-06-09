// PhoneLab — Fiyat kurallarının CSV'ye dökümü ve CSV'den ayrıştırılması.
// Round-trip uyumlu: export çıktısı import'a doğrudan geri verilebilir.
// Kolonlar: group,issue,min,max,days
import type { PriceEntry, PriceGroup, SiteConfig } from '@/lib/config';

export const CSV_HEADER = 'group,issue,min,max,days';

function csvField(value: string | number): string {
  const s = String(value);
  // Slug ve sayılar virgül/tırnak içermez; yine de güvenli tarafta kal.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Config'teki tüm grup × arıza fiyatlarını CSV metnine çevirir.
export function priceRulesToCsv(config: SiteConfig): string {
  const lines: string[] = [CSV_HEADER];
  for (const [groupKey, group] of Object.entries(config.price_rules)) {
    for (const issue of Object.keys(config.issue_types)) {
      const entry = group[issue];
      if (entry && typeof entry === 'object' && 'min' in entry) {
        const e = entry as PriceEntry;
        lines.push([groupKey, issue, e.min, e.max, e.days].map(csvField).join(','));
      }
    }
  }
  return lines.join('\n') + '\n';
}

export interface ParsedPriceRow {
  group: string;
  issue: string;
  entry: PriceEntry;
}

export interface CsvParseResult {
  rows: ParsedPriceRow[];
  errors: string[];
}

// Tek bir CSV satırını alanlara böler (basit tırnak desteğiyle).
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((f) => f.trim());
}

// CSV metnini ayrıştırır ve config'e göre doğrular.
// validGroups / validIssues geçerli anahtar kümeleridir; bilinmeyenler hata olur.
export function parsePriceRulesCsv(
  text: string,
  validGroups: Set<string>,
  validIssues: Set<string>,
): CsvParseResult {
  const rows: ParsedPriceRow[] = [];
  const errors: string[] = [];

  const rawLines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (rawLines.length === 0) {
    return { rows, errors: ['Boş CSV'] };
  }

  // İlk satır başlıksa atla.
  let start = 0;
  if (rawLines[0].toLowerCase().replace(/\s/g, '').startsWith('group,issue')) {
    start = 1;
  }

  for (let i = start; i < rawLines.length; i++) {
    const lineNo = i + 1;
    const fields = splitCsvLine(rawLines[i]);
    if (fields.length !== 5) {
      errors.push(`Satır ${lineNo}: 5 kolon bekleniyor, ${fields.length} bulundu`);
      continue;
    }
    const [group, issue, minStr, maxStr, daysStr] = fields;

    if (!validGroups.has(group)) {
      errors.push(`Satır ${lineNo}: geçersiz fiyat grubu "${group}"`);
      continue;
    }
    if (!validIssues.has(issue)) {
      errors.push(`Satır ${lineNo}: geçersiz arıza türü "${issue}"`);
      continue;
    }

    const min = Number(minStr);
    const max = Number(maxStr);
    const days = Number(daysStr);
    if (!Number.isInteger(min) || !Number.isInteger(max) || !Number.isInteger(days)) {
      errors.push(`Satır ${lineNo}: min/max/days tam sayı olmalı`);
      continue;
    }
    if (min < 0 || max < 0 || days < 0) {
      errors.push(`Satır ${lineNo}: değerler negatif olamaz`);
      continue;
    }
    if (max < min) {
      errors.push(`Satır ${lineNo}: max (${max}), min (${min}) değerinden küçük olamaz`);
      continue;
    }
    if (days > 60) {
      errors.push(`Satır ${lineNo}: days en fazla 60 olabilir`);
      continue;
    }

    rows.push({ group, issue, entry: { min, max, days } });
  }

  return { rows, errors };
}

// Bir grubun mevcut tüm arıza fiyatlarını (PriceEntry olanları) kopyalar.
export function clonePriceEntries(group: PriceGroup, issueKeys: string[]): Record<string, PriceEntry> {
  const out: Record<string, PriceEntry> = {};
  for (const issue of issueKeys) {
    const entry = group[issue];
    if (entry && typeof entry === 'object' && 'min' in entry) {
      const e = entry as PriceEntry;
      out[issue] = { min: e.min, max: e.max, days: e.days };
    }
  }
  return out;
}
