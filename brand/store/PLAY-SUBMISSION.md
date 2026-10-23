# Mivvo Çocuk: Google Play'e yeniden gönderim rehberi

Önceki ret gerekçesi: **Stalkerware / izleme uygulamaları politikası.**
Uygulamanın 2.0.0 sürümü (versionCode 7) bu politikanın teknik şartlarını karşılayacak şekilde güncellendi. Aşağıdaki adımlar Play Console tarafında yapılacak işlerdir.

## 1. Kodda yapılanlar (kontrol listesi)

| Politika şartı | Durum |
|---|---|
| `isMonitoringTool` manifest bayrağı = `child_monitoring` | ✅ `plugins/withNotificationListener.js` |
| Uygulama çalışırken **her zaman** görünen bildirim | ✅ "Mivvo koruması açık" (kaydırılıp kapatılırsa geri gelir) |
| Uygulamayı açıkça tanımlayan benzersiz ikon, gizlenmeyen simge | ✅ Turuncu "Kucak" ikonu, launcher'da görünür |
| Kendini casus / gizli takip aracı olarak sunmamak | ✅ Tüm metinler "şeffaf koruma" diliyle yazıldı |
| İzleme işlevini gizlememek, yanıltmamak | ✅ İlk açılışta açıklama + onay ekranı |
| Kişisel veri için belirgin açıklama (prominent disclosure) ve onay | ✅ İzin istenmeden önce, "Kabul Et" ile |
| Gereksiz izin yok | ✅ Kamera, mikrofon, konum, depolama, overlay, telefon durumu engellendi |
| Yalnızca gerekli veriyi işlemek | ✅ Yalnızca mesajlaşma uygulamalarının bildirimleri, resim/ses okunmaz |

## 2. Build ve yükleme

```bash
cd child-app-expo
npm install            # patch-package yamayı otomatik uygular
eas build -p android --profile production
eas submit -p android  # veya .aab dosyasını Play Console'a elle yükleyin
```

> Gönderimden önce gerçek bir Android 13+ cihazda test edin: onay → eşleştirme → izinler → bildirim alanında "Mivvo koruması açık" görünmeli; WhatsApp'tan test mesajı gelince ebeveyn panelinde görünmeli.

## 3. Mağaza girişi (Store listing)

**Uygulama adı (30):** `Mivvo Çocuk: Aile Koruması`

**Kısa açıklama (80):** `Ebeveyn kontrolü: zorbalık ve taciz içeren mesajlarda ailenizi uyarır.`

**Tam açıklama:** (İzleme işlevinin açıklamada belirtilmesi **zorunludur**; ilk paragraf bu yüzden böyle.)

```
Mivvo Çocuk, ebeveynlerin çocuklarını çevrim içi risklere karşı korumak için kullandığı bir EBEVEYN KONTROL ve İZLEME uygulamasıdır. Çocuğun telefonuna, ebeveyn tarafından ve çocuğun bilgisiyle kurulur; ebeveynin Mivvo Ebeveyn hesabıyla eşleşir.

NE YAPAR?
Mivvo; WhatsApp, Instagram, TikTok, Snapchat, Telegram ve SMS uygulamalarından gelen bildirimlerin metnini yapay zekâ ile analiz eder. Zorbalık, tehdit, cinsel risk, şiddet veya tanınmayan kişilerden gelen rahatsız edici mesajlar tespit edildiğinde ebeveyne uyarı gönderir.

ŞEFFAF KORUMA
• Mivvo gizli değildir: koruma açıkken bildirim alanında her zaman "Mivvo koruması açık" bildirimi görünür.
• Uygulama simgesi telefonda görünür kalır.
• İlk açılışta çocuk, hangi verilerin işlendiğini okur ve onay verir.
• Çocuk istediği zaman eşleştirmeyi kaldırabilir.

HANGİ VERİLER İŞLENİR?
• Desteklenen mesajlaşma uygulamalarından gelen bildirimlerdeki gönderen adı ve mesaj metni.
• Yalnızca risk tespit edilen mesajlar saklanır ve ebeveyne gösterilir; güvenli mesajlar saklanmaz.
• Fotoğraf, video, sesli mesaj, konum, rehber, arama geçmişi, kamera ve mikrofon erişimi YOKTUR.

KİMLER İÇİN?
18 yaş altı çocuğu olan ebeveynler için tasarlanmıştır. Başka bir yetişkini (eş, çalışan vb.) izlemek için kullanılamaz.

Gizlilik politikası: https://mivvo.org/gizlilik
```

