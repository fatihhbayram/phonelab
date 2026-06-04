# PhoneLab — Profesyonel Telefon Teknik Servis Platformu

PhoneLab, Apple cihazları için optimize edilmiş, modern ve dinamik bir telefon tamir dükkanı web sitesidir. Kullanıcılara premium bir servis deneyimi sunmak amacıyla temiz ve güven veren bir tasarıma sahiptir.

## 🌟 Temel Özellikler

*   **Apple Fiyat Tahmin Motoru (Sihirbaz):** Müşterilerin Apple cihazlarını (iPhone, iPad, Watch), karşılaştıkları arıza türünü ve cihaz durumunu adım adım seçebilecekleri interaktif bir sihirbaz.
*   **WhatsApp Entegrasyonlu Teklif Sistemi:** Müşteri tahmin motorunun sonunda, yaptığı seçimlerin (cihaz modeli, seçilen arıza ve tahmini fiyat aralığı) otomatik olarak doldurulduğu pre-filled mesajla tek tıkla doğrudan WhatsApp hattına yönlendirilir.
*   **Yönetim (Admin) Paneli (`/admin`):** JWT kimlik doğrulama korumalı yönetim ekranı. Cihaz/model ekleme, hata fiyatlarını/onarım sürelerini güncelleme ve Hakkımızda/sosyal medya/iletişim bilgilerini yönetme imkanı sunar.
*   **Dinamik İçerik Yönetimi:** Ana sayfadaki tüm metinler, adres, telefon ve sosyal medya linkleri admin panelinden güncellenen konfigürasyondan dinamik olarak beslenir.
*   **Güvenli JWT & Çerez Yönetimi:** `localStorage` yerine tarayıcı tabanlı `httpOnly` secure çerezler üzerinden Access + Refresh Token rotasyonu (Edge Runtime uyumlu `jose` ile).
*   **Responsive Tasarım:** Mobil, tablet ve masaüstü cihazlar için tamamen optimize edilmiş premium arayüz.
*   **Gelişmiş Görsel Varlık Yönetimi:** `/public/assets` klasör yapısı altında optimize edilmiş logo ve site görselleri organizasyonu.
*   **Esnek API Köprüsü:** Apple model listesini doğrudan MySQL veritabanından dinamik olarak sunan (`GET /api/devices`) ve fiyat hesaplama katsayılarını/WhatsApp şablonlarını JSON olarak sağlayan (`GET /api/price-rules`) modüler API altyapısı.

## 🛠️ Teknoloji Yığını

*   **Framework:** Next.js 14 (App Router) + React
*   **Dil:** TypeScript
*   **Styling:** Tailwind CSS + shadcn/ui (Slate Theme)
*   **Kimlik Doğrulama / Güvenlik:** JWT (`jose` Edge-uyumlu), `bcryptjs` şifre hash'leme, `zod` girdi doğrulama.
*   **Containerization:** Docker & Docker Compose
*   **Veri Yönetimi:** MySQL 8 + JSON Config (`config/whatsapp.json` üzerinde dinamik fiyatlandırma, katsayılar ve site ayarları saklanır).

## 🚀 Hızlı Başlangıç

Projeyi yerel geliştirme ortamınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

### 1. Çevre Değişkenlerini Ayarlayın
Örnek şablon dosyasını kopyalayarak yerel ayar dosyanızı oluşturun:
```bash
cp .env.example .env.local
```
*(Gerekirse `.env.local` dosyasını açıp veritabanı şifrelerinizi ve en az 32 karakterli `JWT_SECRET` değerini girin).*

### 2. Bağımlılıkları Kurun & Projeyi Ayağa Kaldırın
Docker konteyneri üzerinden bağımlılıkları kurup projeyi ayağa kaldırın:
```bash
docker compose up -d --build
```

### 3. Varsayılan Admin Kullanıcıyı Tohumlayın
Docker konteyneri içinde tohumlama scriptini çalıştırarak varsayılan admin kullanıcısını oluşturun:
```bash
docker compose exec nextjs node scripts/seed-admin.mjs
```
*(Varsayılan kimlik bilgileri: Kullanıcı adı: `admin` | Şifre: `Phonelab2026`)*

### 4. Tarayıcıda Açın
Geliştirme sunucusu hazır olduğunda tarayıcınızdan aşağıdaki adreslere gidebilirsiniz:
*   **Kullanıcı Arayüzü:** `http://localhost:3002`
*   **Yönetici Girişi:** `http://localhost:3002/admin/login`

---

## 📂 Dosya ve Klasör Yapısı

```
phonelab/
├── public/
│   └── assets/
│       ├── images/       # Site görselleri ve illüstrasyonlar
│       └── logo/         # Marka logoları ve ikonlar
├── config/
│   └── whatsapp.json     # WhatsApp, fiyat katsayıları ve site ayarları konfigürasyonu
├── lib/
│   ├── db.ts             # MySQL pool bağlantı havuzu helper'ı
│   ├── auth.ts           # JWT oluşturma, çerez ve doğrulama yardımcıları (jose)
│   ├── config.ts         # Atomik config okuma/yazma yardımcıları (fs)
│   ├── adminApi.ts       # Admin panel client-side fetch istemcisi (Refresh/Retry destekli)
│   └── validations/
│       └── admin.ts      # Zod ile admin istek doğrulama şemaları
├── app/
│   ├── api/
│   │   ├── devices/      # MySQL'den model çeken API rotası (GET)
│   │   ├── price-rules/  # Fiyat kurallarını veren API rotası (GET)
│   │   └── admin/        # Admin yetki, cihaz, fiyat ve ayar güncelleme API'leri (POST/PUT/GET)
│   ├── admin/
│   │   ├── login/        # Admin Giriş Sayfası (UI)
│   │   ├── dashboard/    # Admin Yönetici Paneli Sekme Kabuğu (UI)
│   │   └── admin.css     # Admin Paneline özel stil şablonu
│   ├── layout.tsx        # Ana Next.js şablonu (Navbar + Footer)
│   └── page.tsx          # Dinamik içerik destekli ana sayfa ve tahmin sihirbazı
├── components/
│   └── admin/            # DevicesTab, PriceRulesTab, SettingsTab panel sekme bileşenleri
├── database/
│   └── init.sql          # 54 Apple modelini içeren MySQL şema & tohum dosyası
├── scripts/
│   └── seed-admin.mjs    # Docker üzerinde çalışan admin tohumlama scripti
├── middleware.ts         # Edge runtime uyumlu JWT API koruma middleware'i
├── docker-compose.yml    # Geliştirme ortamı Docker konfigürasyonu (Port 3002)
├── next.config.js        # Next.js 14 konfigürasyon dosyası
└── README.md             # Proje genel dokümantasyonu
```
