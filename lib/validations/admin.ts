// PhoneLab — Admin endpoint Zod şemaları. Her POST/PUT girdisi burada doğrulanır.
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Kullanıcı adı gerekli').max(50),
  password: z.string().min(1, 'Şifre gerekli').max(200),
});

// Tek arıza için fiyat aralığı
export const priceEntrySchema = z.object({
  min: z.number().int().min(0),
  max: z.number().int().min(0),
  days: z.number().int().min(0).max(60),
}).refine((p) => p.max >= p.min, { message: 'max, min değerinden küçük olamaz' });

// Yeni cihaz: DB'ye eklenir + mevcut bir fiyat grubuna iliştirilir
export const newDeviceSchema = z.object({
  brand: z.string().trim().min(1).max(50),
  model: z.string().trim().min(1).max(100),
  price_group: z.string().trim().min(1).max(100), // config/whatsapp.json price_rules anahtarı
});

// Bir fiyat grubunun arıza fiyatlarını güncelleme
export const updatePriceRuleSchema = z.object({
  group: z.string().trim().min(1).max(100),
  prices: z.record(z.string(), priceEntrySchema),
});

// Cihaz silme: DB'den ve config grubundan kaldırılır
export const deleteDeviceSchema = z.object({
  model: z.string().trim().min(1).max(100),
  price_group: z.string().trim().min(1).max(100),
});

// Config price_rules anahtarı: küçük harf, rakam, alt çizgi (slug)
const groupKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9_]+$/, 'Yalnızca küçük harf, rakam ve alt çizgi');

// Yeni fiyat grubu oluşturma / mevcut bir gruptan klonlama.
// clone_from verilirse o grubun fiyatları kopyalanır (models hariç).
export const createPriceGroupSchema = z.object({
  group: groupKeySchema,
  clone_from: z.string().trim().min(1).max(100).optional(),
});

// Toplu fiyat güncelleme: yüzde veya sabit tutar, artış (+) / azalış (-).
// groups/issues boş bırakılırsa tüm gruplara / tüm arıza türlerine uygulanır.
export const bulkPriceSchema = z.object({
  mode: z.enum(['percent', 'fixed']),
  value: z.number().finite(), // negatif = azalış
  groups: z.array(z.string().trim().min(1).max(100)).optional(),
  issues: z.array(z.string().trim().min(1).max(100)).optional(),
});

// Site ayarları (about / contact / social)
export const settingsSchema = z.object({
  about: z.object({
    title: z.string().trim().min(1).max(120),
    body: z.string().trim().min(1).max(5000),
  }),
  contact: z.object({
    phone: z.string().trim().max(40),
    whatsapp: z.string().trim().regex(/^\d{8,15}$/, 'Sadece rakam, ülke koduyla'),
    address: z.string().trim().max(300),
    email: z.string().trim().max(120).refine(
      (v) => v === '' || z.string().email().safeParse(v).success,
      { message: 'Geçersiz e-posta' },
    ),
  }),
  social: z.object({
    instagram: z.string().trim().max(300),
    google_maps: z.string().trim().max(500),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type NewDeviceInput = z.infer<typeof newDeviceSchema>;
export type UpdatePriceRuleInput = z.infer<typeof updatePriceRuleSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
