import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { REQUIRED_CONSENTS, recordConsents } from "@/lib/consents";
import { clientIp } from "@/lib/rate-limit";

const schema = z.object({ acceptTerms: z.literal(true), acceptConsent: z.literal(true) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  if (!schema.safeParse(await req.json().catch(() => null)).success) {
    return NextResponse.json({ error: "Devam etmek için iki onayı da vermeniz gerekir." }, { status: 400 });
  }
  await recordConsents(session.user.id, REQUIRED_CONSENTS, { ip: clientIp(req.headers), userAgent: req.headers.get("user-agent") ?? undefined });
  return NextResponse.json({ ok: true });
}
