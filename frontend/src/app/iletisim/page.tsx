import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Clock, Landmark, Mail, MapPin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { landingContent } from "@/components/landing/content";
import { PaymentLogos } from "@/components/PaymentLogos";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { SITE, fullAddress, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim",
  description: `Mivvo iletişim bilgileri: ${SITE.phoneDisplay}, WhatsApp ${SITE.whatsappDisplay}, ${SITE.email}, ${fullAddress}.`,
  alternates: { canonical: "/iletisim" },
};

export default async function ContactPage() {
  const locale = await getLocaleFromServerCookie();
  const en = locale === "en";
  const t = (tr: string, eng: string) => (en ? eng : tr);
  const TL = en ? "TRY" : "TL";
  const card = "rounded-3xl bg-white p-6 ring-1 ring-gray-200";
  const title = "flex items-center gap-2 text-base font-bold text-gray-900";

  return (
    <>
      <SiteHeader locale={locale} nav={landingContent[locale].nav} />
      <main className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-black text-gray-950">{t("İletişim", "Contact")}</h1>
          <p className="mt-2 text-gray-600">{t("Sorularınız, iade talepleriniz ve iş birliği önerileriniz için bize ulaşın.", "Reach us for questions, refund requests and partnership proposals.")}</p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <section className={`${card} ring-2 ring-[#25D366]/40`}>
              <h2 className={title}><WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> {t("WhatsApp Destek Hattı", "WhatsApp Support")}</h2>
              <a href={whatsappUrl(locale)} target="_blank" rel="noopener noreferrer" className="mt-3 block text-lg font-bold text-gray-950 hover:text-emerald-700">{SITE.whatsappDisplay}</a>
              <a href={whatsappUrl(locale)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:bg-[#1ebe5b]">
                <WhatsAppIcon className="h-4 w-4" /> {t("WhatsApp'tan yazın", "Chat on WhatsApp")}
              </a>
            </section>
            <section className={card}>
              <h2 className={title}><Phone className="h-5 w-5 text-brand-600" /> {t("Telefon", "Phone")}</h2>
              <a href={SITE.phoneHref} className="mt-3 block text-lg font-bold text-gray-950 hover:text-brand-700">{SITE.phoneDisplay}</a>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500"><Clock className="h-4 w-4" /> {t("Pazartesi–Cuma, 09:00–18:00", "Monday–Friday, 09:00–18:00")}</p>
            </section>
            <section className={card}>
              <h2 className={title}><Mail className="h-5 w-5 text-brand-600" /> {t("E-posta", "Email")}</h2>
              <a href={`mailto:${SITE.email}`} className="mt-3 block text-lg font-bold text-gray-950 hover:text-brand-700">{SITE.email}</a>
              <p className="mt-1 text-sm text-gray-500">{t("En geç 1 iş günü içinde yanıt veririz.", "We reply within one business day.")}</p>
            </section>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <section className={card}>
              <h2 className={title}><Building2 className="h-5 w-5 text-brand-600" /> {t("Şirket bilgileri", "Company")}</h2>
              <p className="mt-3 text-sm font-semibold text-gray-800">{SITE.legal.name}</p>
              <p className="mt-1.5 flex gap-1.5 text-sm text-gray-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />{fullAddress}</p>
            </section>
            <section className={card}>
              <h2 className={title}><Landmark className="h-5 w-5 text-brand-600" /> {t("Ödeme", "Payment")}</h2>
              <p className="mt-3 text-sm text-gray-700">
                {t(
                  `Aylık (${SITE.monthlyPriceTl} TL) ve yıllık (${SITE.yearlyPriceTl.toLocaleString("tr-TR")} TL) abonelik, çocuk başına, KDV dahil. Kredi/banka kartıyla PayTR güvencesiyle veya havale/EFT ile ödeyebilirsiniz.`,
                  `Monthly (${SITE.monthlyPriceTl} ${TL}) or yearly (${SITE.yearlyPriceTl.toLocaleString("tr-TR")} ${TL}) subscription per child, VAT included. Pay by card, secured by PayTR, or by bank transfer.`
                )}
              </p>
              <PaymentLogos className="mt-4" />
              <Link href="/sepet" className="mt-5 inline-flex rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">{t("Satın Al", "Buy")}</Link>
            </section>
          </div>

          <section className={`${card} mt-5 text-sm text-gray-700`}>
            <h2 className={title}><Landmark className="h-5 w-5 text-brand-600" /> {t("Havale / EFT bilgileri", "Bank transfer details")}</h2>
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              <p><span className="font-semibold">{t("Hesap sahibi", "Account holder")}:</span> {SITE.legal.name}</p>
              <p><span className="font-semibold">{t("Banka", "Bank")}:</span> Türkiye Garanti Bankası, {t("Etlik Şubesi", "Etlik Branch")}</p>
              <p><span className="font-semibold">IBAN:</span> TR48 0006 2000 7740 0006 2930 33</p>
              <p><span className="font-semibold">{t("Hesap No", "Account No")}:</span> 774-6293033</p>
            </div>
            <p className="mt-3 text-brand-700">
              {t(
                "Havale açıklamasına ebeveyn hesabınızın e-posta adresini ve adınızı yazın; aboneliğiniz aynı gün etkinleştirilir.",
                "Write your parent account email and your name in the transfer description; your subscription is activated the same day."
              )}
            </p>
          </section>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
