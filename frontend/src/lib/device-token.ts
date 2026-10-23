import crypto from "crypto";
import type { NextRequest } from "next/server";

/**
 * Per-child device tokens, issued at pairing. Stateless: the token is an HMAC of the
 * child id, so no schema change is needed and deleting/deactivating the child revokes it
 * (routes already reject inactive children).
 *
 * The shared MOBILE_API_KEY embedded in older app builds is still accepted until
 * MOBILE_LEGACY_KEY_DISABLED=true is set, so existing installs keep working during rollout.
 */

function secret() {
  const s = process.env.DEVICE_TOKEN_SECRET ?? process.env.AUTH_SECRET;
  if (!s) throw new Error("DEVICE_TOKEN_SECRET or AUTH_SECRET must be set");
  return s;
}

function sign(childId: string) {
  return crypto.createHmac("sha256", secret()).update(`mivvo-device:v1:${childId}`).digest("base64url");
}

export function createDeviceToken(childId: string) {
  return `v1.${childId}.${sign(childId)}`;
}

export function verifyDeviceToken(token: string, childId: string) {
  const [version, tokenChildId, signature] = token.split(".");
  if (version !== "v1" || tokenChildId !== childId || !signature) return false;
  const expected = Buffer.from(sign(childId));
  const provided = Buffer.from(signature);
  return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
}

function readDeviceToken(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return req.headers.get("x-device-token")?.trim() ?? "";
}

function legacyKeyMatches(req: NextRequest) {
  if (process.env.MOBILE_LEGACY_KEY_DISABLED === "true") return false;
  const expectedKey = process.env.MOBILE_API_KEY;
  if (!expectedKey) return true; // preserves previous behaviour for local development
  const provided = req.headers.get("x-api-key") ?? req.headers.get("x-mobile-api-key") ?? "";
  return provided === expectedKey;
}

/** True when the request may act for `childId`: a valid device token, or the legacy shared key. */
export function isChildDeviceAuthorized(req: NextRequest, childId: string) {
  const token = readDeviceToken(req);
  if (token) return verifyDeviceToken(token, childId);
  return legacyKeyMatches(req);
}
