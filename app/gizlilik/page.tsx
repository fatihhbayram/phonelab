import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Gizlilik Politikası · PhoneLab',
  description: 'PhoneLab gizlilik politikası ve kişisel verilerin korunmasına ilişkin aydınlatma.',
};

export default function GizlilikPage() {
  return (
    <LegalLayout title="Gizlilik Politikası" updated="10 Haziran 2026">
      <p>
        PhoneLab olarak gizliliğinize önem veriyoruz. Bu metin, web sitemizi kullanırken
        verilerinizin nasıl işlendiğini açıklar.
      </p>

      <h2>1. Topladığımız Veriler</h2>
      <p>
        Web sitemiz üzerinden <strong>kişisel veri toplamıyoruz</strong>. Cihaz alım (satış)
        sihirbazında yaptığınız model ve durum seçimleri yalnızca tarayıcınızda tutulur; bu
        seçimler bir WhatsApp mesajı taslağına dönüştürülür. Mesajı göndermeyi siz seçtiğinizde
        iletişim, WhatsApp üzerinden ve sizin inisiyatifinizle başlar.
      </p>

      <h2>2. WhatsApp Üzerinden İletişim</h2>
      <p>
        Bizimle WhatsApp üzerinden iletişime geçtiğinizde paylaştığınız bilgiler (ad, telefon
        numarası, cihaz bilgileri) WhatsApp’ın kendi gizlilik politikasına tabidir. Bu bilgileri
        yalnızca talebinizi yanıtlamak ve hizmet sunmak için kullanırız.
      </p>

      <h2>3. Çerezler</h2>
      <p>
        Sitemiz yalnızca tema tercihiniz gibi temel işlevsel bilgileri tarayıcınızın yerel
        depolamasında (localStorage) saklar. Pazarlama veya takip amaçlı çerez kullanmıyoruz.
      </p>

      <h2>4. Haklarınız (KVKK)</h2>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; verilerinizin işlenip
        işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme haklarına sahipsiniz.
        Talepleriniz için bizimle iletişime geçebilirsiniz.
      </p>

      <h2>5. İletişim</h2>
      <p>
        Sorularınız için: PhoneLab, Maltepe / İstanbul — WhatsApp üzerinden bize ulaşabilirsiniz.
      </p>
    </LegalLayout>
  );
}
