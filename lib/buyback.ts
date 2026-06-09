// PhoneLab — Cihaz Alım (Buyback) fiyat motoru ve config okuma yardımcıları.
// Motor: kusursuz cihaz baz fiyatı × durum katsayıları (çarpımsal) → teklif aralığı.
// config/buyback_rules.json salt-okunur (admin fiyat düzenleme Sprint 5 kapsamı dışında).
import { readFileSync, writeFileSync, renameSync } from 'fs';
import { join } from 'path';
import { readConfig } from './config';

const RULES_PATH = join(process.cwd(), 'config', 'buyback_rules.json');

export interface BuybackOption {
  key: string;
  label: string;
  factor: number;
}

export interface BuybackRules {
  currency: string;
  spread: number; // teklif aralığı: nihai fiyat ± spread
  round_to: number; // min/max bu değere yuvarlanır
  whatsapp_template: string;
  options: {
    storage: BuybackOption[];
    screen: BuybackOption[];
    battery: BuybackOption[];
    cosmetic: BuybackOption[];
    box_invoice: BuybackOption[];
  };
  base_prices: Record<string, number>; // price_group → kusursuz baz fiyat
}

// Taze okuma (dosya küçük, düşük trafik); admin düzenlerse anında yansır.
export function readBuybackRules(): BuybackRules {
  return JSON.parse(readFileSync(RULES_PATH, 'utf-8')) as BuybackRules;
}

// Atomik yazma (tmp + rename) — lib/config.ts ile aynı desen; yarıda kalırsa bozulmaz.
export function writeBuybackRules(rules: BuybackRules): void {
  const tmp = `${RULES_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(rules, null, 2) + '\n', 'utf-8');
  renameSync(tmp, RULES_PATH);
}

// Model adından config price_rules grubunu bul (buyback base_prices grup anahtarıyla aynı).
export function resolveGroup(model: string): string | null {
  const cfg = readConfig();
  for (const [group, g] of Object.entries(cfg.price_rules)) {
    if (g.models.includes(model)) return group;
  }
  return null;
}

export interface BuybackSelection {
  model: string;
  storage: string;
  screen_status: string;
  battery_status: string;
  cosmetic_status: string;
  has_box_invoice: boolean;
}

export interface BuybackQuote {
  model: string;
  price_group: string;
  base_price: number;
  offered_price_min: number;
  offered_price_max: number;
  factors: Record<string, number>;
  labels: Record<string, string>;
}

function pick(list: BuybackOption[], key: string): BuybackOption | undefined {
  return list.find((o) => o.key === key);
}

// Teklif hesapla. null = geçersiz seçim (model tanımsız, grubun baz fiyatı yok
// veya seçenek anahtarlarından biri listede değil). Fiyat daima sunucuda hesaplanır.
export function calculateQuote(sel: BuybackSelection, rules: BuybackRules): BuybackQuote | null {
  const group = resolveGroup(sel.model);
  if (!group) return null;

  const base = rules.base_prices[group];
  if (base === undefined) return null;

  const o = rules.options;
  const storage = pick(o.storage, sel.storage);
  const screen = pick(o.screen, sel.screen_status);
  const battery = pick(o.battery, sel.battery_status);
  const cosmetic = pick(o.cosmetic, sel.cosmetic_status);
  const box = pick(o.box_invoice, sel.has_box_invoice ? 'yes' : 'no');
  if (!storage || !screen || !battery || !cosmetic || !box) return null;

  const raw = base * storage.factor * screen.factor * battery.factor * cosmetic.factor * box.factor;
  const step = rules.round_to > 0 ? rules.round_to : 1;
  const round = (n: number) => Math.max(0, Math.round(n / step) * step);
  const min = round(raw * (1 - rules.spread));
  const max = round(raw * (1 + rules.spread));

  return {
    model: sel.model,
    price_group: group,
    base_price: base,
    offered_price_min: min,
    offered_price_max: Math.max(min, max),
    factors: {
      storage: storage.factor,
      screen: screen.factor,
      battery: battery.factor,
      cosmetic: cosmetic.factor,
      box_invoice: box.factor,
    },
    labels: {
      storage: storage.label,
      screen: screen.label,
      battery: battery.label,
      cosmetic: cosmetic.label,
      box_invoice: box.label,
    },
  };
}

// Buyback için uygun modeller (config price_rules ∩ base_prices tanımlı gruplar).
export function eligibleModels(rules: BuybackRules): { model: string; price_group: string }[] {
  const cfg = readConfig();
  const out: { model: string; price_group: string }[] = [];
  for (const [group, g] of Object.entries(cfg.price_rules)) {
    if (rules.base_prices[group] === undefined) continue;
    for (const model of g.models) out.push({ model, price_group: group });
  }
  return out;
}

// wa.me linki için şablonu doldur. WhatsApp numarası whatsapp.json'dan (tek kaynak).
export function buildWhatsappUrl(
  quote: BuybackQuote,
  rules: BuybackRules,
  customer: { name: string; phone: string },
): string {
  const cfg = readConfig();
  const number = cfg.whatsapp.number;
  const text = rules.whatsapp_template
    .replace('{model}', quote.model)
    .replace('{storage}', quote.labels.storage)
    .replace('{offer_range}', `${quote.offered_price_min} - ${quote.offered_price_max}`)
    .replace('{screen}', quote.labels.screen)
    .replace('{battery}', quote.labels.battery)
    .replace('{cosmetic}', quote.labels.cosmetic)
    .replace('{box}', quote.labels.box_invoice)
    .replace('{name}', customer.name)
    .replace('{phone}', customer.phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
