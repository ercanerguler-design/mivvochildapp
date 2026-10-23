import type { NextRequest } from "next/server";
import { getBearerToken, verifyMobileParentToken } from "@/lib/mobile-parent-auth";

/** Returns the mobile parent's token payload, or null when the request isn't authenticated. */
export function requireMobileParent(req: NextRequest) {
  const token = getBearerToken(req.headers.get("authorization"));
  if (!token) return null;
  try {
    return verifyMobileParentToken(token);
  } catch {
    return null;
  }
}
