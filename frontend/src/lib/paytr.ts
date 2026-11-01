import crypto from "crypto";

/**
 * PayTR iFrame API client.
 * 1) get-token: the server asks PayTR for a one-time token, signed with HMAC-SHA256.
 * 2) The buyer pays inside the PayTR iframe (https://www.paytr.com/odeme/guvenli/<token>).
 * 3) PayTR posts the result to our "Bildirim URL" (/api/payments/paytr/notify); only that
 *    signed server-to-server call can activate a subscription. The browser redirect does not.
 * Docs: https://dev.paytr.com/iframe-api
 */

const GET_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
export const PAYTR_IFRAME_URL = "https://www.paytr.com/odeme/guvenli/";

function config() {
  const merchantId = process.env.PAYTR_MERCHANT_ID?.trim();
  const merchantKey = process.env.PAYTR_MERCHANT_KEY?.trim();
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT?.trim();
  if (!merchantId || !merchantKey || !merchantSalt) throw new Error("PAYTR_MERCHANT_ID / PAYTR_MERCHANT_KEY / PAYTR_MERCHANT_SALT tanımlı değil");
  // Test mode stays on until PAYTR_TEST_MODE=0 is set explicitly, so a fresh setup never charges real cards by accident.
  const testMode = process.env.PAYTR_TEST_MODE?.trim() === "0" ? "0" : "1";
  return { merchantId, merchantKey, merchantSalt, testMode };
}

export function isPaytrConfigured() {
  return Boolean(process.env.PAYTR_MERCHANT_ID?.trim() && process.env.PAYTR_MERCHANT_KEY?.trim() && process.env.PAYTR_MERCHANT_SALT?.trim());
}

/** Card payments are on as soon as the PayTR keys exist; CARD_PAYMENTS_DISABLED=true switches them off again. */
export function cardPaymentsAvailable() {
  return isPaytrConfigured() && process.env.CARD_PAYMENTS_DISABLED !== "true";
}

const hmac = (key: string, data: string) => crypto.createHmac("sha256", key).update(data).digest("base64");

/** PayTR only accepts letters and digits in merchant_oid. */
export function newMerchantOid() {
  return `MV${crypto.randomUUID().replace(/-/g, "")}`;
}

export type GetTokenResult = { ok: true; token: string } | { ok: false; reason: string };

export async function getIframeToken(params: {
  merchantOid: string;
  email: string;
  /** One basket line per item; the payment amount is their total. */
  items: { name: string; amountTl: number }[];
  userIp: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  okUrl: string;
  failUrl: string;
}): Promise<GetTokenResult> {
  const { merchantId, merchantKey, merchantSalt, testMode } = config();
  const totalTl = params.items.reduce((sum, i) => sum + i.amountTl, 0);
  const paymentAmount = String(Math.round(totalTl * 100)); // kuruş
  const basket = Buffer.from(JSON.stringify(params.items.map((i) => [i.name.slice(0, 100), i.amountTl.toFixed(2), 1]))).toString("base64");
  const noInstallment = "1";
  const maxInstallment = "0";
  const currency = "TL";

  const hashStr = merchantId + params.userIp + params.merchantOid + params.email + paymentAmount + basket + noInstallment + maxInstallment + currency + testMode;
  const body = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: params.userIp,
    merchant_oid: params.merchantOid,
    email: params.email,
    payment_amount: paymentAmount,
    paytr_token: hmac(merchantKey, hashStr + merchantSalt),
    user_basket: basket,
    debug_on: testMode,
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: params.userName,
    user_address: params.userAddress,
    user_phone: params.userPhone,
    merchant_ok_url: params.okUrl,
    merchant_fail_url: params.failUrl,
    timeout_limit: "30",
    currency,
    test_mode: testMode,
    lang: "tr",
  });

  try {
    const res = await fetch(GET_TOKEN_URL, { method: "POST", body, cache: "no-store" });
    const json = (await res.json().catch(() => null)) as { status?: string; token?: string; reason?: string } | null;
    if (json?.status === "success" && json.token) return { ok: true, token: json.token };
    return { ok: false, reason: json?.reason ?? `PayTR HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

export type PaytrNotification = {
  merchantOid: string;
  status: "success" | "failed";
  totalAmount: string;
  paymentAmount: string;
  failedReason?: string;
  testMode: boolean;
};

/** Parses PayTR's callback and checks its signature. Returns null when the hash does not match. */
export function verifyNotification(form: FormData): PaytrNotification | null {
  const { merchantKey, merchantSalt } = config();
  const merchantOid = String(form.get("merchant_oid") ?? "");
  const status = String(form.get("status") ?? "");
  const totalAmount = String(form.get("total_amount") ?? "");
  const hash = String(form.get("hash") ?? "");
  if (!merchantOid || !hash || (status !== "success" && status !== "failed")) return null;

  const expected = hmac(merchantKey, merchantOid + merchantSalt + status + totalAmount);
  const a = Buffer.from(expected);
  const b = Buffer.from(hash);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  return {
    merchantOid,
    status,
    totalAmount,
    paymentAmount: String(form.get("payment_amount") ?? ""),
    failedReason: [form.get("failed_reason_code"), form.get("failed_reason_msg")].filter(Boolean).join(" ") || undefined,
    testMode: String(form.get("test_mode") ?? "0") === "1",
  };
}
