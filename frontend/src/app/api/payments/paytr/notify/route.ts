import { NextRequest } from "next/server";
import { isPaytrConfigured, verifyNotification } from "@/lib/paytr";
import { findPaymentByConversationId, settlePayment } from "@/lib/payments";
import { activateParentUnlimitedPlan } from "@/lib/subscription";
import { recordSystemEvent } from "@/lib/system-events";

/**
 * PayTR "Bildirim URL": the only place a subscription is activated.
 * PayTR keeps retrying until it receives the plain text "OK", so every known order answers OK,
 * including repeats. Unsigned or unknown requests get an error and change nothing.
 */
const ok = () => new Response("OK", { headers: { "Content-Type": "text/plain" } });
const fail = (msg: string, status = 400) => new Response(msg, { status, headers: { "Content-Type": "text/plain" } });

export async function POST(req: NextRequest) {
  if (!isPaytrConfigured()) return fail("not configured", 503);
  const form = await req.formData().catch(() => null);
  if (!form) return fail("bad request");

  const n = verifyNotification(form);
  if (!n) {
    await recordSystemEvent("paytr_bad_hash", `merchant_oid=${String(form.get("merchant_oid") ?? "")}`);
    return fail("bad hash");
  }

  const payment = await findPaymentByConversationId(n.merchantOid);
  if (!payment) {
    await recordSystemEvent("paytr_unknown_order", n.merchantOid);
    return ok(); // nothing to do; stop PayTR from retrying
  }
  if (payment.status === "paid" || payment.status === "failed") return ok();

  if (n.status !== "success") {
    await settlePayment(payment.id, "failed", { error: n.failedReason ?? "failed" });
    return ok();
  }

  // payment_amount is what we asked for, in kuruş. A mismatch means the order was tampered with.
  if (Number(n.paymentAmount) !== payment.amount_tl * 100) {
    await settlePayment(payment.id, "review", { providerPaymentId: n.merchantOid, error: `amount_mismatch:${n.paymentAmount}` });
    await recordSystemEvent("paytr_amount_mismatch", `${n.merchantOid} ${n.paymentAmount}`);
    return ok();
  }

  const firstSettle = await settlePayment(payment.id, "paid", { providerPaymentId: n.merchantOid, error: n.testMode ? "test_mode" : undefined });
  if (firstSettle) {
    await activateParentUnlimitedPlan({
      parentId: payment.parent_id,
      days: payment.days,
      amountTl: n.testMode ? 0 : payment.amount_tl,
      actor: "paytr",
      reason: `paytr:${n.merchantOid}${n.testMode ? ":test" : ""}`,
    });
  }
  return ok();
}
