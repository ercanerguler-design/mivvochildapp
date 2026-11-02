import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Clock, Landmark, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { landingContent } from "@/components/landing/content";
import { PaymentLogos } from "@/components/PaymentLogos";
import { SITE, fullAddress, legalIdentity } from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim",
  description: `Mivvo iletişim bilgileri: ${SITE.phoneDisplay}, ${SITE.email}, ${fullAddress}.`,
  alternates: { canonical: "/iletisim" },
};

export default function ContactPage() {
  const card = "rounded-3xl bg-white p-6 ring-1 ring-gray-200";
  const title = "flex items-center gap-2 text-base font-bold text-gray-900";

  return (
    <>
      <SiteHeader locale="tr" nav={landingContent.tr.nav} />
      <main className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-black text-gray-950">İletişim</h1>
          <p className="mt-2 text-gray-600">Sorularınız, iade talepleriniz ve iş birliği önerileriniz için bize ulaşın.</p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <section className={card}>
              <h2 className={title}><Phone className="h-5 w-5 text-brand-600" /> Telefon</h2>
              <a href={SITE.phoneHref} className="mt-3 block text-lg font-bold text-gray-950 hover:text-brand-700">{SITE.phoneDisplay}</a>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500"><Clock className="h-4 w-4" /> Pazartesi–Cuma, 09:00–18:00</p>
            </section>
            <section className={card}>
              <h2 className={title}><Mail className="h-5 w-5 text-brand-600" /> E-posta</h2>
              <a href={`mailto:${SITE.email}`} className="mt-3 block text-lg font-bold text-gray-950 hover:text-brand-700">{SITE.email}</a>
              <p className="mt-1 text-sm text-gray-500">En geç 1 iş günü içinde yanıt veririz.</p>
            </section>
            <section className={card}>
              <h2 className={title}><MessageCircle className="h-5 w-5 text-brand-600" /> WhatsApp</h2>
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="mt-3 block text-lg font-bold text-gray-950 hover:text-brand-700">Mesaj gönderin</a>
              <p className="mt-1 text-sm text-gray-500">Yazılı destek hattı</p>
            </section>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <section className={card}>
              <h2 className={title}><Building2 className="h-5 w-5 text-brand-600" /> Şirket bilgileri</h2>
              <dl className="mt-3 space-y-1.5 text-sm text-gray-700">
                <div><dt className="inline font-semibold">Unvan: </dt><dd className="inline">{SITE.legal.name}</dd></div>
                <div className="flex gap-1.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><dd>{fullAddress}</dd></div>
                {legalIdentity().map((line) => <div key={line}><dd>{line}</dd></div>)}
              </dl>
            </section>
            <section className={card}>
              <h2 className={title}><Landmark className="h-5 w-5 text-brand-600" /> Ödeme</h2>
              <p className="mt-3 text-sm text-gray-700">
                Aylık ({SITE.monthlyPriceTl} TL) ve yıllık ({SITE.yearlyPriceTl} TL) abonelik, çocuk başına, KDV dahil. Kredi/banka kartıyla PayTR güvencesiyle veya havale/EFT ile ödeyebilirsiniz.
              </p>
              <PaymentLogos className="mt-4" />
              <Link href="/sepet" className="mt-5 inline-flex rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">Satın Al</Link>
            </section>
          </div>

          <section className={`${card} mt-5 text-sm text-gray-700`}>
            <h2 className={title}><Landmark className="h-5 w-5 text-brand-600" /> Havale / EFT bilgileri</h2>
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              <p><span className="font-semibold">Hesap sahibi:</span> {SITE.legal.name}</p>
              <p><span className="font-semibold">Banka:</span> Türkiye Garanti Bankası, Etlik Şubesi</p>
              <p><span className="font-semibold">IBAN:</span> TR48 0006 2000 7740 0006 2930 33</p>
              <p><span className="font-semibold">Hesap No:</span> 774-6293033</p>
            </div>
            <p className="mt-3 text-brand-700">Havale açıklamasına ebeveyn hesabınızın e-posta adresini ve adınızı yazın; aboneliğiniz aynı gün etkinleştirilir.</p>
          </section>
        </div>
      </main>
      <SiteFooter locale="tr" />
    </>
  );
}
