# PhoneLab — Profesyonel Telefon Teknik Servis Platformu

PhoneLab, Apple cihazları için optimize edilmiş, modern ve dinamik bir telefon tamir dükkanı web sitesidir. Kullanıcılara premium bir servis deneyimi sunmak amacıyla iFixit ve Apple Support tarzından ilham alan temiz ve güven veren bir tasarıma sahiptir.

## 🌟 Temel Özellikler

*   **Apple Fiyat Tahmin Motoru (Sihirbaz):** Müşterilerin Apple cihazlarını (iPhone, iPad, Watch), karşılaştıkları arıza türünü ve cihaz durumunu adım adım seçebilecekleri interaktif bir sihirbaz.
*   **WhatsApp Entegrasyonlu Teklif Sistemi:** Müşteri tahmin motorunun sonunda, yaptığı seçimlerin (cihaz modeli, seçilen arıza ve tahmini fiyat aralığı) otomatik olarak doldurulduğu pre-filled mesajla tek tıkla doğrudan WhatsApp hattına yönlendirilir.
*   **Responsive Tasarım:** Mobil, tablet ve masaüstü cihazlar için tamamen optimize edilmiş premium arayüz.
*   **Gelişmiş Görsel Varlık Yönetimi:** `/public/assets` klasör yapısı altında optimize edilmiş logo ve site görselleri organizasyonu.
*   **Esnek API Köprüsü:** İleride kolayca veritabanı (MySQL) entegrasyonuna geçebilmek amacıyla, cihazları ve fiyat hesaplama katsayılarını dinamik olarak sağlayan istemci dostu statik API altyapısı (`GET /api/price-rules`).

## 🛠️ Teknoloji Yığını

*   **Framework:** Next.js 14 (App Router) + React
*   **Dil:** TypeScript
*   **Styling:** Tailwind CSS + shadcn/ui (Slate Theme)
*   **Containerization:** Docker & Docker Compose
*   **Veri Yönetimi (Gelecek):** MySQL 8 (Hazır şema ve docker konteyneri mevcuttur, ilerleyen fazlarda devreye alınacaktır).

## 🚀 Hızlı Başlangıç

Projeyi yerel geliştirme ortamınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

### 1. Çevre Değişkenlerini Ayarlayın
Örnek şablon dosyasını kopyalayarak yerel ayar dosyanızı oluşturun:
```bash
cp .env.example .env.local
```
*(Gerekirse `.env.local` dosyasını açıp yapılandırma şifrelerinizi girin).*

### 2. Bağımlılıkları Kurun & Next.js Projesini Başlatın
Docker konteyneri üzerinden Next.js bağımlılıklarını kurup projeyi ayağa kaldırın:
```bash
docker compose up -d --build
```

### 3. Tarayıcıda Açın
Geliştirme sunucusu hazır olduğunda tarayıcınızdan aşağıdaki adrese gidin:
*   `http://localhost:3000`

---

## 📂 Dosya ve Klasör Yapısı

```
phonelab/
├── public/
│   └── assets/
│       ├── images/       # Site görselleri ve illüstrasyonlar
│       └── logo/         # Marka logoları ve ikonlar
├── config/
│   └── whatsapp.json     # WhatsApp telefon ve şablon konfigürasyonu
├── app/
│   ├── api/
│   │   └── price-rules/  # Fiyat hesaplama kuralları API'si
│   └── layout.tsx        # Ana Next.js şablonu
├── docker-compose.yml    # Geliştirme ortamı Docker konfigürasyonu
└── README.md             # Proje genel dokümantasyonu
```
