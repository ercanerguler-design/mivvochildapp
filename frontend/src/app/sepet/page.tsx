import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Landmark, Lock, RotateCcw, ShoppingCart, Zap } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { landingContent } from "@/components/landing/content";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cardPaymentsAvailable } from "@/lib/paytr";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sepetim",
  description: `Mivvo Aylık Abonelik: çocuk başına ${SITE.monthlyPriceTl} TL (KDV dahil), 30 gün, otomatik yenileme yok.`,
  alternates: { canonical: "/sepet" },
};

const KDV_RATE = 0.2;
const tl = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Public cart. Pricing is per child: a signed-in parent sees one line per paired child; a visitor
 * sees one subscription with the per-child price.
 */
export default async function CartPage() {
  const session = await auth();
  const price = SITE.monthlyPriceTl;
  const kids = session?.user?.id
    ? await db.childProfile.findMany({ where: { isActive: true, parent: { userId: session.user.id } }, select: { displayName: true }, orderBy: { createdAt: "asc" } })
    : [];
  const qty = Math.max(1, kids.length);
  const total = price * qty;
  const net = Math.round((total / (1 + KDV_RATE)) * 100) / 100;
  const kdv = Math.round((total - net) * 100) / 100;
  const card = cardPaymentsAvailable();
  const checkout = "/dashboard/ayarlar#abonelik";
  const next = session?.user ? checkout : `/giris?next=${encodeURIComponent(checkout)}`;

  return (
    <>
      <SiteHeader locale="tr" nav={landingContent.tr.nav} />
      <main className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h1 className="flex items-center gap-3 font-display text-3xl font-black text-gray-950">
            <ShoppingCart className="h-8 w-8 text-brand-600" /> Sepetim
          </h1>
          <p className="mt-2 text-gray-600">Sepetinizde {qty} abonelik var. Abonelik çocuk başınadır: her çocuk için ayrı 30 günlük koruma.</p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <section aria-label="Ürünler" className="rounded-3xl bg-white p-6 ring-1 ring-gray-200">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
                  <Zap className="h-8 w-8 text-brand-600" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-gray-900">Mivvo Aylık Abonelik</h2>
                    <p className="text-lg font-black text-gray-950">{qty > 1 ? `${qty} × ${tl(price)} TL` : `${tl(price)} TL`}</p>
                  </div>
                  <p className="text-sm text-gray-500">Çocuk başına · 30 gün · Dijital hizmet · Adet: {qty}</p>
                  {kids.length > 0 && <p className="mt-1 text-sm text-gray-700">Çocuklar: {kids.map((k) => k.displayName).join(", ")}</p>}
                  <ul className="mt-4 grid gap-1.5 text-sm text-gray-600 sm:grid-cols-2">
                    <li>✓ 9 risk kategorisinde sürekli koruma</li>
                    <li>✓ Sınırsız uyarı ve anlık bildirim</li>
                    <li>✓ Ebeveyn uygulaması ve web paneli</li>
                    <li>✓ Haftalık ve aylık raporlar</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 grid gap-3 border-t border-gray-100 pt-5 text-sm text-gray-600 sm:grid-cols-3">
                <p className="flex gap-2"><Zap className="h-5 w-5 shrink-0 text-brand-600" /> Teslimat: ödeme onayıyla hesabınızda hemen aktif olur.</p>
                <p className="flex gap-2"><RotateCcw className="h-5 w-5 shrink-0 text-brand-600" /> Otomatik yenileme yok; 14 gün içinde koşulsuz iade.</p>
                <p className="flex gap-2"><Lock className="h-5 w-5 shrink-0 text-brand-600" /> Kart bilgileriniz Mivvo&apos;ya iletilmez.</p>
              </div>
            </section>

            <aside aria-label="Sipariş özeti" className="h-fit rounded-3xl bg-white p-6 ring-1 ring-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Sipariş özeti</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><dt>Ara toplam (KDV hariç)</dt><dd>{tl(net)} TL</dd></div>
                <div className="flex justify-between text-gray-600"><dt>KDV (%20)</dt><dd>{tl(kdv)} TL</dd></div>
                <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-black text-gray-950"><dt>Toplam</dt><dd>{tl(total)} TL</dd></div>
              </dl>

              <Link href={next} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 font-bold text-white hover:bg-brand-700">
                <Lock className="h-4 w-4" /> Ödemeye Geç
              </Link>
              {!session?.user && <p className="mt-2 text-center text-xs text-gray-500">Ödeme için giriş yapmanız gerekir. Hesabınız yoksa <Link href="/kayit" className="font-semibold text-brand-700 underline">ücretsiz kaydolun</Link>.</p>}

              <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
                <p className="font-semibold text-gray-700">Ödeme yöntemleri</p>
                {card && <p className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Kredi / banka kartı (PayTR güvencesiyle, tek çekim)</p>}
                <p className="flex items-center gap-2"><Landmark className="h-4 w-4" /> Havale / EFT</p>
              </div>
              <p className="mt-4 text-xs leading-5 text-gray-500">
                Ödemeden önce <Link href="/on-bilgilendirme" className="underline">Ön Bilgilendirme Formu</Link>, <Link href="/mesafeli-satis" className="underline">Mesafeli Satış Sözleşmesi</Link> ve <Link href="/iptal-iade" className="underline">İptal ve İade Politikası</Link>&apos;nı onaylarsınız.
              </p>
            </aside>
          </div>

          <p className="mt-8 text-xs text-gray-500">
            Satıcı: {SITE.legal.name} · {SITE.address.street}, {SITE.address.city} · {SITE.email} · {SITE.phoneDisplay}
          </p>
        </div>
      </main>
      <SiteFooter locale="tr" />
    </>
  );
}
