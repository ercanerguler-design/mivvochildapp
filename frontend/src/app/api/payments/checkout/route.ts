import { NextRequest, NextResponse } from "next/server";
import { TOO_MANY, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cardPaymentsAvailable, getIframeToken, newMerchantOid } from "@/lib/paytr";
import { attachToken, createPendingPayment, settlePayment } from "@/lib/payments";
import { MONTHLY_PLAN_TL, PAID_UNLIMITED_DAYS, YEARLY_PLAN_DAYS, YEARLY_PLAN_TL } from "@/lib/subscription";
import { SITE_URL } from "@/lib/site";
import { CHECKOUT_CONSENTS, recordConsents } from "@/lib/consents";

const schema = z.object({
  fullName: z.string().trim().min(3).max(60),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{10,20}$/),
  city: z.string().trim().min(2).max(50),
  address: z.string().trim().min(5).max(200),
  acceptSale: z.literal(true),
  // Pricing is per child: the parent picks which children to pay for.
  // The parent picks which paired children to pay for, plus children whose phone is not paired yet
  // (their period starts on pairing). Child names never go to the payment provider.
  childIds: z.array(z.string().cuid()).max(20).default([]),
  newChildren: z.number().int().min(0).max(10).default(0),
  plan: z.enum(["monthly", "yearly"]).default("monthly"),
});

// Prices come from the server, never from the browser.
const PLAN_TERMS = {
  monthly: { name: "Aylık Abonelik", days: PAID_UNLIMITED_DAYS, priceTl: MONTHLY_PLAN_TL },
  yearly: { name: "Yıllık Abonelik", days: YEARLY_PLAN_DAYS, priceTl: YEARLY_PLAN_TL },
} as const;

/** "0532 123 45 67" -> "05321234567" (PayTR wants a plain number, max 20 chars). */
function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90")) return `0${digits.slice(2)}`;
  if (digits.startsWith("0")) return digits;
  return `0${digits}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  if (!(await rateLimit(`checkout:${session.user.id}`, 10, 3600)).ok) return NextResponse.json(TOO_MANY, { status: 429 });
  if (!cardPaymentsAvailable()) return NextResponse.json({ error: "Kartla ödeme kısa süre içinde açılacak. Şimdilik aşağıdaki havale/EFT bilgileriyle ödeme yapabilirsiniz." }, { status: 503 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const sale = parsed.error.issues.some((i) => i.path[0] === "acceptSale");
    return NextResponse.json({ error: sale ? "Ön bilgilendirme formunu ve mesafeli satış sözleşmesini onaylamanız gerekir." : "Lütfen fatura bilgilerini eksiksiz girin." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, parentProfile: { select: { id: true } } },
  });
  if (!user?.parentProfile || !user.email) return NextResponse.json({ error: "Ebeveyn profili bulunamadı." }, { status: 404 });

  const children = await db.childProfile.findMany({
    where: { id: { in: [...new Set(parsed.data.childIds)] }, parentId: user.parentProfile.id, isActive: true },
    select: { id: true },
  });
  const seats = parsed.data.newChildren;
  const units = children.length + seats;
  if (units === 0) return NextResponse.json({ error: "Ödeme yapılacak çocuğu seçin." }, { status: 400 });

  const terms = PLAN_TERMS[parsed.data.plan];
  const days = terms.days;
  const amountTl = terms.priceTl * units;
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  if (!ip) return NextResponse.json({ error: "Ödeme başlatılamadı. Lütfen tekrar deneyin." }, { status: 400 });

  await recordConsents(user.id, CHECKOUT_CONSENTS, { ip, userAgent: req.headers.get("user-agent") ?? undefined });

  const merchantOid = newMerchantOid();
  const payment = await createPendingPayment({ parentId: user.parentProfile.id, amountTl, days, conversationId: merchantOid, childIds: children.map((c) => c.id), extraSeats: seats, provider: "paytr" });
  const phone = normalizePhone(parsed.data.phone);

  const result = await getIframeToken({
    merchantOid,
    email: user.email,
    // Basket lines carry no child names: "Mivvo Yıllık Abonelik (365 gün) - Çocuk 1".
    items: Array.from({ length: units }, (_, i) => ({ name: `Mivvo ${terms.name} (${days} gün) - Çocuk ${i + 1}`, amountTl: terms.priceTl })),
    userIp: ip,
    userName: parsed.data.fullName,
    userAddress: `${parsed.data.address} ${parsed.data.city}`.slice(0, 400),
    userPhone: phone,
    okUrl: `${SITE_URL}/odeme/sonuc?d=islemde`,
    failUrl: `${SITE_URL}/odeme/sonuc?d=basarisiz`,
  });

  if (!result.ok) {
    console.error("[paytr] get-token failed", result.reason);
    await settlePayment(payment.id, "failed", { error: result.reason });
    return NextResponse.json({ error: "Ödeme başlatılamadı. Lütfen biraz sonra tekrar deneyin." }, { status: 502 });
  }

  await attachToken(payment.id, result.token);
  await db.user.update({ where: { id: user.id }, data: { phone } }).catch(() => undefined);

  return NextResponse.json({ paymentPageUrl: `/dashboard/odeme?t=${encodeURIComponent(result.token)}` });
}
