import crypto from "crypto";
import type { NextRequest } from "next/server";
import { clientIp, peekRateLimit, rateLimit } from "@/lib/rate-limit";

const MAX_FAILURES = 20; // per IP per 15 minutes

/** Admin API guard: ADMIN_PANEL_KEY via `x-admin-key` or Bearer, compared in constant time; IPs are locked out after repeated failures. */
export async function isAdminRequest(req: NextRequest) {
  const expected = process.env.ADMIN_PANEL_KEY?.trim();
  if (!expected) return false;

  const failKey = `admin-fail:${clientIp(req.headers)}`;
  if ((await peekRateLimit(failKey, 900)) >= MAX_FAILURES) return false;

  const provided = (req.headers.get("x-admin-key") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "").trim();
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) await rateLimit(failKey, MAX_FAILURES, 900);
  return ok;
}
