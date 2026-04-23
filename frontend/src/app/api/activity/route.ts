import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeText } from "@/lib/nlp";
import {
  calculateBillableUnits,
  consumeParentCredits,
  getParentBillingStatus,
} from "@/lib/subscription";
import { z } from "zod";

type Platform = "INSTAGRAM" | "SNAPCHAT" | "TIKTOK" | "WHATSAPP" | "TELEGRAM" | "SMS" | "OTHER";
type RiskCategory = "BULLYING" | "VIOLENCE" | "SEXUAL_RISK" | "THREAT" | "PROFANITY" | "EXTREME_ANGER" | "STRANGER_CONTACT";

// ─── Platform görünen adları ───────────────────────────────
const PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  SNAPCHAT: "Snapchat",
  TIKTOK: "TikTok",
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
  SMS: "SMS",
  OTHER: "Diğer",
};

// ─── Gece saati kontrolü (23:00 - 06:00) ─────────────────
function isNightTime(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 23 || hour < 6;
}

// ─── Request schema ────────────────────────────────────────
const activityItemSchema = z.object({
  platform: z.enum(["INSTAGRAM", "SNAPCHAT", "TIKTOK", "WHATSAPP", "TELEGRAM", "SMS", "OTHER"]),
  type: z.string().max(50).default("MESSAGE"),
  content: z.string().max(2000).optional(),
  contactUsername: z.string().max(200).optional(),
  contactDisplayName: z.string().max(200).optional(),
  timestamp: z.string().datetime().optional(),
});

const bodySchema = z.object({
  childId: z.string().cuid(),
  activities: z.array(activityItemSchema).min(1).max(50),
});

