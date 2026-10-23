# APK Files

Bu klasöre Mivvo APK dosyalarını koy:

- `mivvo-child-latest.apk` → Çocuk uygulaması
- `mivvo-parent-latest.apk` → Ebeveyn uygulaması

Bu dosyalar Vercel deployment sırasında `public/apk/` içinde bulunmalı.
APK dosyaları `.gitignore` ile git'e eklenmez — deploy öncesi bu klasöre manuel kopyala.

## Kullanım
- `/api/download/child` → mivvo-child-latest.apk'yı indirir
- `/api/download/parent` → mivvo-parent-latest.apk'yı indirir
