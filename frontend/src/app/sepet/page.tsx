import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { landingContent } from "@/components/landing/content";
import { CartPicker } from "@/components/CartPicker";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { countFromParam, planFromParam } from "@/lib/plans";
import { SITE, fullAddress } from "@/lib/site";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";

export const metadata: Metadata = {
  title: "Sepetim",
  description: `Mivvo abonelik: çocuk başına aylık ${SITE.monthlyPriceTl} TL veya yıllık ${SITE.yearlyPriceTl} TL (KDV dahil), otomatik yenileme yok.`,
  alternates: { canonical: "/sepet" },
};

/**
 * Public cart. Pricing is per child: the visitor picks a plan (monthly/yearly) and a child count;
 * a signed-in parent starts with one line per paired child. ?plan=yillik&adet=2 preselects.
 */
export default async function CartPage({ searchParams }: { searchParams: Promise<{ plan?: string; adet?: string }> }) {
  const sp = await searchParams;
  const locale = await getLocaleFromServerCookie();
  const en = locale === "en";
  const session = await auth();
  const pairedCount = session?.user?.id ? await db.childProfile.count({ where: { isActive: true, parent: { userId: session.user.id } } }) : 0;

  return (
    <>
      <SiteHeader locale={locale} nav={landingContent[locale].nav} />
      <main className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h1 className="flex items-center gap-3 font-display text-3xl font-black text-gray-950">
            <ShoppingCart className="h-8 w-8 text-brand-600" /> {en ? "My Cart" : "Sepetim"}
          </h1>
          <p className="mt-2 text-gray-600">{en ? "Subscriptions are per child: separate protection for each child. Choose monthly or yearly." : "Abonelik çocuk başınadır: her çocuk için ayrı koruma. Aylık veya yıllık planı seçin."}</p>

          <CartPicker
            initialPlan={planFromParam(sp.plan)}
            initialCount={countFromParam(sp.adet, Math.max(1, pairedCount))}
            signedIn={Boolean(session?.user)}
            pairedCount={pairedCount}
            locale={locale}
          />

          <p className="mt-8 text-xs text-gray-500">
            {en ? "Seller" : "Satıcı"}: {[SITE.legal.name, fullAddress, SITE.email, SITE.phoneDisplay].join(" · ")}
          </p>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
