import { db } from "@/lib/db";
import { getLegalDoc } from "@/lib/legal";

/** Proof of consent (KVKK): which document version, when and from which IP. */
let ready = false;

async function ensureTable() {
  if (ready) return;
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_consents (
      id BIGSERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      document TEXT NOT NULL,
      version TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS idx_user_consents_user ON user_consents (user_id, document)");
  ready = true;
}

/** Documents every parent must accept before using the service. */
export const REQUIRED_CONSENTS = ["kullanim-kosullari", "kvkk", "acik-riza"] as const;
export const CHECKOUT_CONSENTS = ["on-bilgilendirme", "mesafeli-satis"] as const;

export async function recordConsents(userId: string, documents: readonly string[], meta: { ip?: string; userAgent?: string }) {
  await ensureTable();
  for (const slug of documents) {
    const doc = getLegalDoc(slug);
    if (!doc) continue;
    await db.$executeRawUnsafe(
      `INSERT INTO user_consents (user_id, document, version, ip, user_agent) VALUES ($1, $2, $3, $4, $5)`,
      userId,
      slug,
      doc.version,
      meta.ip ?? null,
      meta.userAgent?.slice(0, 300) ?? null
    );
  }
}

/** True when the user accepted the current version of every required document. */
export async function hasCurrentConsents(userId: string) {
  await ensureTable();
  const rows = await db.$queryRawUnsafe<{ document: string; version: string }[]>(
    `SELECT DISTINCT document, version FROM user_consents WHERE user_id = $1`,
    userId
  );
  return REQUIRED_CONSENTS.every((slug) => rows.some((r) => r.document === slug && r.version === getLegalDoc(slug)?.version));
}
