import { GoogleAuth } from "google-auth-library";
import { db } from "@/lib/db";

type ParentNotificationTarget = {
  fcmToken: string | null;
};

type RiskNotificationInput = {
  parent: ParentNotificationTarget;
  alertId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

async function getFirebaseAccessToken(): Promise<string | null> {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    return null;
  }

  const auth = new GoogleAuth({
    credentials: {
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token ?? null;
}

async function pushFcmMessage(params: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  const accessToken = await getFirebaseAccessToken();
  if (!accessToken || !process.env.FIREBASE_PROJECT_ID) {
    throw new Error("Firebase credentials are missing");
  }

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: params.token,
          notification: {
            title: params.title,
            body: params.body,
          },
          data: params.data,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FCM send failed: ${response.status} ${text}`);
  }
}

export async function sendRiskNotificationWithRetry(input: RiskNotificationInput) {
  const attempts = 3;

  if (!input.parent.fcmToken) {
    await db.parentNotification.upsert({
      where: { alertId: input.alertId },
      update: { delivered: false, channel: "push" },
      create: { alertId: input.alertId, delivered: false, channel: "push" },
    });
    return;
  }

  let delivered = false;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await pushFcmMessage({
        token: input.parent.fcmToken,
        title: input.title,
        body: input.body,
        data: input.data,
      });
      delivered = true;
      break;
    } catch (error) {
      console.error(`[PUSH_ATTEMPT_${attempt}_ERROR]`, error);
    }
  }

  await db.parentNotification.upsert({
    where: { alertId: input.alertId },
    update: { delivered, channel: "push" },
    create: { alertId: input.alertId, delivered, channel: "push" },
  });
}
