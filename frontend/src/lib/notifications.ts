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

async function pushExpoMessage(params: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      to: params.token,
      title: params.title,
      body: params.body,
      data: params.data ?? {},
      sound: "default",
      priority: "high",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Expo push failed: ${response.status} ${text}`);
  }

  const result = (await response.json()) as { data?: { status?: string; message?: string } };
  if (result?.data?.status === "error") {
    throw new Error(`Expo push error: ${result.data.message}`);
  }
}

/** Generic parent push (device status etc.) with retries. Returns true when delivered. */
export async function sendParentPush(token: string | null | undefined, title: string, body: string, data?: Record<string, string>) {
  if (!token) return false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await pushExpoMessage({ token, title, body, data });
      return true;
    } catch (error) {
      console.error(`[PARENT_PUSH_ATTEMPT_${attempt}_ERROR]`, error);
    }
  }
  return false;
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
      await pushExpoMessage({
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
