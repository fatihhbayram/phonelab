# PhoneLab — Profesyonel Telefon Teknik Servis Platformu

PhoneLab, Apple cihazları için optimize edilmiş, modern ve dinamik bir telefon tamir dükkanı web sitesidir. Kullanıcılara premium bir servis deneyimi sunmak amacıyla temiz ve güven veren bir tasarıma sahiptir.

## 🌟 Temel Özellikler

*   **Apple Fiyat Tahmin Motoru (Sihirbaz):** Müşterilerin Apple cihazlarını (iPhone, iPad, Watch), karşılaştıkları arıza türünü ve cihaz durumunu adım adım seçebilecekleri interaktif bir sihirbaz.
*   **WhatsApp Entegrasyonlu Teklif Sistemi:** Müşteri tahmin motorunun sonunda, yaptığı seçimlerin (cihaz modeli, seçilen arıza ve tahmini fiyat aralığı) otomatik olarak doldurulduğu pre-filled mesajla tek tıkla doğrudan WhatsApp hattına yönlendirilir.
*   **Responsive Tasarım:** Mobil, tablet ve masaüstü cihazlar için tamamen optimize edilmiş premium arayüz.
*   **Gelişmiş Görsel Varlık Yönetimi:** `/public/assets` klasör yapısı altında optimize edilmiş logo ve site görselleri organizasyonu.
*   **Esnek API Köprüsü:** Apple model listesini doğrudan MySQL veritabanından dinamik olarak sunan (`GET /api/devices`) ve fiyat hesaplama katsayılarını/WhatsApp şablonlarını JSON olarak sağlayan (`GET /api/price-rules`) modüler API altyapısı.

## 🛠️ Teknoloji Yığını

*   **Framework:** Next.js 14 (App Router) + React
*   **Dil:** TypeScript
*   **Styling:** Tailwind CSS + shadcn/ui (Slate Theme)
*   **Containerization:** Docker & Docker Compose
*   **Veri Yönetimi:** MySQL 8 (Kısmi Entegrasyon - Cihaz modelleri veritabanından dinamik listelenir, fiyatlama kuralları ve WhatsApp şablonları ise JSON yapılandırmasından okunur).

## 🚀 Hızlı Başlangıç

Projeyi yerel geliştirme ortamınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

### 1. Çevre Değişkenlerini Ayarlayın
Örnek şablon dosyasını kopyalayarak yerel ayar dosyanızı oluşturun:
```bash
cp .env.example .env.local
```
*(Gerekirse `.env.local` dosyasını açıp veritabanı şifrelerinizi girin).*

### 2. Bağımlılıkları Kurun & Next.js Projesini Başlatın
Docker konteyneri üzerinden Next.js bağımlılıklarını kurup projeyi ayağa kaldırın:
```bash
docker compose up -d --build
```

### 3. Tarayıcıda Açın
Geliştirme sunucusu hazır olduğunda tarayıcınızdan aşağıdaki adrese gidin:
*   `http://localhost:3002`

---

## 📂 Dosya ve Klasör Yapısı

```
phonelab/
├── public/
│   └── assets/
│       ├── images/       # Site görselleri ve illüstrasyonlar
│       └── logo/         # Marka logoları ve ikonlar
├── config/
│   └── whatsapp.json     # WhatsApp ve fiyat katsayıları konfigürasyonu
├── lib/
│   └── db.ts             # MySQL connection pool bağlantı havuzu helper'ı
├── app/
│   ├── api/
│   │   ├── devices/      # MySQL'den model çeken API rotası (GET)
│   │   └── price-rules/  # Fiyat kurallarını veren API rotası (GET)
│   ├── layout.tsx        # Ana Next.js şablonu (Navbar + Footer)
│   └── page.tsx          # Ana sayfa (Sihirbaz sihirli arayüzü)
├── database/
│   └── init.sql          # 54 Apple modelini içeren MySQL şema & tohum dosyası
├── docker-compose.yml    # Geliştirme ortamı Docker konfigürasyonu (Port 3002)
├── next.config.js        # Next.js 14 konfigürasyon dosyası
└── README.md             # Proje genel dokümantasyonu
```

