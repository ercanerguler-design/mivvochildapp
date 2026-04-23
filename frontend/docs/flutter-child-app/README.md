# Flutter Child App Integration (Local-First)

Bu klasor, child uygulama icin hazir servis siniflarini ve arka plan planini icerir.

## Kullanacagimiz servis stack

1. PairingService: cocugu ebeveyne guvenli pairing code ile baglar.
2. HeartbeatService: cihaz canlilik sinyali gonderir (online/offline/uninstall suphe).
3. ActivityUploadService: toplanan aktiviteleri toplu gonderir.
4. Background scheduler:
- Android: WorkManager
- iOS: BGTaskScheduler (workmanager plugin ile)

## Neon DB destekli mi?

Evet, Neon DB tam destekli.
Ama child uygulama Neon'a direkt baglanmayacak.
Dogru mimari:
- Flutter child app -> Next.js API endpointleri
- Next.js API -> Prisma -> Neon PostgreSQL

Bu sayede guvenlik, loglama, rate limit ve bildirim retry kontrolu backendde kalir.

## API endpoint eslesmesi

- PairingService -> `POST /api/setup/pair`
- HeartbeatService -> `POST /api/mobile/heartbeat`
- ActivityUploadService -> `POST /api/activity`

Pairing payload'inda `birthDate` (YYYY-MM-DD) zorunludur ve backend tarafinda 18 yas alti dogrulamasi yapilir.

## Local env gereksinimleri (backend)

- `MOBILE_API_KEY`
- `DATABASE_URL`
- `AUTH_SECRET`
- FCM icin:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Not

- Child uygulama ebeveyn dashboard icerigini gormez.
- Child sadece pairing, heartbeat ve activity upload yapar.
