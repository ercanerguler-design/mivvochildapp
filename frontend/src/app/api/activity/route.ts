import { NextRequest, NextResponse, after } from "next/server";
import { db } from "@/lib/db";
import { isChildDeviceAuthorized } from "@/lib/device-token";
import { analyzeMessage } from "@/lib/analysis";
import {
  calculateBillableUnits,
  consumeParentCredits,
  getParentBillingStatus,
} from "@/lib/subscription";
import { sendRiskNotificationWithRetry } from "@/lib/notifications";
import { sendWhatsAppFallbackIfEnabled } from "@/lib/whatsapp";
import { z } from "zod";

type Platform = "INSTAGRAM" | "SNAPCHAT" | "TIKTOK" | "WHATSAPP" | "TELEGRAM" | "SMS" | "OTHER";
type RiskCategory = "BULLYING" | "VIOLENCE" | "SEXUAL_RISK" | "THREAT" | "PROFANITY" | "EXTREME_ANGER" | "STRANGER_CONTACT" | "SUBSTANCE" | "DANGEROUS_BEHAVIOR";

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

const CATEGORY_LABELS_TR: Record<RiskCategory, string> = {
  BULLYING: "Zorbalık",
  VIOLENCE: "Şiddet",
  SEXUAL_RISK: "Cinsel risk",
  THREAT: "Tehdit",
  PROFANITY: "Ağır hakaret",
  EXTREME_ANGER: "Kendine zarar / aşırı öfke",
  STRANGER_CONTACT: "Yabancı kişi",
  SUBSTANCE: "Alkol / madde",
  DANGEROUS_BEHAVIOR: "Tehlikeli davranış",
};

// ─── Gece saati kontrolü (23:00 - 06:00) ─────────────────
function isNightTime(date: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone: "Europe/Istanbul",
  }).formatToParts(date);

  const hourPart = parts.find((part) => part.type === "hour")?.value ?? "0";
  const hour = Number(hourPart);
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

function isUnder18(birthDate: Date) {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  return beforeBirthday ? age - 1 < 18 : age < 18;
}

