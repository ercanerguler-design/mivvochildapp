/**
 * High-precision rule-based safety net. Used only when the AI analysis is unavailable
 * (outage, quota, timeout) so the most serious risks are still caught.
 * Rules favour precision: each pattern needs specific, unambiguous wording.
 */
import type { AnalysisResult, RiskCategory } from "./nlp";

/** Lowercase, Turkish-aware, accents folded, repeated letters squashed ("çoook" -> "cok"). */
export function normalizeTr(text: string) {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[ıİ]/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/(\p{L})\1{2,}/gu, "$1")
    .replace(/\s+/g, " ");
}

type Rule = { category: RiskCategory; score: number; why: string; all: RegExp[] };

const RULES: Rule[] = [
  {
    category: "EXTREME_ANGER",
    score: 92,
    why: "Kendine zarar verme veya yaşamak istememe ifadesi içeriyor olabilir.",
    all: [/(intihar|kendimi (oldur|asa|kes)|kendime zarar|yasamak istemiyorum|olmek istiyorum|bilek\w* kes|hayatima son)/],
  },
  {
    category: "THREAT",
    score: 85,
    why: "Çocuğa yönelik fiziksel zarar tehdidi içeriyor olabilir.",
    all: [/(kafani (kiraram|kiricam|kirarim)|seni (oldururum|gebertirim|gebertcem|olduricem|bicaklarim|vururum)|yakalarsam)/, /(seni|sana|kafani|bak|gorursun|okulda|yarin)/],
  },
  {
    category: "VIOLENCE",
    score: 86,
    why: "Silah veya bıçakla planlanan bir kavga/saldırı içeriyor olabilir.",
    all: [/(bicak|silah|tabanca|sopa|muşta|musta)/, /(getir(cem|icem|ecegim|iyorum)|getirin|dovucez|dovecegiz|kavga|saldir)/],
  },
  {
    category: "STRANGER_CONTACT",
    score: 82,
    why: "Ev adresi veya buluşma için kişisel bilgi talebi içeriyor olabilir.",
    all: [/(adres|evin ner|nerde oturuyorsun|nerede oturuyorsun|hangi okul)/, /(gelip alayim|gelirim|bulusalim|alayim seni|almaya gelirim|atar misin|gonder)/],
  },
  {
    category: "STRANGER_CONTACT",
    score: 78,
    why: "Konuşmayı gizli tutmak için başka bir uygulamaya geçme talebi içeriyor olabilir.",
    all: [/(telegram|snap|whatsapp|baska uygulama|gizli hesap)/, /(gec|konusalim|yazarim|ekle)/, /(kimse gormesin|kimse bilmesin|kimseye soyleme|gizli)/],
  },
  {
    category: "SEXUAL_RISK",
    score: 93,
    why: "Çıplak fotoğraf isteği veya bununla ilgili tehdit içeriyor olabilir.",
    all: [/(nudes?|ciplak (foto|fotograf|resim)|send me (pics|photos))/],
  },
  {
    category: "THREAT",
    score: 90,
    why: "Çocuğun adresine, okuluna veya konumuna dayalı bir tehdit içeriyor olabilir.",
    all: [/(adresini|evini|okulunu|nerede oturdugunu|nerde oturdugunu) (biliyorum|ogrendim|buldum)/],
  },
  {
    category: "THREAT",
    score: 86,
    why: "Okul çıkışında veya belirli bir yerde bekleme şeklinde tehdit içeriyor olabilir.",
    all: [/(okul cikisi|cikista|kapida|evinin onunde)/, /(bekli(yor|yo)?(um|cam|ycem|yecegim|yor olcam|yor olacagim)|gelicem|gelecegim|geliyorum)/, /(seni|sana|ya da|yoksa|gorursun|pisman)/],
  },
  {
    category: "SEXUAL_RISK",
    score: 95,
    why: "Fotoğraf veya video yaymakla tehdit (şantaj) içeriyor olabilir.",
    all: [/(fotograf|foto|resim|video|goruntu|pics?|nudes?)/, /(herkese|ailene|annene|babana|okula|internete|sosyal medyaya) .{0,20}(atarim|gonderirim|yollarim|yayarim|paylasirim|share)/],
  },
  {
    category: "SEXUAL_RISK",
    score: 92,
    why: "Gizlilik talebiyle birlikte fotoğraf, video veya kamera isteği içeriyor olabilir.",
    all: [
      /(fotograf|foto|resim|video|kamerani|kamera ac|cıplak|ciplak|nudes?|pics?)/,
      /(kimseye soyleme|annene soyleme|ailene soyleme|aramizda kalsin|sadece ikimiz|sadece bana ozel|bana ozel|kimse gormesin)/,
    ],
  },
  {
    category: "STRANGER_CONTACT",
    score: 80,
    why: "Ebeveynden gizlenmesi istenen bir konuşma veya hediye/para teklifi içeriyor olabilir.",
    all: [
      /(annene soyleme|ailene soyleme|babana soyleme|kimseye soyleme|aramizda kalsin|sadece ikimiz bilelim)/,
      /(hediye|para|kontor|elmas|jeton|bulusalim|bulusmak|gel(ip)? alayim|adres|kac yasindasin|telegrama gec|baska uygulama)/,
    ],
  },
];

const BANTER = /(😂|🤣|😅|😆|\bxd+\b|\bsjsj|\bksks|\bjsjs|\bhaha|\bkanka\b.*😂)/u;

export function analyzeWithRules(text: string): AnalysisResult {
  const t = normalizeTr(text);
  const matched = RULES.filter((r) => r.all.every((re) => re.test(t)));
  if (matched.length === 0) {
    return { isRisky: false, riskScore: 0, confidence: 0.5, categories: [], explanation: "Güvenli içerik", detectedText: "" };
  }
  // Laughter lowers confidence for threats/violence (often banter), never for self-harm or sexual risk.
  const top = matched.sort((a, b) => b.score - a.score)[0];
  const banter = BANTER.test(text) && !["EXTREME_ANGER", "SEXUAL_RISK"].includes(top.category);
  if (banter) {
    return { isRisky: false, riskScore: 45, confidence: 0.5, categories: [], explanation: "Güvenli içerik", detectedText: "" };
  }
  const categories = [...new Set(matched.map((m) => m.category))];
  return {
    isRisky: true,
    riskScore: top.score,
    confidence: 0.8,
    categories,
    explanation: `${top.why} (Otomatik kural tespiti.)`,
    detectedText: text.trim().slice(0, 200),
  };
}
