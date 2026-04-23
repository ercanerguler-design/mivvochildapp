import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type RiskCategory =
  | "BULLYING"
  | "VIOLENCE"
  | "SEXUAL_RISK"
  | "THREAT"
  | "PROFANITY"
  | "EXTREME_ANGER"
  | "STRANGER_CONTACT";

export interface AnalysisResult {
  isRisky: boolean;
  riskScore: number; // 0-100
  categories: RiskCategory[];
  explanation: string;
  detectedText: string;
}

export interface AnalyzeContext {
  platform?: string;       // INSTAGRAM, WHATSAPP, vb.
  isNewContact?: boolean;  // İlk kez iletişim kurulan biri
  isNightTime?: boolean;   // 23:00-06:00 arası
  contactUsername?: string;
}

const SYSTEM_PROMPT = `Sen Türkçe içerik moderasyon uzmanısın. Görevin çocuklar arası ve çocuklara yönelik sosyal medya mesajlaşmalarında tehlikeli içerikleri tespit etmek.

Aşağıdaki kategorileri analiz et:
- BULLYING: Zorbalık, aşağılama, dışlama
- VIOLENCE: Fiziksel şiddet tehdidi, saldırganlık
- SEXUAL_RISK: Müstehcen içerik, cinsel baskı (sextortion dahil)
- THREAT: Tehdit, korkutma
- PROFANITY: Ağır küfür ve hakaret
- EXTREME_ANGER: Kontrol dışı öfke, kendine veya başkasına zarar verme sinyalleri
- STRANGER_CONTACT: Bilinmeyen/yeni tanışılan kişiden gelen yoğun, gece saati veya yakın içerikli iletişim

Bağlam bilgileri varsa (platform, yeni tanışma, gece saati) risk skorunu buna göre artır:
- Gece saati (23:00-06:00) mesajı: +10-20 puan
- Yeni tanışma (ilk iletişim): +15-25 puan  
- Instagram/Snapchat DM yabancıdan: +10 puan

Platform-spesifik riskler:
- INSTAGRAM/SNAPCHAT: Fotoğraf/video isteği, bilinmeyen takipçi
- TIKTOK: Canlı yayın davetleri, hediye alma baskısı
- WHATSAPP: Grup eklemeleri, konum paylaşım baskısı

Yanıtını MUTLAKA şu JSON formatında ver:
{
  "isRisky": boolean,
  "riskScore": 0-100,
  "categories": ["KATEGORI1", ...],
  "explanation": "Türkçe kısa açıklama (ebeveyne gösterilecek)",
  "detectedText": "Riskli kısım (maksimum 200 karakter)"
}

KVKK uyumu: detectedText alanına SADECE riskli kısmı yaz, tüm mesajı değil.
Eğer içerik güvenliyse: { "isRisky": false, "riskScore": 0, "categories": [], "explanation": "Güvenli içerik", "detectedText": "" }`;

export async function analyzeText(
  text: string,
  ctx?: AnalyzeContext
): Promise<AnalysisResult> {
  if (!text || text.trim().length < 3) {
    return {
      isRisky: false,
      riskScore: 0,
      categories: [],
      explanation: "Analiz edilecek içerik yok",
      detectedText: "",
    };
  }

  const contextLines: string[] = [];
  if (ctx?.platform) contextLines.push(`Platform: ${ctx.platform}`);
  if (ctx?.isNewContact) contextLines.push("⚠️ Yeni tanışma — ilk kez iletişim kurulan kişi");
  if (ctx?.isNightTime) contextLines.push("⚠️ Gece saati mesajlaşması (23:00-06:00)");
  if (ctx?.contactUsername) contextLines.push(`Gönderen: @${ctx.contactUsername}`);

  const userMessage =
    contextLines.length > 0
      ? `Bağlam:\n${contextLines.join("\n")}\n\nMesaj: "${text.slice(0, 1000)}"`
      : `Şu metni analiz et: "${text.slice(0, 1000)}"`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 400,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("OpenAI boş yanıt döndü");

  const result = JSON.parse(content) as AnalysisResult;
  return result;
}
