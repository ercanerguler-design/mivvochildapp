import { NextRequest, NextResponse } from "next/server";
import { retrieveCheckout } from "@/lib/iyzico";
import { findPaymentByToken, settlePayment } from "@/lib/payments";
import { activateParentUnlimitedPlan } from "@/lib/subscription";
import { SITE_URL } from "@/lib/site";

/**
 * iyzico redirects the buyer here with a form-posted `token`. We never trust the browser:
 * the result is fetched again from iyzico and checked against our own pending payment.
 */
function back(result: "basarili" | "basarisiz" | "inceleme") {
  // 303 turns the POST into a GET on the settings page.
  return NextResponse.redirect(`${SITE_URL}/dashboard/ayarlar?odeme=${result}`, 303);
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const token = String(form?.get("token") ?? "");
  if (!token) return back("basarisiz");

  const payment = await findPaymentByToken(token);
  if (!payment) return back("basarisiz");
  if (payment.status === "paid") return back("basarili");

  const result = await retrieveCheckout(token, payment.conversation_id).catch(() => null);
  if (!result) return back("basarisiz"); // network error: payment stays pending and can be re-checked

  const paid =
    result.status === "success" &&
    result.paymentStatus === "SUCCESS" &&
    result.conversationId === payment.conversation_id &&
    result.basketId === payment.id &&
    Number(result.paidPrice) === payment.amount_tl;

  if (!paid) {
    await settlePayment(payment.id, "failed", { error: result.errorMessage ?? result.paymentStatus ?? "not_paid" });
    return back("basarisiz");
  }

  if (result.fraudStatus === 0) {
    await settlePayment(payment.id, "review", { providerPaymentId: result.paymentId });
    return back("inceleme");
  }
  if (result.fraudStatus === -1) {
    await settlePayment(payment.id, "failed", { providerPaymentId: result.paymentId, error: "fraud_rejected" });
    return back("basarisiz");
  }

  const firstSettle = await settlePayment(payment.id, "paid", { providerPaymentId: result.paymentId });
  if (firstSettle) {
    await activateParentUnlimitedPlan({
      parentId: payment.parent_id,
      days: payment.days,
      amountTl: payment.amount_tl,
      actor: "iyzico",
      reason: `iyzico:${result.paymentId}`,
    });
  }
  return back("basarili");
}

export function GET() {
  return NextResponse.redirect(`${SITE_URL}/dashboard/ayarlar`, 303);
}
