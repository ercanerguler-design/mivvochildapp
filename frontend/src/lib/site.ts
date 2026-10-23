export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mivvo.org").replace(/\/$/, "");

export const SITE = {
  name: "Mivvo",
  url: SITE_URL,
  company: "SCE Grup",
  email: "sce@scegrup.com",
  whatsapp: "905433929230",
  phoneDisplay: "+90 543 392 92 30",
  // Legal identity shown in contracts. MERSİS / tax info appear only when set.
  legal: {
    name: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "SCE Innovation Ltd. Şti.",
    mersis: process.env.NEXT_PUBLIC_LEGAL_MERSIS ?? "",
    taxOffice: process.env.NEXT_PUBLIC_LEGAL_TAX ?? "",
  },
  address: { street: "Çetin Emeç Bulvarı No:25/3", city: "Ankara", country: "TR" },
  parentPlayUrl:
    process.env.NEXT_PUBLIC_PARENT_PLAY_URL ??
    "https://play.google.com/store/apps/details?id=org.mivvo.parent",
  childDownloadUrl: process.env.NEXT_PUBLIC_CHILD_APK_URL ?? "/api/download/child",
  monthlyPriceTl: Number(process.env.NEXT_PUBLIC_MONTHLY_PLAN_TL ?? "299"),
  trialDays: Number(process.env.NEXT_PUBLIC_FREE_TRIAL_DAYS ?? "14"),
} as const;

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
