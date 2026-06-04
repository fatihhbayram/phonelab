// PhoneLab — config/whatsapp.json okuma/yazma yardımcıları.
// Yazma atomik yapılır (tmp + rename) — süreç yazma ortasında ölürse dosya bozulmaz.
import { readFileSync, writeFileSync, renameSync } from 'fs';
import { join } from 'path';

const CONFIG_PATH = join(process.cwd(), 'config', 'whatsapp.json');

export interface PriceEntry {
  min: number;
  max: number;
  days: number;
}

export interface PriceGroup {
  models: string[];
  [issue: string]: string[] | PriceEntry;
}

export interface SiteSettings {
  about: { title: string; body: string };
  contact: { phone: string; whatsapp: string; address: string; email: string };
  social: { instagram: string; google_maps: string };
}

export interface SiteConfig {
  whatsapp: { number: string; message_template: string };
  issue_types: Record<string, { label: string }>;
  price_rules: Record<string, PriceGroup>;
  settings?: SiteSettings;
}

// Her okuma taze yapılır (dosya ~20KB, tek instance, düşük trafik).
// Böylece admin yazdıktan sonra public GET anında güncel veriyi görür.
export function readConfig(): SiteConfig {
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as SiteConfig;
}

export function writeConfig(config: SiteConfig): void {
  const tmp = `${CONFIG_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  renameSync(tmp, CONFIG_PATH);
}
