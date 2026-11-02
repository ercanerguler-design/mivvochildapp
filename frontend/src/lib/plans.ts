import { SITE } from "@/lib/site";

/** Subscription plans shown on the site. Both are per child, paid once, never renewed automatically. */
export type PlanId = "monthly" | "yearly";

export const PLANS: Record<PlanId, { id: PlanId; slug: string; name: string; nameEn: string; days: number; priceTl: number }> = {
  monthly: { id: "monthly", slug: "aylik", name: "Aylık Abonelik", nameEn: "Monthly", days: 30, priceTl: SITE.monthlyPriceTl },
  yearly: { id: "yearly", slug: "yillik", name: "Yıllık Abonelik", nameEn: "Yearly", days: 365, priceTl: SITE.yearlyPriceTl },
};

/** How much a yearly plan saves compared with twelve monthly payments. */
export const YEARLY_SAVING_TL = SITE.monthlyPriceTl * 12 - SITE.yearlyPriceTl;

/** Accepts "yillik"/"yearly" from links; anything else is the monthly plan. */
export const planFromParam = (v?: string | null): PlanId => (v === "yillik" || v === "yearly" ? "yearly" : "monthly");

/** Child count a visitor can pick in the cart. */
export const MAX_CART_CHILDREN = 5;
export const countFromParam = (v?: string | null, fallback = 1) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 20) : fallback;
};

export const formatTl = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
