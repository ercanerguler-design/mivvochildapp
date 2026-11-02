import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { landingContent } from "@/components/landing/content";
import { CartPicker } from "@/components/CartPicker";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { countFromParam, planFromParam } from "@/lib/plans";
import { SITE, fullAddress, legalIdentity } from "@/lib/site";

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
  const session = await auth();
  const kids = session?.user?.id
    ? await db.childProfile.findMany({ where: { isActive: true, parent: { userId: session.user.id } }, select: { displayName: true }, orderBy: { createdAt: "asc" } })
    : [];

  return (
    <>
      <SiteHeader locale="tr" nav={landingContent.tr.nav} />
      <main className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h1 className="flex items-center gap-3 font-display text-3xl font-black text-gray-950">
            <ShoppingCart className="h-8 w-8 text-brand-600" /> Sepetim
          </h1>
          <p className="mt-2 text-gray-600">Abonelik çocuk başınadır: her çocuk için ayrı koruma. Aylık veya yıllık planı seçin.</p>

          <CartPicker
            initialPlan={planFromParam(sp.plan)}
            initialCount={countFromParam(sp.adet, Math.max(1, kids.length))}
            signedIn={Boolean(session?.user)}
            kids={kids.map((k) => k.displayName)}
          />

          <p className="mt-8 text-xs text-gray-500">
            Satıcı: {[SITE.legal.name, fullAddress, ...legalIdentity(), SITE.email, SITE.phoneDisplay].join(" · ")}
          </p>
        </div>
      </main>
      <SiteFooter locale="tr" />
    </>
  );
}
