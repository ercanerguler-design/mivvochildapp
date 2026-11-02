export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mivvo.org").replace(/\/$/, "");

export const SITE = {
  name: "Mivvo",
  url: SITE_URL,
  company: "SCE Grup",
  email: "sce@scegrup.com",
  whatsapp: "905433929230",
  // Main customer line shown everywhere; WhatsApp stays a separate channel.
  phoneDisplay: "0850 888 1 889",
  phoneHref: "tel:+908508881889",
  whatsappDisplay: "+90 543 392 92 30",
  // Legal identity shown in contracts. MERSİS / tax info appear only when set.
  legal: {
    name: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "SCE Innovation Ltd. Şti.",
    mersis: process.env.NEXT_PUBLIC_LEGAL_MERSIS || "0757107183200001",
    taxOffice: process.env.NEXT_PUBLIC_LEGAL_TAX || "Yıldırım Beyazıt V.D. / 7571071832",
  },
  address: { street: "Çetin Emeç Bulvarı No:25/3", district: "Çankaya", city: "Ankara", country: "TR" },
  parentPlayUrl:
    process.env.NEXT_PUBLIC_PARENT_PLAY_URL ??
    "https://play.google.com/store/apps/details?id=org.mivvo.parent",
  childDownloadUrl: process.env.NEXT_PUBLIC_CHILD_APK_URL ?? "/api/download/child",
  // Single source of truth for the price (server code reads it via subscription.ts).
  monthlyPriceTl: Number(process.env.NEXT_PUBLIC_MONTHLY_PLAN_TL ?? "399"),
  // Yearly plan: 365 days per child, about two months free compared with paying monthly.
  yearlyPriceTl: Number(process.env.NEXT_PUBLIC_YEARLY_PLAN_TL ?? "3990"),
  trialDays: Number(process.env.NEXT_PUBLIC_FREE_TRIAL_DAYS ?? "3"),
} as const;

/** "Çetin Emeç Bulvarı No:25/3, Çankaya / Ankara" */
export const fullAddress = `${SITE.address.street}, ${SITE.address.district} / ${SITE.address.city}`;

/** Company identity lines; tax and MERSİS numbers appear once their env values are set. */
export const legalIdentity = () =>
  [
    SITE.legal.taxOffice ? `Vergi Dairesi / No: ${SITE.legal.taxOffice}` : "",
    SITE.legal.mersis ? `MERSİS No: ${SITE.legal.mersis}` : "",
  ].filter(Boolean);

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
