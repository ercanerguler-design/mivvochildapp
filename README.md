# Mivvo — Çocuk Güvenlik Uygulaması

Mivvo, yapay zeka destekli Türkçe içerik moderasyon sistemiyle çocukların dijital ortamdaki güvenliğini koruyan bir ebeveyn uygulamasıdır.

## Teknoloji Stack’i

- **Next.js 16.2** (App Router, TypeScript)
- **Prisma 7** + **Neon PostgreSQL** (serverless)
- **NextAuth.js v5** (Google OAuth + Credentials, JWT)
- **OpenAI GPT-4o** (Türkçe NLP analizi)
- **Firebase FCM** (push bildirimleri)
- **TailwindCSS v4**

## Özellikler

- 7 risk kategorisi: Zorbalık, Şiddet, Cinsel Risk, Tehdit, Küfür, Aşırı Öfke, Yabancı Kişi
- Sosyal medya izleme: Instagram, Snapchat, TikTok, WhatsApp, Telegram, SMS
- Gece saati ve yeni tanışma davranışsal analizi
- KVKK uyumlu (veri minimizasyonu, silme hakkı)
- Anında ebeveyn push bildirimi
- Zorunlu dogum tarihi ve 18 yas alti yas kapisi (server-side)
- Admin panelinde eksik dogum tarihi kayitlari icin zorunlu tamamlama akisi

## Kurulum

```bash
cd frontend
npm install
cp .env.local.example .env.local
# .env.local dosyasını doldurun
npx prisma db push
npm run dev
```

## Vercel Deploy

1. Repo’yu Vercel’e import edin
2. Root directory olarak `frontend` seçin (veya repo kökündeki `vercel.json` otomatik algılar)
3. Environment variable’ları ekleyin:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` (https://your-domain.vercel.app)
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
   - `OPENAI_API_KEY`
   - `FIREBASE_PROJECT_ID` / `FIREBASE_PRIVATE_KEY` / `FIREBASE_CLIENT_EMAIL`
   - `MOBILE_API_KEY`

## Yas Kapisi ve Ingest Kurallari

- Cocuk olusturma ve pair etme akislarinda `birthDate` (YYYY-MM-DD) zorunludur.
- `activity` ve `analyze` endpointleri su durumlarda ingest'i engeller:
- `birthDate` eksikse: `BIRTH_DATE_REQUIRED`
- Profil 18+ ise: `AGE_GATE_BLOCKED`
- Eski kayitlar icin admin panelinde `Eksik Dogum Tarihlerini Listele` ve `Dogum Tarihini Zorunlu Tamamla` adimlari kullanilir.

## Canliya Cikis Icin Senden Gerekenler

1. Altyapi ve domain
- Vercel proje erisimi (veya kullanacagimiz baska hosting bilgisi)
- Uretim domaini (ornek: app.mivvo.com)

2. Uretim gizli anahtarlar (gercek degerler)
- `DATABASE_URL` (Neon production)
- `AUTH_SECRET` (en az 32 karakter)
- `AUTH_URL` (https://...)
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `OPENAI_API_KEY`
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- `MOBILE_API_KEY`
- `ADMIN_PANEL_KEY`

3. Google OAuth ayari
- Authorized JavaScript origin: uretim domaini
- Authorized redirect URI: `https://<domain>/api/auth/callback/google`

4. Firebase ayari
- Android/iOS uygulama package/bundle id bilgileri
- FCM icin service account JSON'dan gerekli alanlar

5. Ilk uretim operasyon onayi
- Prisma schema push (production DB)
- Admin paneli ile dogum tarihi eksik kayitlarin tamamlanmasi
- Test cocugu ile pair + heartbeat + riskli mesaj push smoke test

## Neon DB Migration

Deploy sonrası:
```bash
DATABASE_URL="your-neon-url" npx prisma db push
```
