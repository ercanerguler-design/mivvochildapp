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

## Neon DB Migration

Deploy sonrası:
```bash
DATABASE_URL="your-neon-url" npx prisma db push
```
