import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { REQUIRED_CONSENTS, hasCurrentConsents, recordConsents } from "@/lib/consents";
import { normalizeTrMobile, validName } from "@/lib/phone";
import { clientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  acceptTerms: z.boolean().optional(),
  acceptConsent: z.boolean().optional(),
});

/**
 * Completes an account before the panel opens: name and mobile number (Google sign-ups and older
 * accounts may lack them) and the current legal consents. Only what is missing is required.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { name: true, phone: true } });
  if (!user) return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });

  const data: { name?: string; phone?: string } = {};
  if (!user.name || !validName(user.name) || parsed.data.name !== undefined) {
    const name = (parsed.data.name ?? user.name ?? "").trim().replace(/\s+/g, " ");
    if (!validName(name)) return NextResponse.json({ error: "Adınızı ve soyadınızı yazın." }, { status: 400 });
    data.name = name;
  }
  if (!user.phone || parsed.data.phone !== undefined) {
    const phone = normalizeTrMobile(parsed.data.phone ?? user.phone ?? "");
    if (!phone) return NextResponse.json({ error: "Geçerli bir cep telefonu numarası yazın (05xx xxx xx xx)." }, { status: 400 });
    data.phone = phone;
  }

  const consented = await hasCurrentConsents(session.user.id);
  if (!consented && !(parsed.data.acceptTerms && parsed.data.acceptConsent)) {
    return NextResponse.json({ error: "Devam etmek için iki onayı da vermeniz gerekir." }, { status: 400 });
  }

  if (Object.keys(data).length) await db.user.update({ where: { id: session.user.id }, data });
  if (!consented) await recordConsents(session.user.id, REQUIRED_CONSENTS, { ip: clientIp(req.headers), userAgent: req.headers.get("user-agent") ?? undefined });
  return NextResponse.json({ ok: true });
}
