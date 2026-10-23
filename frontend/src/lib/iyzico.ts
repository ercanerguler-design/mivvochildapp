import crypto from "crypto";

/**
 * Minimal iyzico client (Checkout Form) using IYZWSv2 HMAC-SHA256 auth:
 *   signature = hex(HMAC_SHA256(secretKey, randomKey + uriPath + body))
 *   Authorization: IYZWSv2 base64("apiKey:<k>&randomKey:<r>&signature:<s>")
 * Docs: https://docs.iyzico.com/en/getting-started/preliminaries/authentication/hmacsha256-auth
 */

function config() {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = (process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com").replace(/\/$/, "");
  if (!apiKey || !secretKey) throw new Error("IYZICO_API_KEY / IYZICO_SECRET_KEY tanımlı değil");
  return { apiKey, secretKey, baseUrl };
}

export function isIyzicoConfigured() {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

export function buildAuthorization(apiKey: string, secretKey: string, randomKey: string, uriPath: string, body: string) {
  const signature = crypto.createHmac("sha256", secretKey).update(randomKey + uriPath + body).digest("hex");
  const authString = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`;
  return `IYZWSv2 ${Buffer.from(authString, "utf8").toString("base64")}`;
}

async function iyzicoPost<T>(uriPath: string, payload: object): Promise<T> {
  const { apiKey, secretKey, baseUrl } = config();
  const body = JSON.stringify(payload);
  const randomKey = `${Date.now()}${crypto.randomInt(100000, 999999)}`;

  const res = await fetch(`${baseUrl}${uriPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: buildAuthorization(apiKey, secretKey, randomKey, uriPath, body),
      "x-iyzi-rnd": randomKey,
    },
    body,
    cache: "no-store",
  });
  return (await res.json()) as T;
}

type IyzicoBase = { status: "success" | "failure"; errorCode?: string; errorMessage?: string; conversationId?: string };

export type CheckoutInitResult = IyzicoBase & { token?: string; paymentPageUrl?: string; tokenExpireTime?: number };

export type CheckoutRetrieveResult = IyzicoBase & {
  paymentStatus?: string; // "SUCCESS" when paid
  fraudStatus?: number; // 1 approved, 0 review, -1 rejected
  paidPrice?: number;
  price?: number;
  currency?: string;
  basketId?: string;
  paymentId?: string;
  token?: string;
};

export type Buyer = {
  id: string;
  name: string;
  surname: string;
  email: string;
  gsmNumber: string;
  city: string;
  address: string;
  ip: string;
};

/** Formats a TRY amount the way iyzico expects ("299.0"). */
const money = (n: number) => (Number.isInteger(n) ? `${n}.0` : n.toFixed(2));

export function initializeCheckout(params: {
  conversationId: string;
  basketId: string;
  amountTl: number;
  itemName: string;
  callbackUrl: string;
  buyer: Buyer;
  locale?: "tr" | "en";
}) {
  const { buyer } = params;
  const address = { contactName: `${buyer.name} ${buyer.surname}`, city: buyer.city, country: "Turkey", address: buyer.address };
  return iyzicoPost<CheckoutInitResult>("/payment/iyzipos/checkoutform/initialize/auth/ecom", {
    locale: params.locale ?? "tr",
    conversationId: params.conversationId,
    price: money(params.amountTl),
    paidPrice: money(params.amountTl),
    currency: "TRY",
    basketId: params.basketId,
    paymentGroup: "SUBSCRIPTION",
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: buyer.id,
      name: buyer.name,
      surname: buyer.surname,
      // iyzico requires a national id field; "11111111111" is its accepted placeholder when none is collected.
      identityNumber: process.env.IYZICO_DEFAULT_IDENTITY_NUMBER ?? "11111111111",
      email: buyer.email,
      gsmNumber: buyer.gsmNumber,
      registrationAddress: buyer.address,
      city: buyer.city,
      country: "Turkey",
      ip: buyer.ip,
    },
    shippingAddress: address,
    billingAddress: address,
    basketItems: [{ id: params.basketId, name: params.itemName, category1: "Abonelik", itemType: "VIRTUAL", price: money(params.amountTl) }],
  });
}

export function retrieveCheckout(token: string, conversationId?: string) {
  return iyzicoPost<CheckoutRetrieveResult>("/payment/iyzipos/checkoutform/auth/ecom/detail", {
    locale: "tr",
    token,
    ...(conversationId ? { conversationId } : {}),
  });
}
