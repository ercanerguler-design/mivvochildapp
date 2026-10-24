import { SITE } from "@/lib/site";

/**
 * Mivvo legal documents (Turkish). Facts here must match the code:
 * processors, data categories and retention periods (see src/app/api/cron/retention).
 * Bump `version` + `updated` whenever a document changes; consents record the version.
 */

export type LegalBlock = { p: string } | { ul: string[] } | { table: { head: string[]; rows: string[][] } };
export type LegalSection = { h: string; blocks: LegalBlock[] };
export type LegalDoc = { slug: string; title: string; short: string; description: string; version: string; updated: string; sections: LegalSection[] };

const C = SITE.legal;
const company = C.name;
const contactLine = `${company}, ${SITE.address.street}, ${SITE.address.city} · E-posta: ${SITE.email} · Telefon/WhatsApp: ${SITE.phoneDisplay}`;
const price = SITE.monthlyPriceTl;
const trial = SITE.trialDays;
const paymentMethods = SITE.cardPaymentsEnabled
  ? "Ödeme, iyzico güvencesiyle kredi/banka kartıyla tek seferde veya havale/EFT ile alınır."
  : "Ödeme havale/EFT ile alınır. Kartla ödeme seçeneği devreye alındığında bu formda ayrıca belirtilecektir.";

const PROCESSORS = {
  head: ["Alıcı", "Amaç", "Konum"],
  rows: [
    ["Vercel Inc.", "Web sitesi ve sunucu altyapısı (barındırma)", "ABD / küresel"],
    ["Neon Inc.", "Veritabanı hizmeti", "ABD / AB veri merkezleri"],
    ["OpenAI, L.L.C.", "Mesaj parçalarının yapay zekâ ile risk analizi", "ABD"],
    ["650 Industries, Inc. (Expo)", "Ebeveyn uygulamasına anlık bildirim iletimi", "ABD"],
    ["Google LLC", "\"Google ile giriş\" kimlik doğrulaması ve Google Play dağıtımı", "ABD"],
    ["iyzi Ödeme ve Elektronik Para Hizmetleri A.Ş. (iyzico)", "Kartlı ödemelerin alınması (kart bilgileri Mivvo'ya iletilmez)", "Türkiye"],
    ["Meta Platforms, Inc. (WhatsApp)", "Yalnızca etkinleştirilmesi halinde, kritik uyarıların WhatsApp ile iletilmesi", "ABD / AB"],
  ],
};

const RETENTION = {
  head: ["Veri", "Saklama süresi"],
  rows: [
    ["Risk uyarıları (riskli mesaj parçası, kategori, açıklama)", "Oluşturulmasından itibaren 12 ay; ardından otomatik silinir"],
    ["Güvenli mesajlar", "Saklanmaz; analizden hemen sonra yalnızca \"güvenli\" sonucu tutulur"],
    ["Aktivite kayıtları (uygulama, saat, risk puanı; mesaj metni olmadan)", "90 gün; ardından otomatik silinir"],
    ["Kişi özet kayıtları (gönderen görünen adı, mesaj sayısı)", "Son görülmeden itibaren 90 gün"],
    ["Acil yardım çağrıları (o anki konum dahil)", "30 gün; ardından otomatik silinir"],
    ["Ebeveyn hesabı ve çocuk profilleri", "Hesap silinene kadar; silme talebinden sonra en geç 30 gün içinde"],
    ["Onay (rıza) kayıtları", "Hesabın silinmesinden sonra ispat amacıyla 3 yıl"],
    ["Ödeme ve fatura kayıtları", "Vergi ve ticaret mevzuatı gereği 10 yıl"],
  ],
};

