# Local Child Flow Test Plan

Bu plan, cocuk uygulamasinin ebeveyne baglanmasini, heartbeat ile online/offline takibini ve riskli mesaj bildirimi akisinin localde test edilmesini saglar.

## 1) Cocuk-Ebeveyn Eslestirme (Pairing)

1. Ebeveyn hesabiyla giris yapin.
2. `http://localhost:3000/dashboard/cocuklar` sayfasindan Pairing Code alin.
3. Asagidaki istegi gonderin:

```bash
curl -X POST http://localhost:3000/api/setup/pair \
  -H "Content-Type: application/json" \
  -H "x-mobile-api-key: demo-local-mobile-key" \
  -d '{
    "pairCode": "<DASHBOARD_PAIRING_CODE>",
    "displayName": "Test Cocuk",
    "birthDate": "2012-05-18",
    "deviceId": "android-test-device-1",
    "fcmToken": "fake-token-local"
  }'
```

4. Donen `childId` degerini saklayin.

## 2) Heartbeat ve Uninstall Suphesi Testi

Heartbeat cocuk uygulamasi acikken 1-5 dakikada bir gonderilmelidir.

```bash
curl -X POST http://localhost:3000/api/mobile/heartbeat \
  -H "Content-Type: application/json" \
  -H "x-mobile-api-key: demo-local-mobile-key" \
  -d '{
    "childId": "<CHILD_ID>",
    "deviceId": "android-test-device-1",
    "fcmToken": "fake-token-local",
    "appVersion": "1.0.0"
  }'
```

Beklenen:
- `dashboard/cocuklar` ekraninda durum "Cevrimici" gorunur.
- Heartbeat kesilirse durum "Cevrimdisi" olur.
- Uzun sure heartbeat gelmez ve token yoksa "Uygulama Silinmis Olabilir" gorunur.

## 3) Riskli Mesaj Anlik Bildirim Testi

```bash
curl -X POST http://localhost:3000/api/activity \
  -H "Content-Type: application/json" \
  -H "x-api-key: demo-local-mobile-key" \
  -d '{
    "childId": "<CHILD_ID>",
    "activities": [
      {
        "platform": "WHATSAPP",
        "type": "MESSAGE",
        "content": "Sana zarar verecegim, kimseye soyleme",
        "contactUsername": "riskli_kisi",
        "contactDisplayName": "Riskli Kisi"
      }
    ]
  }'
```

Beklenen:
- Alert kaydi olusur.
- `parent_notifications` kaydi delivered true/false olarak loglanir.
- FCM ayarlari dogruysa ebeveyne push gider.

## 4) Cocuk Uygulamasinin Neleri Gormeyecegi

Cocuk uygulamasi sadece:
- Pairing code girer
- Arka planda heartbeat ve activity event gonderir

Cocuk uygulamasi sunlari gormez:
- Dashboard alert detaylari
- Ebeveyn ayarlari
- Kredi/odeme ve yonetim ekranlari

## 5) Operasyonel Not

Gercek cihazda "app uninstall" olayi OS tarafinda dogrudan event olarak verilmez.
Bu nedenle en guvenilir yaklasim:
- Heartbeat timeout +
- FCM token gecersizligi +
- Son aktivite zamani
kombinasyonudur.
