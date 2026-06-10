import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Kullanım Koşulları · PhoneLab',
  description: 'PhoneLab web sitesi kullanım koşulları.',
};

export default function KullanimKosullariPage() {
  return (
    <LegalLayout title="Kullanım Koşulları" updated="10 Haziran 2026">
      <p>
        Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Lütfen
        hizmetlerimizden yararlanmadan önce okuyunuz.
      </p>

      <h2>1. Hizmetin Kapsamı</h2>
      <p>
        PhoneLab; Apple cihazları için onarım ve cihaz alım (satış) hizmetleri sunar. Sitede yer
        alan onarım fiyatları ve cihaz alım bilgileri <strong>bilgilendirme amaçlıdır</strong> ve
        bağlayıcı teklif niteliği taşımaz.
      </p>

      <h2>2. Fiyatlar ve Teklifler</h2>
      <p>
        Cihaz alım sürecinde verdiğiniz seçimler bir ön bilgi oluşturur; kesin alım teklifi,
        cihazınız fiziksel olarak incelendikten sonra WhatsApp üzerinden netleştirilir. Onarım
        fiyatları cihaz durumuna ve parça temin koşullarına göre değişebilir.
      </p>

      <h2>3. Sorumluluk</h2>
      <p>
        Sitedeki bilgilerin güncel ve doğru olması için çaba gösteririz; ancak içerikteki olası
        hatalardan veya eksikliklerden doğacak zararlardan PhoneLab sorumlu tutulamaz.
      </p>

      <h2>4. Fikri Mülkiyet</h2>
      <p>
        Sitede yer alan logo, metin ve görseller PhoneLab’a aittir; izinsiz kullanılamaz. Apple ve
        ilgili ürün adları kendi sahiplerinin tescilli markalarıdır.
      </p>

      <h2>5. Değişiklikler</h2>
      <p>
        PhoneLab bu koşulları önceden bildirmeksizin güncelleyebilir. Güncel sürüm her zaman bu
        sayfada yayımlanır.
      </p>

      <h2>6. İletişim</h2>
      <p>
        Sorularınız için: PhoneLab, Maltepe / İstanbul — WhatsApp üzerinden bize ulaşabilirsiniz.
      </p>
    </LegalLayout>
  );
}
