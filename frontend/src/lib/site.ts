export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mivvo.org").replace(/\/$/, "");

export const SITE = {
  name: "Mivvo",
  url: SITE_URL,
  company: "SCE Grup",
  email: "sce@scegrup.com",
  whatsapp: "905433929230",
  address: { street: "Çetin Emeç Bulvarı No:25/3", city: "Ankara", country: "TR" },
  parentPlayUrl:
    process.env.NEXT_PUBLIC_PARENT_PLAY_URL ??
    "https://play.google.com/store/apps/details?id=org.mivvo.parent",
  childDownloadUrl: process.env.NEXT_PUBLIC_CHILD_APK_URL ?? "/api/download/child",
  monthlyPriceTl: Number(process.env.NEXT_PUBLIC_MONTHLY_PLAN_TL ?? "299"),
  trialDays: Number(process.env.NEXT_PUBLIC_FREE_TRIAL_DAYS ?? "14"),
} as const;

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
