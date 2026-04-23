import { NextRequest, NextResponse } from "next/server";
import { analyzeText } from "@/lib/nlp";
import { db } from "@/lib/db";
import {
  calculateBillableUnits,
  consumeParentCredits,
  getParentBillingStatus,
} from "@/lib/subscription";
import { z } from "zod";

const analyzeSchema = z.object({
  text: z.string().min(1).max(2000),
  childId: z.string().cuid(),
  sourceApp: z.string().max(50).optional(),
});

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
      include: { parent: true },
    });
    if (!child || !child.isActive) {
      return NextResponse.json(
        { error: "Çocuk profili bulunamadı" },
        { status: 404 }
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
      void sendPushNotification(child.parent, alert.id, result);
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

async function sendPushNotification(
  parent: { fcmToken: string | null },
  alertId: string,
  result: { categories: string[]; riskScore: number }
) {
  if (!parent.fcmToken) return;

  try {
    const fcmUrl = "https://fcm.googleapis.com/v1/projects/" +
      process.env.FIREBASE_PROJECT_ID +
      "/messages:send";

    const accessToken = await getFirebaseAccessToken();

    await fetch(fcmUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: parent.fcmToken,
          notification: {
            title: "⚠️ Mivvo - Riskli İçerik Tespit Edildi",
            body: `Çocuğunuzun mesajında ${result.categories[0]} içeriği tespit edildi`,
          },
          data: {
            alertId,
            riskScore: String(result.riskScore),
            category: result.categories[0],
          },
        },
      }),
    });

    await db.parentNotification.create({
      data: { alertId, channel: "push", delivered: true },
    });
  } catch (err) {
    console.error("[FCM_ERROR]", err);
  }
}

async function getFirebaseAccessToken(): Promise<string> {
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    credentials: {
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token ?? "";
}
