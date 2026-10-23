import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { REQUIRED_CONSENTS, recordConsents } from "@/lib/consents";
import { TOO_MANY, clientIp, rateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  acceptTerms: z.literal(true),
  acceptConsent: z.literal(true),
});

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    if (!(await rateLimit(`register:${ip}`, 5, 3600)).ok) return NextResponse.json(TOO_MANY, { status: 429 });

    const parsed = registerSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      const missingConsent = parsed.error.issues.some((i) => i.path[0] === "acceptTerms" || i.path[0] === "acceptConsent");
      return NextResponse.json(
        { error: missingConsent ? "Devam etmek için sözleşmeleri ve açık rıza metnini onaylamanız gerekir." : "Geçersiz kayıt verisi." },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await db.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanımda." }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 12),
        role: "PARENT",
        parentProfile: { create: { notifyEmail: true, notifyPush: true, sensitivityLevel: 70 } },
      },
    });

    await recordConsents(user.id, REQUIRED_CONSENTS, { ip, userAgent: req.headers.get("user-agent") ?? undefined });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Kayıt sırasında hata oluştu." }, { status: 500 });
  }
}
