import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordSystemEvent } from "@/lib/system-events";

/**
 * Daily data-retention job (Vercel Cron, see vercel.json). Enforces the periods published in
 * the privacy policy (src/lib/legal.ts → RETENTION): alerts 12 months, activity and contacts 90 days.
 */
const DAY = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const [activities, alerts, contacts, rateLimits] = await Promise.all([
    db.socialActivity.deleteMany({ where: { createdAt: { lt: new Date(now - 90 * DAY) } } }),
    db.alert.deleteMany({ where: { createdAt: { lt: new Date(now - 365 * DAY) } } }),
    db.contact.deleteMany({ where: { lastSeenAt: { lt: new Date(now - 90 * DAY) } } }),
    db.$executeRawUnsafe(`DELETE FROM rate_limits WHERE window_start < NOW() - interval '1 day'`).catch(() => 0),
  ]);

  const summary = { activities: activities.count, alerts: alerts.count, contacts: contacts.count, rateLimits };
  await recordSystemEvent("retention_run", JSON.stringify(summary));
  return NextResponse.json({ ok: true, deleted: summary });
}
