import crypto from "crypto";

const PAIRING_TTL_SECONDS = 15 * 60;

function getSigningSecret() {
  return process.env.AUTH_SECRET ?? "mivvo-dev-pairing-secret";
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", getSigningSecret()).update(payload).digest("hex").slice(0, 16);
}

/**
 * Each code is valid for exactly PAIRING_TTL_SECONDS from the moment it is created.
 * (Previously codes expired at the next 15-minute clock boundary, so a code made at
 * 10:14 died at 10:15, and every code in the same window was identical.)
 */
export function createPairingCode(parentId: string) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = nowSeconds + PAIRING_TTL_SECONDS;
  const payload = `${parentId}.${expiresAt}`;
  const signature = signPayload(payload);

  return Buffer.from(`${payload}.${signature}`, "utf8").toString("base64url");
}

export function verifyPairingCode(code: string) {
  try {
    const decoded = Buffer.from(code, "base64url").toString("utf8");
    const [parentId, expiresAtRaw, providedSignature] = decoded.split(".");

    if (!parentId || !expiresAtRaw || !providedSignature) {
      return { valid: false as const, reason: "invalid-format" as const };
    }

    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt)) {
      return { valid: false as const, reason: "invalid-expiry" as const };
    }

    if (expiresAt < Math.floor(Date.now() / 1000)) {
      return { valid: false as const, reason: "expired" as const };
    }

    const expectedSignature = signPayload(`${parentId}.${expiresAt}`);
    if (providedSignature !== expectedSignature) {
      return { valid: false as const, reason: "invalid-signature" as const };
    }

    return {
      valid: true as const,
      parentId,
      expiresAt,
    };
  } catch {
    return { valid: false as const, reason: "invalid-encoding" as const };
  }
}

export function getPairingTtlMinutes() {
  return Math.floor(PAIRING_TTL_SECONDS / 60);
}