**Kategori:** Ebeveynlik (Parenting)
**Grafikler:** `brand/store/child-icon-512.png`, `brand/store/child-feature-1024x500.png`
**Ekran görüntüleri:** Onay ekranı, eşleştirme, izinler ve "Koruma açık" ekranından en az 4 adet (telefondan alın).

## 4. Uygulama içeriği (App content) formları

**Hedef kitle ve içerik:** `18 ve üzeri` seçin. Uygulamayı ebeveyn kurar ve yapılandırır. "Çocukların ilgisini çekebilir mi?" sorusuna **Hayır** deyin; açıklamada "ebeveyn kontrol uygulaması" olduğunu belirtin. (13 yaş altını seçmek, uygulamayı Aileler politikasına sokar ve izleme işleviyle çelişir.)

**Veri güvenliği (Data safety):**

| Veri türü | Toplanıyor | Paylaşılıyor* | Amaç | Zorunlu |
|---|---|---|---|---|
| Mesajlar → Diğer uygulama içi mesajlar | Evet | Hayır | Uygulama işlevi | Evet |
| Uygulama etkinliği → Diğer | Evet (çevrim içi durumu) | Hayır | Uygulama işlevi | Evet |
| Cihaz kimlikleri | Evet (uygulamaya özel rastgele kimlik) | Hayır | Uygulama işlevi | Evet |
| Kişisel bilgi → Ad | Evet (çocuğun adı) | Hayır | Uygulama işlevi | Evet |
| Kişisel bilgi → Diğer (doğum tarihi) | Evet | Hayır | Uygulama işlevi, yaş doğrulama | Evet |

\* Analiz için yapay zekâ sağlayıcısına aktarım, Google'ın tanımına göre "hizmet sağlayıcı" aktarımıdır ve "paylaşım" sayılmaz.
- Veriler aktarım sırasında şifreleniyor mu? **Evet**
- Kullanıcı verilerin silinmesini isteyebilir mi? **Evet** (sce@scegrup.com ve web paneli)

**Uygulama erişimi (App access):** İnceleme ekibinin eşleştirme yapabilmesi için bir **demo ebeveyn hesabı** oluşturun ve bilgilerini girin:

```
Bu uygulama, Mivvo Ebeveyn hesabıyla eşleşmeden çalışmaz.
1) https://mivvo.org/giris adresinden şu hesapla giriş yapın: <demo e-posta> / <demo şifre>
2) Panel > Çocuklar > "Çocuk ekle" ile eşleştirme kodu oluşturun.
3) Mivvo Çocuk'ta onay ekranını kabul edin, kodu yapıştırın, ad ve 18 yaş altı bir doğum tarihi girin.
4) İzinleri verin. Bildirim alanında "Mivvo koruması açık" kalıcı bildirimi görünür.
```

**Hassas izinler:** Bildirim erişimi (Notification Listener) kısıtlı izin listesinde değildir, ayrı beyan gerekmez. Yine de inceleme notuna kısa bir **ekran kaydı videosu** (YouTube, liste dışı) eklemek ret riskini düşürür: onay ekranı, izinler ve kalıcı bildirim.

## 5. Yayından sonra

- Web sitesinde çocuk uygulaması için APK yerine Play bağlantısı kullanın. Politika, Play dışındaki uyumsuz APK'lara yönlendirmeyi yasaklar. Vercel ortam değişkeni:
  `NEXT_PUBLIC_CHILD_APK_URL=https://play.google.com/store/apps/details?id=org.mivvo.child`
- Tüm cihazlar 2.0.0'a geçince Vercel'de `MOBILE_LEGACY_KEY_DISABLED=true` yapın. Böylece eski, uygulamaya gömülü anahtar artık kabul edilmez.