export const legalDocs: LegalDoc[] = [
  // ───────────────────────────────── KVKK AYDINLATMA ─────────────────────────────────
  {
    slug: "kvkk",
    title: "KVKK Aydınlatma Metni",
    short: "KVKK Aydınlatma",
    description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Mivvo kullanıcılarına yönelik aydınlatma metni.",
    version: "2.1",
    updated: "2026-10-24",
    sections: [
      {
        h: "1. Veri sorumlusu",
        blocks: [
          { p: `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla ${company} ("Mivvo", "biz") tarafından aşağıda açıklanan kapsamda işlenmektedir.` },
          { p: `İletişim: ${contactLine}${C.mersis ? ` · MERSİS: ${C.mersis}` : ""}` },
        ],
      },
      {
        h: "2. Hangi kişisel verileri işliyoruz?",
        blocks: [
          { p: "Ebeveyn (hesap sahibi) için:" },
          { ul: ["Kimlik ve iletişim: ad soyad, e-posta adresi, cep telefonu (ödeme sırasında verilirse)", "Hesap güvenliği: şifrenin geri döndürülemez özeti (hash), oturum ve cihaz bildirim anahtarı", "Fatura ve ödeme: fatura adresi, şehir, ödeme tutarı ve iyzico işlem numarası (kart bilgileri bize ulaşmaz)", "Kullanım: uyarı tercihleri, hassasiyet seviyesi, onay kayıtları, IP adresi ve işlem zamanları"] },
          { p: "Çocuk (18 yaş altı, ebeveyn tarafından eklenen) için:" },
          { ul: ["Kimlik: ad (veya takma ad) ve doğum tarihi (yalnızca 18 yaş kontrolü için)", "Cihaz: uygulamaya özel rastgele cihaz kimliği, uygulama sürümü, uygulamanın en son ne zaman bağlandığı ve korumanın (bildirim erişiminin) açık olup olmadığı", "İletişim içeriği: WhatsApp, Instagram, TikTok, Snapchat, Telegram ve SMS uygulamalarından gelen bildirimlerdeki gönderen görünen adı ve mesaj metni", "Risk sonuçları: risk kategorisi, puanı, açıklama ve yalnızca risk tespit edilen mesajın ilgili parçası", "Acil durum konumu: yalnızca çocuk uygulamadaki Yardım butonuna bastığında, o anki konum bir kez alınır ve ebeveyne iletilir"] },
          { p: "Mivvo; fotoğraf, video, sesli mesaj, rehber, arama kayıtları, kamera veya mikrofon verilerine erişmez ve bunları işlemez. Konum sürekli veya arka planda izlenmez; yalnızca çocuk Yardım butonuna bastığı anda alınır. Mesaj içerikleri, niteliği gereği sağlık veya cinsel hayata ilişkin bilgiler içerebilir; bu tür veriler yalnızca risk tespiti amacıyla ve aşağıdaki güvencelerle işlenir." },
        ],
      },
      {
        h: "3. Hangi amaçlarla işliyoruz?",
        blocks: [
          { ul: ["Çocuğa yönelik siber zorbalık, tehdit, cinsel istismar, şiddet ve kendine zarar verme risklerinin tespit edilmesi ve ebeveynin uyarılması", "Ebeveyne konuşma önerileri ve dönemsel raporlar sunulması", "Çocuk acil yardım istediğinde ebeveynin çocuğun o anki konumuna ulaşabilmesi", "Üyelik, kimlik doğrulama, eşleştirme ve hizmetin sürekliliğinin sağlanması", "Abonelik, ödeme ve faturalandırma işlemlerinin yürütülmesi", "Bilgi güvenliği, kötüye kullanımın önlenmesi ve hataların giderilmesi", "Yasal yükümlülüklerin yerine getirilmesi ve yetkili kurumlara bilgi verilmesi"] },
          { p: "Kişisel veriler reklam, profilleme amaçlı pazarlama veya üçüncü kişilere satış amacıyla kullanılmaz. Yapay zekâ analizi yalnızca ebeveyne uyarı üretmek için yapılır; çocuk hakkında otomatik olarak hukuki sonuç doğuran bir karar alınmaz ve her uyarı ebeveyn tarafından değerlendirilir." },
        ],
      },
      {
        h: "4. Hukuki sebepler",
        blocks: [
          { ul: ["Sözleşmenin kurulması ve ifası (KVKK m.5/2-c): üyelik, abonelik ve hizmetin sunulması", "Hukuki yükümlülük (KVKK m.5/2-ç): fatura, vergi ve resmi taleplere yanıt", "Bir hakkın tesisi, kullanılması veya korunması (KVKK m.5/2-e): uyuşmazlıklarda ispat", "Meşru menfaat (KVKK m.5/2-f): bilgi güvenliği ve hizmetin iyileştirilmesi", "Açık rıza (KVKK m.5/1 ve m.6): çocuğun mesaj içeriklerinin risk analizi amacıyla işlenmesi ve bu kapsamda ortaya çıkabilecek özel nitelikli veriler ile arızi nitelikteki yurt dışı aktarımlar"] },
          { p: "18 yaş altındaki çocuğa ilişkin açık rıza, velayet hakkına sahip ebeveyn tarafından verilir. Çocuğun telefonunda ayrıca, işlenen veriler çocuğa anlaşılır bir dille gösterilir ve çocuktan da onay alınır." },
        ],
      },
      {
        h: "5. Kimlere ve hangi amaçla aktarıyoruz?",
        blocks: [
          { p: "Kişisel verileriniz, yalnızca hizmetin sunulması için zorunlu olduğu ölçüde ve bizim talimatlarımızla hareket eden aşağıdaki hizmet sağlayıcılara (veri işleyen) aktarılır:" },
          { table: PROCESSORS },
          { p: "Bu sağlayıcıların bir kısmı yurt dışında bulunduğundan aktarım, KVKK m.9 kapsamında standart sözleşme gibi uygun güvenceler sağlanarak, bunun mümkün olmadığı hallerde ise açık rızanıza dayanılarak yapılır. Yapay zekâ analizine yalnızca mesaj metni gönderilir; ebeveynin veya çocuğun adı, e-postası, telefonu gönderilmez. OpenAI, API üzerinden iletilen verileri kendi taahhüdü uyarınca model eğitiminde kullanmaz." },
          { p: "Ayrıca kanunen yetkili kamu kurum ve kuruluşlarına (ör. mahkemeler, kolluk), yalnızca yasal bir talep olması halinde ve talep kapsamıyla sınırlı olarak aktarım yapılabilir." },
        ],
      },
      {
        h: "6. Toplama yöntemi",
        blocks: [{ p: "Veriler; web sitesi ve Mivvo Ebeveyn uygulamasındaki formlar, çocuğun cihazına ebeveyn ve çocuğun onayıyla kurulan Mivvo Çocuk uygulamasının bildirim erişimi ve ödeme sağlayıcısından dönen işlem sonuçları aracılığıyla, kısmen otomatik yollarla elektronik ortamda toplanır." }],
      },
      {
        h: "7. Saklama süreleri",
        blocks: [{ table: RETENTION }, { p: "Süresi dolan veriler periyodik olarak otomatik silinir veya anonim hale getirilir." }],
      },
      {
        h: "8. KVKK m.11 kapsamındaki haklarınız",
        blocks: [
          { ul: ["Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme", "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme", "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme", "Eksik veya yanlış işlenmişse düzeltilmesini isteme", "KVKK m.7 çerçevesinde silinmesini veya yok edilmesini isteme", "Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme", "Münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme", "Kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme"] },
        ],
      },
      {
        h: "9. Başvuru",
        blocks: [
          { p: `Haklarınıza ilişkin taleplerinizi ${SITE.email} adresine kayıtlı e-posta adresinizden veya ${SITE.address.street}, ${SITE.address.city} adresine yazılı olarak iletebilirsiniz. Hesabınızı ve tüm verilerinizi ebeveyn panelindeki Ayarlar > "Hesabımı sil" bölümünden anında da silebilirsiniz.` },
          { p: "Başvurular, talebin niteliğine göre en geç 30 gün içinde ücretsiz olarak sonuçlandırılır. Başvurunuzun reddedilmesi veya yanıtı yetersiz bulmanız halinde Kişisel Verileri Koruma Kurulu'na şikâyette bulunabilirsiniz." },
        ],
      },
    ],
  },

  // ───────────────────────────────── GİZLİLİK ─────────────────────────────────
  {
    slug: "gizlilik",
    title: "Gizlilik Politikası",
    short: "Gizlilik",
    description: "Mivvo'nun hangi verileri neden işlediği, nasıl koruduğu ve ne kadar sakladığı hakkında sade dilde gizlilik politikası.",
    version: "2.1",
    updated: "2026-10-24",
    sections: [
      {
        h: "Kısaca",
        blocks: [
          { ul: ["Mivvo bir gizli takip uygulaması değildir. Çocuk uygulaması görünür çalışır ve çocuk korunduğunu bilir.", "Yalnızca mesajlaşma uygulamalarından gelen bildirim metinleri risk açısından analiz edilir.", "Güvenli mesajlar saklanmaz. Yalnızca risk tespit edilen mesajın ilgili parçası ebeveyne gösterilir.", "Fotoğraf, video, ses, rehber, kamera ve mikrofona erişilmez. Konum sürekli izlenmez; yalnızca çocuk Yardım butonuna bastığında bir kez alınır.", "Verileriniz satılmaz, reklam için kullanılmaz.", "Hesabınızı ve tüm verilerinizi istediğiniz an silebilirsiniz."] },
        ],
      },
      {
        h: "Mivvo nasıl çalışır?",
        blocks: [
          { p: "Ebeveyn, çocuğunun Android telefonuna Mivvo Çocuk uygulamasını çocuğuyla birlikte kurar ve eşleştirme koduyla kendi hesabına bağlar. Uygulama, Android'in bildirim erişimi izniyle yalnızca izin verilen mesajlaşma uygulamalarından (WhatsApp, Instagram, TikTok, Snapchat, Telegram, SMS) gelen bildirimlerin metnini okur. Banka, e-posta ve diğer tüm uygulamaların bildirimleri cihaz üzerinde yok sayılır." },
          { p: "Okunan metin şifreli bağlantıyla sunucularımıza iletilir ve yapay zekâ ile analiz edilir. Analiz sonucunda risk yoksa mesaj metni saklanmaz. Risk varsa, yalnızca riskli kısım, kategori ve kısa bir açıklama ebeveyne uyarı olarak gösterilir. Yapay zekâ hizmetine geçici olarak ulaşılamadığında, yalnızca açık ve kritik ifadeleri tanıyan kural tabanlı bir yedek sistem devreye girer." },
        ],
      },
      {
        h: "Yapay zekâ ve doğruluk",
        blocks: [
          { p: "Yapay zekâ analizi; argo, şaka ve bağlamı ayırt edecek şekilde ayarlanmıştır ve yanlış alarmları en aza indirmek için belirli bir güven ve risk eşiğinin altındaki sonuçlar ebeveyne iletilmez. Bununla birlikte hiçbir otomatik sistem kusursuz değildir: Mivvo bazı riskleri kaçırabilir veya zararsız bir mesajı riskli olarak işaretleyebilir. Uyarılar bir değerlendirme önerisidir; kesin bir yargı değildir. Mivvo bir acil durum hizmeti değildir; acil durumlarda 112'yi arayın." },
        ],
      },
      { h: "Hizmet sağlayıcılarımız", blocks: [{ table: PROCESSORS }] },
      { h: "Saklama süreleri", blocks: [{ table: RETENTION }] },
      {
        h: "Güvenlik",
        blocks: [
          { ul: ["Tüm bağlantılar TLS (HTTPS) ile şifrelenir.", "Şifreler geri döndürülemez biçimde (bcrypt) saklanır.", "Her çocuk cihazı, eşleşme sırasında kendisine özel imzalı bir erişim anahtarı alır; uygulamaya gömülü ortak bir anahtar kullanılmaz.", "Veritabanına erişim yetkili personelle sınırlıdır; kart bilgileri hiçbir zaman sistemlerimizden geçmez.", "Kişisel veri ihlali halinde KVKK'nın öngördüğü sürelerde Kurul'a ve ilgililere bildirim yapılır."] },
          { p: "Ayrıntılar için Güvenlik sayfamıza bakabilirsiniz." },
        ],
      },
      {
        h: "Çocukların gizliliği",
        blocks: [
          { p: "Mivvo yalnızca 18 yaş altındaki çocuklar için kullanılabilir; doğum tarihi 18 yaşı gösteren profiller için veri işlenmez. Mivvo, bir yetişkinin (eş, çalışan vb.) izlenmesi için kullanılamaz. Ebeveynlerin, Mivvo'yu kurmadan önce çocuklarıyla konuşmalarını ve uygulamayı birlikte kurmalarını öneriyoruz." },
        ],
      },
      { h: "Çerezler", blocks: [{ p: "Sitemizde yalnızca oturum ve dil tercihi için zorunlu çerezler kullanılır; reklam veya üçüncü taraf takip çerezi kullanılmaz. Ayrıntılar Çerez Politikası'ndadır." }] },
      {
        h: "Haklarınız ve iletişim",
        blocks: [{ p: `KVKK m.11 kapsamındaki haklarınız ve başvuru yöntemi KVKK Aydınlatma Metni'nde açıklanmıştır. Sorularınız için: ${SITE.email}. Bu politika değiştiğinde güncelleme tarihi yenilenir; önemli değişiklikler e-posta veya uygulama içi bildirimle duyurulur.` }],
      },
    ],
  },

  // ───────────────────────────────── AÇIK RIZA ─────────────────────────────────
  {
    slug: "acik-riza",
    title: "Açık Rıza Metni",
    short: "Açık Rıza",
    description: "Mivvo hizmeti kapsamında çocuğa ait mesaj içeriklerinin işlenmesi ve yurt dışına aktarılmasına ilişkin açık rıza metni.",
    version: "1.1",
    updated: "2026-10-24",
    sections: [
      {
        h: "Rıza beyanı",
        blocks: [
          { p: `KVKK Aydınlatma Metni'ni okuduğumu ve anladığımı; 18 yaşından küçük çocuğumun velayet hakkına sahip ebeveyni (veya yasal temsilcisi) olduğumu beyan ederek, ${company} tarafından aşağıdaki işlemlerin yapılmasına özgür irademle açık rıza veriyorum:` },
          { ul: ["Çocuğumun telefonuna kurulacak Mivvo Çocuk uygulamasının, desteklenen mesajlaşma uygulamalarından gelen bildirimlerdeki gönderen adı ve mesaj metinlerini okuması ve risk analizi amacıyla Mivvo sunucularına iletmesi,", "Bu mesaj metinlerinin yapay zekâ ile analiz edilmesi ve analiz sırasında ortaya çıkabilecek sağlık, cinsel hayat gibi özel nitelikli kişisel verilerin yalnızca risk tespiti amacıyla işlenmesi,", "Analiz için mesaj metinlerinin ve hizmetin sunulması için gerekli diğer verilerin, Aydınlatma Metni'nde belirtilen ve yurt dışında bulunan hizmet sağlayıcılara (OpenAI, Vercel, Neon, Expo, Google) aktarılması,", "Risk tespit edilen mesaj parçalarının, uyarı olarak tarafıma gösterilmek üzere 12 ay süreyle saklanması,", "Çocuğumun Yardım butonuna bastığı anda telefonunun konumunun alınıp tarafıma iletilmesi ve 30 gün saklanması."] },
        ],
      },
      {
        h: "Rızanın geri alınması",
        blocks: [
          { p: `Bu rızayı dilediğim zaman, hiçbir gerekçe göstermeden geri alabileceğimi biliyorum. Rızamı; çocuk uygulamasında eşleştirmeyi kaldırarak, çocuk profilini silerek, hesabımı silerek veya ${SITE.email} adresine yazarak geri alabilirim. Rızanın geri alınması, geri alma tarihine kadar yapılan işlemlerin hukuka uygunluğunu etkilemez; ancak mesaj analizi hizmeti bu durumda sunulamaz.` },
        ],
      },
      {
        h: "Çocuğun bilgilendirilmesi",
        blocks: [{ p: "Çocuğumun, Mivvo Çocuk uygulamasının ilk açılışında hangi verilerin işlendiğine dair kendisine yönelik açıklamayı okuyacağını ve onay vereceğini; uygulamanın çalıştığı süre boyunca telefonunda \"Mivvo koruması açık\" bildiriminin görüneceğini biliyorum. Mivvo'yu çocuğumdan gizlemeyeceğimi ve bir yetişkini izlemek için kullanmayacağımı taahhüt ederim." }],
      },
    ],
  },

  // ───────────────────────────────── KULLANIM KOŞULLARI ─────────────────────────────────
  {
    slug: "kullanim-kosullari",
    title: "Kullanım Koşulları ve Üyelik Sözleşmesi",
    short: "Kullanım Koşulları",
    description: "Mivvo web sitesi, Mivvo Ebeveyn ve Mivvo Çocuk uygulamalarının kullanım koşulları.",
    version: "1.1",
    updated: "2026-10-24",
    sections: [
      { h: "1. Taraflar ve kapsam", blocks: [{ p: `Bu sözleşme, ${company} ("Mivvo") ile Mivvo web sitesi (mivvo.org), Mivvo Ebeveyn ve Mivvo Çocuk uygulamalarını ("Hizmet") kullanmak üzere üye olan kişi ("Kullanıcı") arasındadır. Üye olarak bu koşulları, Gizlilik Politikası'nı ve KVKK Aydınlatma Metni'ni kabul etmiş sayılırsınız.` }] },
      { h: "2. Hizmetin tanımı", blocks: [{ p: "Mivvo; ebeveynlerin, 18 yaş altındaki çocuklarının telefonuna gelen mesaj bildirimlerinde siber zorbalık, tehdit, cinsel istismar, şiddet, kendine zarar verme ve yabancı kişi risklerini yapay zekâ yardımıyla fark etmelerine yardımcı olan bir ebeveyn kontrol hizmetidir." }] },
      {
        h: "3. Üyelik ve hesap güvenliği",
        blocks: [{ ul: ["Üye olmak için 18 yaşını doldurmuş ve fiil ehliyetine sahip olmanız gerekir.", "Kayıt bilgilerinizin doğru ve güncel olmasından siz sorumlusunuz.", "Şifrenizin gizliliğini korumak sizin sorumluluğunuzdadır; hesabınızda yetkisiz bir kullanım fark ederseniz derhal bize bildirin."] }],
      },
      {
        h: "4. Kullanıcının yükümlülükleri",
        blocks: [
          { ul: ["Mivvo'yu yalnızca velayet hakkına sahip olduğunuz veya yasal temsilcisi olduğunuz 18 yaş altındaki çocuğunuz için kullanabilirsiniz.", "Mivvo Çocuk uygulamasını çocuğunuzdan gizlemeyecek, uygulamanın görünür çalışmasını engellemeyecek ve çocuğunuzu bilgilendireceksiniz.", "Mivvo'yu eş, partner, çalışan veya herhangi bir yetişkini izlemek için kullanamazsınız. Bu yasak, kişinin rızası olsa dahi geçerlidir.", "Hizmeti hukuka aykırı amaçlarla, başkalarının haklarını ihlal edecek şekilde veya sistemlerimize zarar verecek biçimde kullanamaz; tersine mühendislik, otomatik veri çekme veya güvenlik testlerini izinsiz yapamazsınız."] },
          { p: "Bu yükümlülüklere aykırılık halinde Mivvo, hesabı askıya alma veya sözleşmeyi feshetme hakkına sahiptir." },
        ],
      },
      {
        h: "5. Hizmetin sınırları",
        blocks: [
          { ul: ["Yapay zekâ analizi olasılığa dayalıdır. Mivvo bazı riskleri tespit edemeyebilir veya zararsız bir mesajı riskli olarak değerlendirebilir. Uyarılar, ebeveynin değerlendirmesine yardımcı olmak içindir.", "Mivvo, yalnızca desteklenen uygulamaların bildirimlerinde görünen metni analiz edebilir. Bildirimi kapatılmış sohbetler, silinen mesajlar, görseller ve sesli mesajlar analiz edilemez.", "Hizmet; internet bağlantısı, cihaz ayarları, işletim sistemi kısıtlamaları ve üçüncü taraf uygulamalardaki değişiklikler nedeniyle kesintiye uğrayabilir.", "Mivvo bir acil durum, kolluk veya psikolojik destek hizmeti değildir. Acil durumlarda 112'yi arayın."] },
        ],
      },
      {
        h: "6. Ücretler ve abonelik",
        blocks: [{ p: `Yeni hesaplar için ilk ${trial} gün ücretsizdir; deneme süresi sonunda otomatik ücret alınmaz. Ücretli abonelik ${price} TL (KDV dahil) karşılığında 30 günlük kullanım sağlar ve kendiliğinden yenilenmez. Satın alma koşulları Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu'nda, iade koşulları İptal ve İade Politikası'nda yer alır.` }],
      },
      {
        h: "7. Sorumluluğun sınırlandırılması",
        blocks: [{ p: "Mivvo, hizmeti özenle ve güncel teknik standartlara uygun olarak sunmayı taahhüt eder. Kanunun emredici hükümleri ve kast ile ağır ihmal halleri saklı kalmak kaydıyla Mivvo; tespit edilemeyen riskler, üçüncü taraf hizmet kesintileri veya Kullanıcı'nın bu koşullara aykırı kullanımından doğan dolaylı zararlardan sorumlu tutulamaz." }],
      },
      { h: "8. Fikri mülkiyet", blocks: [{ p: "Hizmete ait yazılım, tasarım, logo ve içeriklerin tüm hakları Mivvo'ya aittir. Size yalnızca kişisel ve ticari olmayan kullanım için sınırlı, devredilemez bir kullanım hakkı tanınır." }] },
      { h: "9. Fesih", blocks: [{ p: "Hesabınızı dilediğiniz zaman ebeveyn panelinden silebilirsiniz. Hesabın silinmesiyle sözleşme sona erer ve verileriniz Gizlilik Politikası'ndaki sürelere göre silinir." }] },
      { h: "10. Değişiklikler", blocks: [{ p: "Bu koşullar güncellenebilir. Önemli değişiklikler yürürlüğe girmeden önce e-posta veya uygulama içi bildirimle duyurulur. Değişiklikten sonra hizmeti kullanmaya devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir." }] },
      { h: "11. Uygulanacak hukuk ve uyuşmazlıklar", blocks: [{ p: "Bu sözleşmeye Türkiye Cumhuriyeti hukuku uygulanır. Tüketici sıfatına sahip kullanıcılar, uyuşmazlıklarda yerleşim yerlerindeki veya işlemin yapıldığı yerdeki Tüketici Hakem Heyetleri ile Tüketici Mahkemelerine başvurabilir. Diğer uyuşmazlıklarda Ankara Mahkemeleri ve İcra Daireleri yetkilidir." }] },
    ],
  },

  // ───────────────────────────────── ÖN BİLGİLENDİRME ─────────────────────────────────
  {
    slug: "on-bilgilendirme",
    title: "Ön Bilgilendirme Formu",
    short: "Ön Bilgilendirme",
    description: "Mesafeli Sözleşmeler Yönetmeliği uyarınca Mivvo aboneliği satın alımından önce tüketiciye sunulan ön bilgilendirme formu.",
    version: "1.1",
    updated: "2026-10-24",
    sections: [
      {
        h: "1. Satıcı / hizmet sağlayıcı",
        blocks: [{ ul: [`Unvan: ${company}`, `Adres: ${SITE.address.street}, ${SITE.address.city}`, `E-posta: ${SITE.email}`, `Telefon/WhatsApp: ${SITE.phoneDisplay}`, ...(C.mersis ? [`MERSİS No: ${C.mersis}`] : []), ...(C.taxOffice ? [`Vergi Dairesi / No: ${C.taxOffice}`] : [])] }],
      },
      {
        h: "2. Hizmetin temel nitelikleri",
        blocks: [{ p: `Mivvo Aylık Abonelik: Ödeme tarihinden itibaren 30 gün boyunca Mivvo ebeveyn kontrol hizmetinden (mesaj risk analizi, anlık uyarılar, raporlar, ebeveyn paneli ve uygulamalar) sınırsız yararlanma hakkı. Hizmet elektronik ortamda sunulur; fiziksel teslimat yoktur.` }],
      },
      {
        h: "3. Fiyat ve ödeme",
        blocks: [{ ul: [`Toplam bedel: ${price} TL (KDV dahil). Başka bir masraf veya kargo ücreti yoktur.`, paymentMethods, "Abonelik kendiliğinden yenilenmez; süre sonunda yeniden ödeme yapmadığınız sürece ücret alınmaz."] }],
      },
      { h: "4. İfa", blocks: [{ p: "Abonelik, ödemenin onaylanmasıyla birlikte derhal etkinleşir ve hesabınızda süre bilgisi görüntülenir." }] },
      {
        h: "5. Cayma hakkı",
        blocks: [{ p: "Sözleşmenin kurulduğu tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeden ve cezai şart ödemeden cayma hakkınız vardır. Cayma bildiriminizi bu süre içinde sce@scegrup.com adresine iletmeniz yeterlidir. Bedel, bildirimin ulaşmasından itibaren en geç 14 gün içinde ödeme yaptığınız yönteme iade edilir. Ayrıntılar İptal ve İade Politikası'ndadır." }],
      },
      { h: "6. Şikâyet ve itiraz", blocks: [{ p: `Şikâyetlerinizi ${SITE.email} adresine iletebilirsiniz. Ticaret Bakanlığı'nca ilan edilen parasal sınırlar dahilinde yerleşim yerinizdeki Tüketici Hakem Heyeti'ne, sınırların üzerindeki uyuşmazlıklarda Tüketici Mahkemesi'ne başvurabilirsiniz.` }] },
    ],
  },

  // ───────────────────────────────── MESAFELİ SATIŞ ─────────────────────────────────
  {
    slug: "mesafeli-satis",
    title: "Mesafeli Satış Sözleşmesi",
    short: "Mesafeli Satış",
    description: "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca Mivvo abonelik satış sözleşmesi.",
    version: "1.1",
    updated: "2026-10-24",
    sections: [
      { h: "Madde 1 – Taraflar", blocks: [{ p: `SATICI: ${company}, ${SITE.address.street}, ${SITE.address.city}, ${SITE.email}, ${SITE.phoneDisplay}${C.mersis ? `, MERSİS: ${C.mersis}` : ""}.` }, { p: "ALICI: Mivvo üyelik kaydında ve ödeme sırasında bilgileri yer alan ebeveyn hesabı sahibi." }] },
      { h: "Madde 2 – Konu", blocks: [{ p: "Bu sözleşmenin konusu, ALICI'nın mivvo.org üzerinden elektronik ortamda satın aldığı Mivvo Aylık Abonelik hizmetinin satışı ve ifasına ilişkin tarafların hak ve yükümlülükleridir. ALICI, satın alma öncesinde Ön Bilgilendirme Formu'nu okuyup onayladığını kabul eder." }] },
      { h: "Madde 3 – Hizmet ve bedel", blocks: [{ ul: ["Hizmet: Mivvo Aylık Abonelik (30 gün).", `Bedel: ${price} TL (KDV dahil).`, SITE.cardPaymentsEnabled ? "Ödeme yöntemi: Kredi/banka kartı (iyzico) veya havale/EFT." : "Ödeme yöntemi: Havale/EFT.", "İfa: Ödemenin onaylanmasıyla derhal, elektronik ortamda."] }] },
      { h: "Madde 4 – Genel hükümler", blocks: [{ ul: ["SATICI, hizmeti Kullanım Koşulları'nda belirtilen nitelikte ve kesintisiz sunmak için gerekli özeni gösterir.", "Hizmetin; üçüncü taraf altyapı, işletim sistemi veya internet kesintileri nedeniyle geçici olarak sunulamaması halinde SATICI, makul süre içinde hizmeti yeniden sağlar. Uzun süreli kesintilerde kullanılmayan süre ALICI'ya ek süre olarak tanımlanabilir.", "Ödemenin banka veya ödeme kuruluşu tarafından herhangi bir nedenle gerçekleştirilmemesi halinde abonelik etkinleşmez."] }] },
      { h: "Madde 5 – Cayma hakkı", blocks: [{ p: "ALICI, sözleşmenin kurulmasından itibaren 14 gün içinde gerekçe göstermeksizin cayma hakkına sahiptir. Cayma bildirimi sce@scegrup.com adresine yapılır. SATICI, bildirimin kendisine ulaşmasından itibaren 14 gün içinde tahsil edilen bedelin tamamını ALICI'nın ödeme yaptığı yönteme iade eder." }] },
      { h: "Madde 6 – Kişisel veriler", blocks: [{ p: "ALICI'ya ait kişisel veriler, KVKK Aydınlatma Metni ve Gizlilik Politikası'na uygun olarak işlenir. Kart bilgileri yalnızca iyzico tarafından işlenir ve SATICI'ya iletilmez." }] },
      { h: "Madde 7 – Uyuşmazlıkların çözümü", blocks: [{ p: "Bu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı'nca her yıl ilan edilen parasal sınırlar dahilinde ALICI'nın yerleşim yerindeki veya işlemin yapıldığı yerdeki Tüketici Hakem Heyetleri, sınırların üzerindeki uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir." }] },
      { h: "Madde 8 – Yürürlük", blocks: [{ p: "ALICI, ödeme adımında bu sözleşmeyi elektronik ortamda onayladığı anda sözleşme kurulmuş ve yürürlüğe girmiş olur. Sözleşmenin bir örneği ALICI'nın talebi halinde e-posta ile iletilir ve bu sayfada her zaman erişilebilir durumdadır." }] },
    ],
  },

  // ───────────────────────────────── İPTAL VE İADE ─────────────────────────────────
  {
    slug: "iptal-iade",
    title: "İptal ve İade Politikası",
    short: "İptal ve İade",
    description: "Mivvo abonelik iptali, cayma hakkı ve iade koşulları.",
    version: "1.0",
    updated: "2026-10-24",
    sections: [
      { h: "Ücretsiz deneme", blocks: [{ p: `İlk ${trial} gün ücretsizdir ve kart bilgisi istenmez. Deneme süresinin sonunda herhangi bir ücret alınmaz.` }] },
      { h: "Otomatik yenileme yok", blocks: [{ p: "Aylık abonelik 30 gün sonunda kendiliğinden sona erer ve yenilenmez. Bu nedenle iptal etmeniz gereken bir otomatik ödeme talimatı yoktur." }] },
      {
        h: "14 gün içinde koşulsuz iade",
        blocks: [
          { p: "Ödeme tarihinden itibaren 14 gün içinde, herhangi bir gerekçe göstermeden ücretin tamamının iadesini isteyebilirsiniz." },
          { ul: [`Talebinizi kayıtlı e-posta adresinizden ${SITE.email} adresine \"İade talebi\" konusuyla iletin.`, "İade, talebinizin bize ulaşmasından itibaren en geç 14 gün içinde ödeme yaptığınız karta veya hesaba yapılır.", "Bankanıza bağlı olarak tutarın hesabınıza yansıması birkaç iş günü sürebilir.", "İade ile birlikte abonelik süreniz sona erer."] },
        ],
      },
      { h: "14 günden sonra", blocks: [{ p: "14 günlük süreden sonra kalan gün için kısmi iade yapılmaz; aboneliğiniz süre sonuna kadar kullanılabilir. Hizmetin bizden kaynaklanan bir nedenle uzun süre sunulamaması halinde kullanılamayan süre ek süre olarak tanımlanır veya orantılı iade yapılır." }] },
    ],
  },

  // ───────────────────────────────── ÇEREZ ─────────────────────────────────
  {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    short: "Çerezler",
    description: "Mivvo web sitesinde kullanılan çerezler ve amaçları.",
    version: "1.0",
    updated: "2026-10-24",
    sections: [
      { h: "Hangi çerezleri kullanıyoruz?", blocks: [{ p: "mivvo.org yalnızca sitenin çalışması için zorunlu olan çerezleri kullanır. Reklam, analitik veya üçüncü taraf takip çerezi kullanılmaz; bu nedenle çerez onay penceresi gösterilmez." }, { table: { head: ["Çerez", "Amaç", "Süre"], rows: [["authjs.session-token", "Ebeveyn paneli oturumunun açık kalması", "Oturum / 30 gün"], ["authjs.csrf-token, authjs.callback-url", "Giriş işlemlerinin güvenliği", "Oturum"], ["mivvo_locale", "Dil tercihinin hatırlanması (TR/EN)", "1 yıl"]] } }] },
      { h: "Çerezleri nasıl yönetebilirsiniz?", blocks: [{ p: "Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezleri engellemeniz halinde ebeveyn paneline giriş yapamayabilirsiniz." }] },
    ],
  },

  // ───────────────────────────────── GÜVENLİK ─────────────────────────────────
  {
    slug: "guvenlik",
    title: "Güvenlik",
    short: "Güvenlik",
    description: "Mivvo'nun aileleri ve çocukları korumak için uyguladığı teknik ve idari güvenlik önlemleri.",
    version: "1.0",
    updated: "2026-10-24",
    sections: [
      {
        h: "Teknik önlemler",
        blocks: [{ ul: ["Tüm trafik TLS ile şifrelenir; sunucular HSTS ve güvenlik başlıklarıyla korunur.", "Şifreler bcrypt ile özetlenerek saklanır; hiçbir çalışanımız şifrenizi göremez.", "Çocuk cihazları, eşleşme sırasında yalnızca o cihaza özel ve imzalı bir erişim anahtarı alır. Uygulama paketinin içinde ortak bir gizli anahtar bulunmaz.", "Eşleştirme kodları kısa sürelidir (15 dakika) ve kriptografik olarak imzalanır.", "Giriş, kayıt ve eşleştirme uç noktalarında deneme sayısı sınırlandırılır.", "Ödemeler iyzico'nun güvenli ödeme sayfasında alınır; kart bilgileri sistemlerimize ulaşmaz ve her ödeme sunucu tarafında iyzico'dan yeniden doğrulanır.", "Çocuk uygulaması yalnızca izin verilen mesajlaşma uygulamalarının bildirimlerini işler; resim ve ses içeriklerini hiç okumaz."] }],
      },
      {
        h: "Veri minimizasyonu",
        blocks: [{ ul: ["Güvenli mesajların metni saklanmaz.", "Bildirimlerin kilit ekranında görünen kısmında mesaj içeriği yer almaz.", "Eski kayıtlar belirlenen sürelerde otomatik silinir."] }],
      },
      {
        h: "Güvenlik açığı bildirimi",
        blocks: [{ p: `Bir güvenlik açığı fark ettiyseniz lütfen ${SITE.email} adresine \"Güvenlik\" konusuyla yazın. Bildirimleri en kısa sürede inceler, iyi niyetli araştırmacılara karşı yasal işlem başlatmayız. Lütfen açığı düzeltilene kadar kamuya açıklamayın ve gerçek kullanıcı verilerine erişmeyin.` }],
      },
    ],
  },
];

export const getLegalDoc = (slug: string) => legalDocs.find((d) => d.slug === slug);
