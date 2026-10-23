export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "tip"; text: string };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: string;
  published: string; // ISO date
  updated: string;
  readMinutes: number;
  body: GuideBlock[];
};

export const guides: Guide[] = [
  {
    slug: "siber-zorbalik-belirtileri",
    title: "Siber Zorbalık Nedir? Çocuğunuzun Zorbalığa Uğradığını Gösteren 10 İşaret",
    description:
      "Siber zorbalık nedir, nasıl anlaşılır ve ebeveyn olarak ne yapmalısınız? Çocuğunuzun çevrim içi zorbalığa maruz kaldığını gösteren 10 belirti ve adım adım yol haritası.",
    category: "Siber Zorbalık",
    published: "2026-10-20",
    updated: "2026-10-20",
    readMinutes: 7,
    body: [
      { type: "p", text: "Siber zorbalık; mesajlaşma uygulamaları, sosyal medya, oyunlar veya grup sohbetleri üzerinden bir çocuğun tekrar tekrar aşağılanması, dışlanması, tehdit edilmesi ya da utandırılmasıdır. Okul bahçesindeki zorbalıktan farkı, okul zili çaldığında bitmemesidir: telefon cebe girdiği sürece zorbalık da eve, yatak odasına, gece yarısına kadar taşınır." },
      { type: "p", text: "Çocukların büyük bölümü yaşadıklarını ebeveynlerine anlatmaz. Telefonunun elinden alınacağından, \"abartıyorsun\" denmesinden ya da durumun daha da kötüleşmesinden korkar. Bu yüzden ebeveynin işaretleri fark edebilmesi çok önemlidir." },
      { type: "h2", text: "Siber zorbalığın en sık görülen biçimleri" },
      { type: "ul", items: [
        "Grup sohbetlerinden bilerek çıkarılma ya da hiç eklenmeme (dışlama)",
        "Aşağılayıcı lakaplar, alaycı yorumlar, \"herkes senden nefret ediyor\" gibi mesajlar",
        "Utandırıcı fotoğraf veya ekran görüntülerinin izinsiz paylaşılması",
        "Sahte hesap açıp çocuğun adına paylaşım yapılması",
        "Tehdit ve şantaj: \"Bunu yapmazsan fotoğrafını herkese atarım\"",
      ]},
      { type: "h2", text: "Dikkat etmeniz gereken 10 işaret" },
      { type: "ol", items: [
        "Bildirim geldiğinde gerginleşmesi, telefonu hızla kapatması veya ters çevirmesi",
        "Daha önce çok sevdiği bir uygulamayı ya da oyunu aniden bırakması",
        "Okula gitmek istememesi, sık sık karın ağrısı veya baş ağrısından şikâyet etmesi",
        "Uyku düzeninin bozulması, gece geç saatlere kadar telefona bakması",
        "Arkadaş çevresinden aniden kopması, yalnız kalmak istemesi",
        "Telefonla ilgili sorulara savunmacı ya da öfkeli tepki vermesi",
        "Ders başarısında belirgin düşüş",
        "Kendini değersiz hissettiğini gösteren cümleler: \"Kimse beni sevmiyor\"",
        "Sosyal medya hesaplarını silmesi ya da yeni, gizli hesaplar açması",
        "İştahında, ruh halinde ve enerjisinde haftalarca süren değişiklik",
      ]},
      { type: "tip", text: "Bu işaretlerden biri tek başına zorbalık anlamına gelmez. Ama birkaçı birlikte ve iki haftadan uzun süredir görülüyorsa, sakin bir konuşma zamanı gelmiş demektir." },
      { type: "h2", text: "Çocuğunuz zorbalığa uğruyorsa ne yapmalısınız?" },
      { type: "ol", items: [
        "Önce sakin kalın ve dinleyin. İlk cümleniz \"Bana anlattığın için çok teşekkür ederim\" olsun.",
        "Telefonu cezalandırma aracı olarak elinden almayın. Bu, bir dahaki sefere size anlatmamasına yol açar.",
        "Kanıtları saklayın: mesajların, kullanıcı adlarının ve tarihlerin ekran görüntüsünü alın.",
        "Zorbalık yapan hesabı engelleyin ve platforma şikâyet edin.",
        "Zorbalık okul arkadaşlarından geliyorsa okul rehberlik servisiyle görüşün.",
        "Tehdit, şantaj veya cinsel içerik varsa vakit kaybetmeden 155 (Polis) ya da 156 (Jandarma) ile iletişime geçin.",
        "Çocuğunuzda uzun süren mutsuzluk veya kendine zarar verme düşüncesi fark ederseniz bir çocuk ve ergen psikiyatristinden destek alın.",
      ]},
      { type: "h2", text: "Önleyici adımlar" },
      { type: "p", text: "En güçlü koruma, çocuğunuzun başı sıkıştığında size gelebileceğini bilmesidir. Telefon kurallarını birlikte belirleyin, gizlilik ayarlarını beraber yapın ve \"Ne olursa olsun bana anlatabilirsin, kızmayacağım\" mesajını sık sık tekrarlayın." },
      { type: "p", text: "Mivvo gibi şeffaf koruma araçları, çocuğunuzun mesajlarının tamamını okumadan yalnızca zorbalık, tehdit veya taciz içeren ifadeler tespit edildiğinde size haber verir. Böylece sorunu haftalar sonra değil, ilk gün öğrenirsiniz." },
    ],
  },
  {
    slug: "cevrim-ici-istismar-grooming",
    title: "Çevrim İçi İstismar (Grooming) Nedir? Ebeveynlerin Bilmesi Gereken Uyarı İşaretleri",
    description:
      "Grooming, kötü niyetli yetişkinlerin internette çocukların güvenini kazanma sürecidir. Aşamaları, uyarı işaretleri ve şüphelendiğinizde atmanız gereken adımlar.",
    category: "Çevrim İçi Güvenlik",
    published: "2026-10-20",
    updated: "2026-10-20",
    readMinutes: 8,
    body: [
      { type: "p", text: "Grooming, kötü niyetli bir kişinin bir çocuğu istismar etmek amacıyla onun ve çoğu zaman ailesinin güvenini adım adım kazanması sürecidir. İnternette bu süreç oyun sohbetlerinde, sosyal medyanın mesaj kutularında veya \"yeni arkadaş\" olarak eklenen hesaplarda başlar." },
      { type: "p", text: "Bu kişiler çoğunlukla kendilerini çocukla yaşıt gibi tanıtır, sabırlıdır ve haftalarca, hatta aylarca güven inşa eder. Bu yüzden erken fark etmek hayati önem taşır." },
      { type: "h2", text: "Grooming'in tipik aşamaları" },
      { type: "ol", items: [
        "Hedef seçme: Yalnız, ilgiye ihtiyaç duyan veya ailesiyle sorun yaşayan çocuklar seçilir.",
        "Güven kazanma: Ortak ilgi alanları, sürekli iltifat, \"seni sadece ben anlıyorum\" söylemi.",
        "İhtiyaç karşılama: Oyun içi hediye, para, kontör veya dinleyen bir kulak.",
        "Yalıtma: \"Ailen anlamaz\", \"bu aramızda kalsın\" gibi cümlelerle çocuğu çevresinden koparma.",
        "Cinselleştirme: Konuşmaları yavaş yavaş cinsel konulara çekme, fotoğraf isteme.",
        "Kontrol ve şantaj: Gönderilen içerikleri kullanarak tehdit etme ve susturma.",
      ]},
      { type: "h2", text: "Mesajlarda görülen alarm cümleleri" },
      { type: "ul", items: [
        "\"Kimseye söyleme\", \"aramızda kalsın\", \"annene gösterme\"",
        "\"Sen yaşına göre çok olgunsun\"",
        "\"Bana özel bir fotoğrafını atar mısın?\"",
        "\"Başka bir uygulamadan konuşalım\" (genelde mesajların kaybolduğu uygulamalara geçiş)",
        "\"Seninle buluşmak istiyorum, kimseye söylemeden gel\"",
      ]},
      { type: "tip", text: "Gizlilik talebi + hediye + özel fotoğraf isteği üçlüsü, grooming'in en net işaretidir. Bu üçünden biri bile ciddiye alınmalıdır." },
      { type: "h2", text: "Çocuğunuzda görebileceğiniz değişiklikler" },
      { type: "ul", items: [
        "Kim olduğunu açıklamadığı yeni bir \"internet arkadaşı\"",
        "Açıklayamadığı hediyeler, oyun içi para veya kontör",
        "Telefonu sürekli kilitli tutması, gece geç saatlerde gizlice yazışması",
        "Yaşına uygun olmayan cinsel bilgi veya kelimeler kullanması",
        "Utanç, suçluluk veya korku gösteren ani duygu değişimleri",
      ]},
      { type: "h2", text: "Şüphelenirseniz ne yapmalısınız?" },
      { type: "ol", items: [
        "Çocuğunuzu suçlamayın. Ona, yaşananların asla onun suçu olmadığını açıkça söyleyin.",
        "Hesabı hemen silmeyin; önce mesajların, kullanıcı adının ve profil bağlantısının ekran görüntülerini alın.",
        "Çocuğunuzdan gelen hiçbir uygunsuz görseli kendi cihazınıza kaydetmeyin veya başkasına iletmeyin.",
        "155 (Polis) veya 156 (Jandarma) ile iletişime geçin. Çevrim içi içerikler için ihbarweb.org.tr adresine de bildirim yapabilirsiniz.",
        "Hesabı engelleyip platforma şikâyet edin.",
        "Çocuğunuz için bir uzmandan psikolojik destek alın.",
      ]},
      { type: "h2", text: "Korumanın en etkili yolu" },
      { type: "p", text: "Hiçbir teknoloji açık bir aile iletişiminin yerini tutmaz. Ancak grooming tam da çocuğu ailesinden yalıtarak işlediği için, çocuk anlatmasa bile sizi uyarabilecek bir sistem büyük fark yaratır. Mivvo'nun \"Cinsel Risk\" ve \"Yabancı Kişi\" kategorileri, tam olarak yukarıdaki kalıpları yakalamak için tasarlandı." },
    ],
  },
  {
    slug: "cocuga-ilk-akilli-telefon",
    title: "Çocuğa İlk Akıllı Telefon: Kaç Yaşında Alınmalı, Hangi Kurallar Konmalı?",
    description:
      "Çocuğunuza akıllı telefon almadan önce bilmeniz gerekenler: doğru yaş, hazır olma işaretleri, aile telefon sözleşmesi ve ilk hafta yapılması gereken güvenlik ayarları.",
    category: "Dijital Ebeveynlik",
    published: "2026-10-20",
    updated: "2026-10-20",
    readMinutes: 6,
    body: [
      { type: "p", text: "\"Sınıfta bir tek benim telefonum yok\" cümlesi pek çok ebeveynin tanıdığı bir baskıdır. İlk akıllı telefon kararında tek bir doğru yaş yoktur; asıl soru, çocuğunuzun ve ailenizin buna hazır olup olmadığıdır." },
      { type: "h2", text: "Çocuğunuz hazır mı? 6 soru" },
      { type: "ul", items: [
        "Eşyalarına sahip çıkabiliyor mu? (kaybetmeden, kırmadan)",
        "Ekranı kapatma zamanı geldiğinde büyük kriz çıkarmadan bırakabiliyor mu?",
        "Bir şey onu rahatsız ettiğinde size anlatır mı?",
        "Yabancılarla kişisel bilgi paylaşmaması gerektiğini anlıyor mu?",
        "Telefona gerçekten neden ihtiyaç duyuyor? (ulaşım, güvenlik, iletişim)",
        "Siz, kuralları tutarlı şekilde uygulamaya hazır mısınız?",
      ]},
      { type: "tip", text: "Akıllı telefon tek seferde verilmek zorunda değil. Önce yalnızca arama ve mesaj, sonra sınırlı uygulamalar, en son sosyal medya şeklinde kademeli bir geçiş çok daha sağlıklıdır." },
      { type: "h2", text: "Aile telefon sözleşmesi: Örnek maddeler" },
      { type: "ol", items: [
        "Telefon yatak odasında şarj edilmez; saat 22:00'den sonra salonda kalır.",
        "Yemekte ve ödev sırasında telefon masada olmaz.",
        "Yeni bir uygulama indirmeden önce birlikte konuşuruz.",
        "Tanımadığım kişilerin arkadaşlık isteklerini kabul etmem.",
        "Beni rahatsız eden bir mesaj gelirse ailemle paylaşırım; bunun için cezalandırılmam.",
        "Kişisel bilgilerimi, okulumu ve adresimi internette paylaşmam.",
        "Kurallar her 6 ayda bir birlikte gözden geçirilir.",
      ]},
      { type: "p", text: "Sözleşmeyi birlikte yazın ve ikiniz de imzalayın. Kuralları ebeveynlerin de uyduğu aile kuralları olarak sunmak, çocukların kabullenmesini kolaylaştırır." },
      { type: "h2", text: "İlk hafta yapılacak güvenlik ayarları" },
      { type: "ul", items: [
        "Telefonun ekran kilidini birlikte kurun.",
        "Uygulama mağazasında yaşa uygun içerik filtresini açın.",
        "Sosyal medya hesaplarını \"gizli hesap\" olarak ayarlayın.",
        "Konum paylaşımını yalnızca aile üyeleriyle sınırlayın.",
        "Mesajlaşma uygulamalarında, rehberde olmayan kişilerin çocuğunuzu gruplara eklemesini kapatın.",
        "Şeffaf bir koruma aracı kurun ve neden kurduğunuzu çocuğunuza açıkça anlatın.",
      ]},
      { type: "h2", text: "Gizli takip mi, şeffaf koruma mı?" },
      { type: "p", text: "Çocuğun bilgisi olmadan telefonunu gizlice izlemek, fark edildiğinde aradaki güveni ciddi şekilde zedeler ve çocuğu yeni, gizli hesaplara yöneltebilir. Mivvo bu nedenle gizlenmeyen, çocuğun bildiği ve yalnızca riskli durumlarda devreye giren bir model kullanır. Amaç çocuğu kontrol etmek değil, tehlike anında yalnız bırakmamaktır." },
    ],
  },
  {
    slug: "cocukla-dijital-guvenlik-konusmasi",
    title: "Çocuğunuzla Dijital Güvenlik Konuşması Nasıl Yapılır? Yaşa Göre Rehber",
    description:
      "Çocuğunuzla internet güvenliği hakkında suçlamadan, korkutmadan nasıl konuşursunuz? 6-9, 10-13 ve 14-17 yaş grupları için örnek cümleler ve konuşma ipuçları.",
    category: "Dijital Ebeveynlik",
    published: "2026-10-20",
    updated: "2026-10-20",
    readMinutes: 6,
    body: [
      { type: "p", text: "Dijital güvenlik tek seferlik büyük bir konuşma değil, yıllara yayılan küçük ve sık sohbetlerdir. Hedefiniz çocuğunuza bir kural listesi ezberletmek değil, başı sıkıştığında ilk size gelmesini sağlamaktır." },
      { type: "h2", text: "Her yaşta geçerli 4 altın kural" },
      { type: "ol", items: [
        "Sorgulamayın, merak edin: \"Neden bunu yaptın?\" yerine \"Bana göstersene, nasıl bir şey bu?\"",
        "Korkutmayın: Felaket senaryoları, çocukları anlatmak yerine saklamaya iter.",
        "Kendi hatalarınızı da paylaşın: \"Ben de bir keresinde sahte bir linke tıkladım\"",
        "Anlattığında ödüllendirin: İlk tepkiniz teşekkür olsun, ceza değil.",
      ]},
      { type: "h2", text: "6–9 yaş: Basit ve somut" },
      { type: "ul", items: [
        "\"İnternette tanımadığımız kişiler, sokakta tanımadığımız kişiler gibidir.\"",
        "\"Seni üzen ya da garip hissettiren bir şey görürsen ekranı kapat ve bana gel.\"",
        "\"Adını, okulunu ve evimizi internette kimseye söylemiyoruz.\"",
      ]},
      { type: "h2", text: "10–13 yaş: Sosyal medya ve arkadaşlık" },
      { type: "ul", items: [
        "\"Bir arkadaşın grupta dışlandığını görürsen ne yapardın?\"",
        "\"Biri senden 'aramızda kalsın' diye bir şey isterse, bu genelde bir şeylerin yanlış gittiğinin işaretidir.\"",
        "\"Paylaştığın bir fotoğrafı geri alamazsın; göndermeden önce bir kez daha düşün.\"",
      ]},
      { type: "h2", text: "14–17 yaş: Saygı, özerklik, ortaklık" },
      { type: "ul", items: [
        "\"Senin özel alanına saygı duyuyorum. Benim tek isteğim, tehlikeli bir durumda yalnız kalmaman.\"",
        "\"Şantaj ya da tehditle karşılaşırsan, ne göndermiş olursan ol sana kızmayacağım; birlikte çözeriz.\"",
        "\"Sence hangi kurallar adil? Birlikte belirleyelim.\"",
      ]},
      { type: "tip", text: "En iyi konuşmalar arabada, yürüyüşte ya da birlikte yemek yaparken yan yana olunan anlarda olur. Göz göze oturulan \"ciddi konuşmalar\" ergenlerde savunmaya geçmeye yol açabilir." },
      { type: "h2", text: "Bir uyarı aldığınızda konuşmaya nasıl başlarsınız?" },
      { type: "p", text: "Mivvo'dan bir uyarı aldığınızda ilk dürtünüz çocuğunuzu hemen sorguya çekmek olabilir. Bunun yerine birkaç dakika bekleyin, sakinleşin ve açık uçlu bir soruyla başlayın: \"Bugün seni üzen bir şey oldu mu? Biraz dalgın gibisin.\" Mivvo her uyarıyla birlikte duruma uygun bir konuşma önerisi de sunar; amaç çocuğunuzla aranızdaki güveni koruyarak sorunu birlikte çözmektir." },
    ],
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