// ─── Push notification (FCM) ───────────────────────────────
async function sendPushNotification(
  fcmToken: string | null,
  childName: string,
  platform: string,
  category: string,
  riskScore: number
) {
  if (!fcmToken || !process.env.FIREBASE_PROJECT_ID) return;
  try {
    const { GoogleAuth } = await import("google-auth-library");
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
    const client = await auth.getClient();
    const tokenRes = await client.getAccessToken();
    const accessToken = tokenRes.token;
    if (!accessToken) return;

    const categoryLabel: Record<string, string> = {
      BULLYING: "Zorbalık",
      VIOLENCE: "Şiddet",
      SEXUAL_RISK: "Cinsel Risk",
      THREAT: "Tehdit",
      PROFANITY: "Küfür",
      EXTREME_ANGER: "Aşırı Öfke",
      STRANGER_CONTACT: "Yabancı Kişi",
    };

    await fetch(
      `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: {
              title: `⚠️ Mivvo — ${PLATFORM_LABELS[platform] ?? platform}`,
              body: `${childName}: ${categoryLabel[category] ?? category} tespit edildi (Risk: %${riskScore})`,
            },
          },
        }),
      }
    );
  } catch (err) {
    console.error("[FCM_ERROR]", err);
  }
}

// ─── Main handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  // API key auth
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.MOBILE_API_KEY) {
    return NextResponse.json({ error: "Yetkisiz istek" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek verisi", details: parsed.error.flatten() }, { status: 400 });
  }

  const { childId, activities } = parsed.data;

  // Çocuk ve ebeveyn profili
  const child = await db.childProfile.findUnique({
    where: { id: childId },
    include: { parent: true },
  });

  if (!child || !child.isActive) {
    return NextResponse.json({ error: "Çocuk profili bulunamadı veya pasif" }, { status: 404 });
  }

  const sensitivityLevel = child.parent.sensitivityLevel;
  const analyzableCount = activities.filter((item) => Boolean(item.content && item.content.trim().length > 3)).length;
  const billingBefore = await getParentBillingStatus(child.parentId);
  const potentialBillableUnits = calculateBillableUnits(billingBefore.trial.used, analyzableCount);

  if (analyzableCount > 0) {
    if (potentialBillableUnits > billingBefore.credits) {
      return NextResponse.json(
        {
          error: "Ucretsiz deneme limiti doldu. Devam etmek icin kredi yukleyin veya aylik abonelige gecin.",
          code: "TRIAL_LIMIT_EXCEEDED",
          billing: {
            ...billingBefore,
            requiredCredits: potentialBillableUnits,
          },
        },
        { status: 402 }
      );
    }
  }

  let processedCount = 0;
  let alertCount = 0;
  let analyzedCount = 0;

  for (const act of activities) {
    try {
      const timestamp = act.timestamp ? new Date(act.timestamp) : new Date();
      const nightTime = isNightTime(timestamp);
      const platformKey = act.platform as Platform;
      const platformLabel = PLATFORM_LABELS[act.platform];

      // ── Contact upsert ───────────────────────────────────
      let contact = null;
      let isNewContact = false;

      if (act.contactUsername) {
        const now = new Date();
        const existing = await db.contact.findUnique({
          where: {
            childId_platform_username: {
              childId,
              platform: platformKey,
              username: act.contactUsername,
            },
          },
        });

        if (!existing) {
          contact = await db.contact.create({
            data: {
              childId,
              platform: platformKey,
              username: act.contactUsername,
              displayName: act.contactDisplayName ?? null,
              messageCount: 1,
            },
          });
          isNewContact = true;
        } else {
          contact = await db.contact.update({
            where: { id: existing.id },
            data: {
              messageCount: { increment: 1 },
              lastSeenAt: now,
              displayName: act.contactDisplayName ?? undefined,
            },
          });
          // 24 saatin altında ilk görüşme → yeni sayılır
          isNewContact =
            now.getTime() - existing.firstSeenAt.getTime() < 24 * 60 * 60 * 1000;
        }
      }

      // ── NLP analizi ──────────────────────────────────────
      let riskScore = 0;
      let alertCategory: RiskCategory | null = null;
      let explanation = "";
      let detectedText = "";

      if (act.content && act.content.trim().length > 3) {
        const analysis = await analyzeText(act.content, {
          platform: act.platform,
          isNewContact,
          isNightTime: nightTime,
          contactUsername: act.contactUsername,
        });

        analyzedCount++;

        riskScore = analysis.riskScore;
        explanation = analysis.explanation;
        detectedText = analysis.detectedText;

        if (analysis.isRisky && analysis.riskScore >= sensitivityLevel && analysis.categories.length > 0) {
          alertCategory = analysis.categories[0] as RiskCategory;
        }
      }

      // ── Davranışsal örüntü tespiti ───────────────────────
      if (!alertCategory) {
        if (isNewContact && nightTime) {
          alertCategory = "STRANGER_CONTACT";
          riskScore = Math.max(riskScore, 65);
          explanation =
            explanation ||
            `${platformLabel} üzerinden gece saatinde bilinmeyen kişiyle mesajlaşma tespit edildi.`;
          detectedText = detectedText || `@${act.contactUsername ?? "bilinmeyen"} — gece mesajı`;
        } else if (isNewContact && contact && contact.messageCount > 20) {
          alertCategory = "STRANGER_CONTACT";
          riskScore = Math.max(riskScore, 60);
          explanation =
            explanation ||
            `Yeni tanışılan kişiyle yoğun mesajlaşma: ${contact.messageCount} mesaj.`;
          detectedText = detectedText || `@${act.contactUsername}`;
        }
      }

      // ── SocialActivity kaydı ─────────────────────────────
      const savedActivity = await db.socialActivity.create({
        data: {
          childId,
          contactId: contact?.id ?? null,
          platform: platformKey,
          activityType: act.type,
          contactUsername: act.contactUsername ?? null,
          isNewContact,
          isNightTime: nightTime,
          messageContent: detectedText || (act.content ? act.content.slice(0, 300) : null),
          riskScore: riskScore > 0 ? riskScore : null,
          analyzedAt: act.content ? new Date() : null,
        },
      });

      // ── Alert oluştur ────────────────────────────────────
      if (alertCategory && riskScore >= sensitivityLevel) {
        const alert = await db.alert.create({
          data: {
            childId,
            category: alertCategory,
            riskScore,
            originalText: detectedText || act.content?.slice(0, 500) || `@${act.contactUsername}`,
            context: `${platformLabel}${act.contactUsername ? ` — @${act.contactUsername}` : ""}`,
            sourceApp: platformLabel,
            platform: platformKey,
            isNightTime: nightTime,
            aiExplanation: explanation,
          },
        });

        // SocialActivity'yi alert ile bağla
        await db.socialActivity.update({
          where: { id: savedActivity.id },
          data: { alertId: alert.id },
        });

        // Push notification (non-blocking)
        void sendPushNotification(
          child.parent.fcmToken,
          child.displayName,
          act.platform,
          alertCategory,
          riskScore
        );

        alertCount++;
      }

      processedCount++;
    } catch (err) {
      console.error("[ACTIVITY_ITEM_ERROR]", err);
      // Tek aktivite hatalandıysa diğerlerine devam et
    }
  }

  const billableUnits = calculateBillableUnits(billingBefore.trial.used, analyzedCount);
  if (billableUnits > 0) {
    await consumeParentCredits({
      parentId: child.parentId,
      amount: billableUnits,
      reason: "Activity API usage",
    });
  }

  const billingAfter = await getParentBillingStatus(child.parentId);

  return NextResponse.json({
    processed: processedCount,
    alerts: alertCount,
    billing: billingAfter,
  });
}
