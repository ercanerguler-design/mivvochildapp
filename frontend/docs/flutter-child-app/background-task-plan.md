# Background Task Plan (Android WorkManager + iOS BGTask)

## Hedefler

1. Heartbeat: 5-10 dakikada bir
2. Activity batch upload: 1-3 dakikada bir veya event threshold olunca
3. Retry: ag hatasinda exponential backoff
4. Dayaniklilik: app kill/restart sonrasi queue kaybi olmamasi

## Android

- `workmanager` plugin ile periodic task
- Ayrica foreground event capture oldugunda queueya yaz
- Worker icinde:
1. local queue oku
2. ActivityUploadService ile batch gonder
3. basarili itemlari queue'dan sil
4. HeartbeatService gonder

## iOS

- `workmanager` BGTaskScheduler
- iOS kisitlari nedeniyle kesin dakika garantisi yok
- Uygulama acikken daha sik heartbeat
- Background firsatlarinda queue flush

## Uninstall tespiti gercegi

Mobil OS uninstall eventini her zaman vermez.
Bu yuzden backendde su kombinasyon kullanilir:

1. Son heartbeat zamani
2. Son gecerli FCM token durumu
3. Son aktivite zamani

Bu kombinasyon dashboardda "Uygulama Silinmis Olabilir" olarak gosterilir.

## Onerilen task adlari

- `child_heartbeat_task`
- `child_activity_upload_task`

## Onerilen interval

- Heartbeat: 10 dk
- Upload: 3 dk (veya queue >= 5 event)

## Failover

- Ilk hata: 30 sn
- Ikinci hata: 2 dk
- Ucuncu hata: 5 dk
- Sonrasi normal schedule'a don
