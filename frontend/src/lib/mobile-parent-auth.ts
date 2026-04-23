import jwt from "jsonwebtoken";

const MOBILE_PARENT_TOKEN_TTL = "7d";

type MobileParentPayload = {
  parentId: string;
  userId: string;
  role: "PARENT";
};

function getJwtSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for mobile parent auth");
  }
  return secret;
}

export function signMobileParentToken(payload: MobileParentPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: MOBILE_PARENT_TOKEN_TTL,
  });
}

export function verifyMobileParentToken(token: string): MobileParentPayload {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  });

  if (!decoded || typeof decoded !== "object") {
    throw new Error("Invalid mobile parent token");
  }

  const data = decoded as Partial<MobileParentPayload>;
  if (!data.parentId || !data.userId || data.role !== "PARENT") {
    throw new Error("Invalid mobile parent token payload");
  }

  return {
    parentId: data.parentId,
    userId: data.userId,
    role: "PARENT",
  };
}

export function getBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader) return null;
  const matched = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return matched?.[1]?.trim() || null;
}
