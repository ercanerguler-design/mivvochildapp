import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { initializeCheckout, isIyzicoConfigured } from "@/lib/iyzico";
import { attachToken, createPendingPayment, settlePayment } from "@/lib/payments";
import { MONTHLY_PLAN_TL, PAID_UNLIMITED_DAYS } from "@/lib/subscription";
import { SITE_URL } from "@/lib/site";

const schema = z.object({
  fullName: z.string().trim().min(3).max(100),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{10,20}$/),
  city: z.string().trim().min(2).max(50),
  address: z.string().trim().min(5).max(250),
});

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+9${digits}`;
  return `+90${digits}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  if (!isIyzicoConfigured()) return NextResponse.json({ error: "Kartla ödeme şu an kullanılamıyor." }, { status: 503 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Lütfen fatura bilgilerini eksiksiz girin." }, { status: 400 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, createdAt: true, parentProfile: { select: { id: true } } },
  });
  if (!user?.parentProfile || !user.email) return NextResponse.json({ error: "Ebeveyn profili bulunamadı." }, { status: 404 });

  const [name, ...rest] = parsed.data.fullName.split(/\s+/);
  const surname = rest.join(" ") || name;
  const amountTl = MONTHLY_PLAN_TL;
  const days = PAID_UNLIMITED_DAYS;

  const payment = await createPendingPayment({ parentId: user.parentProfile.id, amountTl, days });
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "85.34.78.112";

  const result = await initializeCheckout({
    conversationId: payment.conversationId,
    basketId: payment.id,
    amountTl,
    itemName: `Mivvo Aylık Abonelik (${days} gün)`,
    callbackUrl: `${SITE_URL}/api/payments/callback`,
    buyer: {
      id: user.parentProfile.id,
      name,
      surname,
      email: user.email,
      gsmNumber: normalizePhone(parsed.data.phone),
      city: parsed.data.city,
      address: parsed.data.address,
      ip,
    },
  }).catch((e: Error) => ({ status: "failure" as const, errorMessage: e.message, token: undefined, paymentPageUrl: undefined }));

  if (result.status !== "success" || !result.token || !result.paymentPageUrl) {
    await settlePayment(payment.id, "failed", { error: result.errorMessage ?? "init_failed" });
    return NextResponse.json({ error: result.errorMessage ?? "Ödeme başlatılamadı." }, { status: 502 });
  }

  await attachToken(payment.id, result.token);
  await db.user.update({ where: { id: user.id }, data: { phone: normalizePhone(parsed.data.phone) } }).catch(() => undefined);

  return NextResponse.json({ paymentPageUrl: result.paymentPageUrl });
}