// ─── Main handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {
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

  if (!isChildDeviceAuthorized(req, childId)) {
    return NextResponse.json({ error: "Yetkisiz istek" }, { status: 401 });
  }

  // Çocuk ve ebeveyn profili
  const child = await db.childProfile.findUnique({
    where: { id: childId },
    include: {
      parent: {
        include: {
          user: {
            select: {
              phone: true,
            },
          },
        },
      },
    },
  });

  if (!child || !child.isActive) {
    return NextResponse.json({ error: "Çocuk profili bulunamadı veya pasif" }, { status: 404 });
  }

  if (!child.birthDate) {
    return NextResponse.json(
      {
        error: "Cocuk dogum tarihi eksik. Admin panelinden zorunlu tamamlama yapilmalidir.",
        code: "BIRTH_DATE_REQUIRED",
      },
      { status: 409 }
    );
  }

  if (!isUnder18(child.birthDate)) {
    return NextResponse.json(
      {
        error: "Bu profil 18 yas ve uzeri oldugu icin aktivite ingest kapatildi.",
        code: "AGE_GATE_BLOCKED",
      },
      { status: 403 }
    );
  }

  const sensitivityLevel = child.parent.sensitivityLevel;
  const analyzableCount = activities.filter((item) => Boolean(item.content && item.content.trim().length > 3)).length;
  const billingBefore = await getParentBillingStatus(child.parentId);
  const potentialBillableUnits = calculateBillableUnits(
    {
      trialActive: billingBefore.trial.active,
      unlimitedActive: billingBefore.unlimited?.active ?? false,
    },
    analyzableCount
  );

  if (analyzableCount > 0) {
    if (potentialBillableUnits > billingBefore.credits) {
      return NextResponse.json(
        {
          error: "14 gunluk ucretsiz deneme suresi bitti. Devam etmek icin kredi yukleyin veya aylik abonelige gecin.",
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

      // The child app sends the sender's display name; it is the contact key when no username exists.
      const contactKey = (act.contactUsername ?? act.contactDisplayName ?? "").trim().slice(0, 100);
      if (contactKey) {
        const now = new Date();
        const existing = await db.contact.findUnique({
          where: { childId_platform_username: { childId, platform: platformKey, username: contactKey } },
        });
        // Everyone looks "new" right after installation; only people who first appear after a
        // 3-day warm-up count as newly met, and they stay "new" for 7 days.
        const warmedUp = now.getTime() - child.consentAt.getTime() > 3 * 24 * 60 * 60 * 1000;

        if (!existing) {
          contact = await db.contact.create({
            data: { childId, platform: platformKey, username: contactKey, displayName: act.contactDisplayName ?? null, messageCount: 1 },
          });
          isNewContact = warmedUp;
        } else {
          contact = await db.contact.update({
            where: { id: existing.id },
            data: { messageCount: { increment: 1 }, lastSeenAt: now, displayName: act.contactDisplayName ?? undefined },
          });
          const firstSeenAfterWarmup = existing.firstSeenAt.getTime() - child.consentAt.getTime() > 3 * 24 * 60 * 60 * 1000;
          isNewContact = firstSeenAfterWarmup && now.getTime() - existing.firstSeenAt.getTime() < 7 * 24 * 60 * 60 * 1000;
        }
      }

      // ── NLP analizi ──────────────────────────────────────
      let riskScore = 0;
      let alertCategory: RiskCategory | null = null;
      let explanation = "";
      let detectedText = "";

      if (act.content && act.content.trim().length > 3) {
        const analysis = await analyzeMessage(act.content, {
          platform: act.platform,
          isNewContact,
          isNightTime: nightTime,
          contactUsername: act.contactUsername,
        });

        analyzedCount++;

        riskScore = analysis.riskScore;
        explanation = analysis.explanation;
        detectedText = analysis.detectedText;

        // categories are sorted by severity, so [0] is the most serious one.
        if (analysis.isRisky && analysis.riskScore >= sensitivityLevel && analysis.categories.length > 0) {
          alertCategory = analysis.categories[0] as RiskCategory;
        }
      }
      // Note: metadata alone (night time, new contact) never creates an alert; only message content does.
      // This avoids false alarms for ordinary late-night chats with new friends.

      // Every distinct risky message becomes an alert the parent can see. Only exact repeats
      // (same text, e.g. a notification posted twice) are merged, and the phone push is not
      // repeated for the same category within 10 minutes so parents aren't flooded.
      let duplicateOfRecentAlert = false;
      let pushRecentlySent = false;
      if (alertCategory) {
        const evidence = detectedText || act.content?.slice(0, 500) || "";
        const [sameText, sameCategory] = await Promise.all([
          db.alert.findFirst({ where: { childId, category: alertCategory, originalText: evidence, createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } }, select: { id: true } }),
          db.alert.findFirst({ where: { childId, category: alertCategory, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } }, select: { id: true } }),
        ]);
        duplicateOfRecentAlert = Boolean(sameText);
        pushRecentlySent = Boolean(sameCategory);
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
          // KVKK data minimization: message text is kept only when it triggered an alert.
          messageContent: alertCategory ? detectedText || act.content?.slice(0, 300) || null : null,
          riskScore: riskScore > 0 ? riskScore : null,
          analyzedAt: act.content ? new Date() : null,
        },
      });

      // ── Alert oluştur ────────────────────────────────────
      if (alertCategory && riskScore >= sensitivityLevel && !duplicateOfRecentAlert) {
        const alert = await db.alert.create({
          data: {
            childId,
            category: alertCategory,
            riskScore,
            originalText: detectedText || act.content?.slice(0, 500) || `@${act.contactUsername}`,
            context: `${platformLabel}${contactKey ? ` — ${contactKey}` : ""}${isNewContact ? " · yeni tanışılan kişi" : ""}`,
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

        // Push notification after the response (after() keeps the function alive until it is sent).
        const shouldPush = !pushRecentlySent || riskScore >= 90;
        if (shouldPush) after(() => sendRiskNotificationWithRetry({
          parent: { fcmToken: child.parent.fcmToken },
          alertId: alert.id,
          title: `${riskScore >= 90 ? "🚨" : "⚠️"} ${child.displayName} · ${CATEGORY_LABELS_TR[alertCategory]}`,
          // Message text is never put in the push body: lock screens are visible to others.
          body: `${PLATFORM_LABELS[act.platform] ?? act.platform} üzerinden ${riskScore >= 90 ? "kritik" : riskScore >= 80 ? "yüksek" : "dikkat gerektiren"} bir risk tespit edildi. Detaylar için dokunun.`,
          data: {
            alertId: alert.id,
            riskScore: String(riskScore),
            category: alertCategory,
            childId,
            deepLink: `mivvoparent://alerts/${alert.id}`,
          },
        }));

        const parentPhone = child.parent.user?.phone;
        if (riskScore >= 85 && parentPhone) {
          after(() => sendWhatsAppFallbackIfEnabled({
            toPhone: parentPhone,
            childName: child.displayName,
            category: alertCategory,
            riskScore,
            alertId: alert.id,
          }));
        }

        alertCount++;
      }

      processedCount++;
    } catch (err) {
      console.error("[ACTIVITY_ITEM_ERROR]", err);
      // Tek aktivite hatalandıysa diğerlerine devam et
    }
  }

  const billableUnits = calculateBillableUnits(
    {
      trialActive: billingBefore.trial.active,
      unlimitedActive: billingBefore.unlimited?.active ?? false,
    },
    analyzedCount
  );
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
