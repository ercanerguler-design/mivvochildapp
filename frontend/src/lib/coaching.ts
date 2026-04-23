import OpenAI from "openai";
import type { Locale } from "@/lib/i18n";

type CoachingMetrics = {
  totalAlerts: number;
  behaviorScore: number;
  bullyingCount: number;
  aggressiveCount: number;
  nightRiskCount: number;
  topCategory: string | null;
  topPlatform: string | null;
};

export type CoachingInsights = {
  talkSuggestion: string;
  familyCoachSuggestion: string;
  source: "ai" | "rules";
};

let client: OpenAI | null = null;

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function buildRuleBasedInsights(locale: Locale, metrics: CoachingMetrics): CoachingInsights {
  const highRisk = metrics.behaviorScore < 50 || metrics.nightRiskCount >= 3 || metrics.bullyingCount >= 2;
  const mediumRisk = !highRisk && (metrics.behaviorScore < 80 || metrics.aggressiveCount >= 3);

  if (locale === "en") {
    if (highRisk) {
      return {
        talkSuggestion:
          "Today, start with a 10-minute calm check-in. Focus on school and friend interactions first, then ask if there was any moment they felt unsafe.",
        familyCoachSuggestion:
          "Use the 70/30 rule: listen 70%, speak 30%. Avoid judgmental words, validate feelings, and agree on one concrete safety action for tonight.",
        source: "rules",
      };
    }

    if (mediumRisk) {
      return {
        talkSuggestion:
          "Do a short emotional check-in tonight. Ask open questions like 'What was the hardest part of your day?' and 'Did anything online make you uncomfortable?'.",
        familyCoachSuggestion:
          "Keep your tone neutral and supportive. Reflect what they say, then co-create one small communication habit for this week.",
        source: "rules",
      };
    }

    return {
      talkSuggestion:
        "Keep a brief daily check-in. Reinforce safe online boundaries and praise healthy communication choices they made today.",
      familyCoachSuggestion:
        "Maintain consistency with non-judgmental listening and open-ended questions to preserve trust.",
      source: "rules",
    };
  }

  if (highRisk) {
    return {
      talkSuggestion:
        "Bugün 10 dakikalık sakin bir duygusal check-in yap. Önce okul ve arkadaş ilişkilerini sor, sonra çevrimiçinde kendini güvensiz hissettiği bir an olup olmadığını konuş.",
      familyCoachSuggestion:
        "70/30 kuralını uygula: %70 dinle, %30 konuş. Yargılayıcı kelimelerden kaçın, duygusunu doğrula ve bu gece için tek bir somut güvenlik adımı belirleyin.",
      source: "rules",
    };
  }

  if (mediumRisk) {
    return {
      talkSuggestion:
        "Bu akşam kısa bir duygusal yoklama yap. 'Bugünün en zor anı neydi?' ve 'Online ortamda seni rahatsız eden bir şey oldu mu?' gibi açık uçlu sorular sor.",
      familyCoachSuggestion:
        "Nötr ve destekleyici bir ton kullan. Söylediklerini geri yansıt, sonra bu hafta için tek bir küçük iletişim alışkanlığı belirleyin.",
      source: "rules",
    };
  }

  return {
    talkSuggestion:
      "Kısa günlük check-in ritmini koru. Güvenli çevrimiçi sınırları pekiştir ve bugün yaptığı sağlıklı iletişim davranışlarını özellikle takdir et.",
    familyCoachSuggestion:
      "Yargılamadan dinleme ve açık uçlu soru düzenini sürdürerek güven ilişkisini güçlendirmeye devam edin.",
    source: "rules",
  };
}

export async function generateCoachingInsights(
  locale: Locale,
  metrics: CoachingMetrics
): Promise<CoachingInsights> {
  const fallback = buildRuleBasedInsights(locale, metrics);
  const openai = getClient();
  if (!openai) return fallback;

  const language = locale === "en" ? "English" : "Turkish";
  const prompt = `You are a child-safety family communication coach.\nGenerate two short, concrete recommendations based on the risk metrics.\nLanguage: ${language}.\n\nMetrics:\n- totalAlerts: ${metrics.totalAlerts}\n- behaviorScore: ${metrics.behaviorScore}\n- bullyingCount: ${metrics.bullyingCount}\n- aggressiveCount: ${metrics.aggressiveCount}\n- nightRiskCount: ${metrics.nightRiskCount}\n- topCategory: ${metrics.topCategory ?? "none"}\n- topPlatform: ${metrics.topPlatform ?? "none"}\n\nOutput JSON only:\n{\n  "talkSuggestion": "...",\n  "familyCoachSuggestion": "..."\n}\n\nRules:\n- 1-2 sentences per field\n- practical and non-judgmental\n- no diagnosis\n- no mention of internal metrics values in text`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 220,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate concise parental coaching suggestions grounded in provided metrics.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as {
      talkSuggestion?: string;
      familyCoachSuggestion?: string;
    };

    if (!parsed.talkSuggestion || !parsed.familyCoachSuggestion) return fallback;

    return {
      talkSuggestion: parsed.talkSuggestion,
      familyCoachSuggestion: parsed.familyCoachSuggestion,
      source: "ai",
    };
  } catch {
    return fallback;
  }
}
