// PhoneLab — Cihaz Alım (Buyback) endpoint Zod şemaları. Public girdi; sıkı doğrula.
import { z } from 'zod';

// Cihaz seçimi (calculate ve submit ortak temeli). Anahtarlar lib/buyback.ts'te
// buyback_rules.json'a karşı doğrulanır; burada yalnızca biçim/uzunluk kontrolü.
export const buybackSelectionSchema = z.object({
  model: z.string().trim().min(1).max(100),
  storage: z.string().trim().min(1).max(20),
  screen_status: z.string().trim().min(1).max(30),
  battery_status: z.string().trim().min(1).max(30),
  cosmetic_status: z.string().trim().min(1).max(30),
  has_box_invoice: z.boolean(),
});

// Teklif gönderme: seçim + müşteri iletişim + zorunlu KVKK onayı.
export const buybackSubmitSchema = buybackSelectionSchema.extend({
  customer_name: z.string().trim().min(2, 'Ad gerekli').max(100),
  customer_phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{7,20}$/, 'Geçersiz telefon numarası'),
  kvkk_consent: z.boolean().refine((v) => v === true, { message: 'KVKK onayı gerekli' }),
});

// Talep durumları (DB ENUM ile birebir).
export const buybackStatuses = ['pending', 'contacted', 'completed', 'rejected'] as const;

// Admin durum güncelleme: PATCH /api/admin/buybacks
export const buybackStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(buybackStatuses),
});

// --- Admin: buyback_rules.json düzenleme (Sprint 5.1) ---

// Tek durum seçeneği (katsayı). factor > 0 (çarpımsal).
const buybackOptionSchema = z.object({
  key: z.string().trim().min(1).max(30),
  label: z.string().trim().min(1).max(120),
  factor: z.number().positive().max(10),
});

// Bir kategorinin seçenek listesi: en az 1, anahtarlar benzersiz.
const optionListSchema = z
  .array(buybackOptionSchema)
  .min(1)
  .refine((arr) => new Set(arr.map((o) => o.key)).size === arr.length, {
    message: 'Seçenek anahtarları benzersiz olmalı',
  });

// options bloğu (kısmi): verilen kategoriler tümüyle değiştirilir.
// box_invoice verilirse 'yes' ve 'no' anahtarları zorunlu (motor bunları kullanır).
const buybackOptionsSchema = z
  .object({
    storage: optionListSchema,
    screen: optionListSchema,
    battery: optionListSchema,
    cosmetic: optionListSchema,
    box_invoice: optionListSchema.refine(
      (arr) => arr.some((o) => o.key === 'yes') && arr.some((o) => o.key === 'no'),
      { message: "box_invoice 'yes' ve 'no' anahtarlarını içermeli" },
    ),
  })
  .partial();

// PUT /api/admin/buyback-rules — kısmi güncelleme; en az bir alan gerekli.
// base_prices anahtarları route'ta config price_rules'a karşı doğrulanır.
export const updateBuybackRulesSchema = z
  .object({
    base_prices: z.record(z.string(), z.number().int().min(0).max(10_000_000)).optional(),
    spread: z.number().min(0).max(0.9).optional(),
    round_to: z.number().int().min(1).max(10_000).optional(),
    options: buybackOptionsSchema.optional(),
  })
  .refine(
    (o) =>
      o.base_prices !== undefined ||
      o.spread !== undefined ||
      o.round_to !== undefined ||
      o.options !== undefined,
    { message: 'En az bir güncellenecek alan gerekli' },
  );

export type BuybackSelectionInput = z.infer<typeof buybackSelectionSchema>;
export type BuybackSubmitInput = z.infer<typeof buybackSubmitSchema>;
export type UpdateBuybackRulesInput = z.infer<typeof updateBuybackRulesSchema>;
