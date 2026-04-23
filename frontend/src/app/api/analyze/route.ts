import { NextRequest, NextResponse } from "next/server";
import { analyzeText } from "@/lib/nlp";
import { db } from "@/lib/db";
import {
  calculateBillableUnits,
  consumeParentCredits,
  getParentBillingStatus,
} from "@/lib/subscription";
import { sendRiskNotificationWithRetry } from "@/lib/notifications";
import { sendWhatsAppFallbackIfEnabled } from "@/lib/whatsapp";
import { z } from "zod";

const analyzeSchema = z.object({
  text: z.string().min(1).max(2000),
  childId: z.string().cuid(),
  sourceApp: z.string().max(50).optional(),
});

function isUnder18(birthDate: Date) {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  return beforeBirthday ? age - 1 < 18 : age < 18;
}

export async function POST(req: NextRequest) {
  try {
    // Yalnızca kimliği doğrulanmış istekler (çocuk uygulamasından API key ile gelecek)
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.MOBILE_API_KEY) {
      return NextResponse.json({ error: "Yetkisiz istek" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz istek verisi" },
        { status: 400 }
      );
    }

    const { text, childId, sourceApp } = parsed.data;

    // Çocuk profilini doğrula
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
      return NextResponse.json(
        { error: "Çocuk profili bulunamadı" },
        { status: 404 }
      );
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
          error: "Bu profil 18 yas ve uzeri oldugu icin analiz kapatildi.",
          code: "AGE_GATE_BLOCKED",
        },
        { status: 403 }
      );
    }

    const billingBefore = await getParentBillingStatus(child.parentId);
    const billableUnits = calculateBillableUnits(billingBefore.trial.used, 1);

    if (billableUnits > billingBefore.credits) {
      return NextResponse.json(
        {
          error: "Ucretsiz deneme limiti doldu. Devam etmek icin kredi yukleyin veya aylik abonelige gecin.",
          code: "TRIAL_LIMIT_EXCEEDED",
          billing: {
            ...billingBefore,
            requiredCredits: billableUnits,
          },
        },
        { status: 402 }
      );
    }

    // NLP analizi
    const result = await analyzeText(text);

    await db.socialActivity.create({
      data: {
        childId: child.id,
        platform: "OTHER",
        activityType: "MANUAL_TEST",
        messageContent: text.slice(0, 300),
        riskScore: result.riskScore,
        analyzedAt: new Date(),
      },
    });

    if (billableUnits > 0) {
      await consumeParentCredits({
        parentId: child.parentId,
        amount: billableUnits,
        reason: "Analyze API usage",
      });
    }

    // Risk skoru eşiği aşıyorsa alert oluştur
    if (
      result.isRisky &&
      result.riskScore >= child.parent.sensitivityLevel &&
      result.categories.length > 0
    ) {
      const alert = await db.alert.create({
        data: {
          childId: child.id,
          category: result.categories[0],
          riskScore: result.riskScore,
          originalText: result.detectedText, // KVKK: sadece riskli kısım
          sourceApp: sourceApp ?? null,
          aiExplanation: result.explanation,
        },
      });

      // Push notification job (Firebase FCM) - async, beklemiyoruz
      void sendRiskNotificationWithRetry({
        parent: { fcmToken: child.parent.fcmToken },
        alertId: alert.id,
        title: "⚠️ Mivvo - Riskli İçerik Tespit Edildi",
        body: `Çocuğunuzun mesajında ${result.categories[0]} içeriği tespit edildi`,
        data: {
          alertId: alert.id,
          riskScore: String(result.riskScore),
          category: result.categories[0],
          deepLink: `mivvoparent://alerts/${alert.id}`,
        },
      });

      if (result.riskScore >= 85 && child.parent.user?.phone) {
        void sendWhatsAppFallbackIfEnabled({
          toPhone: child.parent.user.phone,
          childName: child.displayName,
          category: result.categories[0],
          riskScore: result.riskScore,
          alertId: alert.id,
        });
      }
    }

    const billingAfter = await getParentBillingStatus(child.parentId);

    return NextResponse.json({
      analyzed: true,
      isRisky: result.isRisky,
      riskScore: result.riskScore,
      billing: billingAfter,
    });
  } catch (error) {
    console.error("[ANALYZE_ERROR]", error);
    return NextResponse.json(
      { error: "Analiz sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
