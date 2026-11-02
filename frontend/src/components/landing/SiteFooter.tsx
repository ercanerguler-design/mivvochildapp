import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import { MivvoLogo } from "@/components/common/MivvoLogo";
import { PaymentLogos } from "@/components/PaymentLogos";
import type { Locale } from "@/lib/i18n";
import { SITE, fullAddress, whatsappUrl } from "@/lib/site";
import { landingContent } from "./content";

export function SiteFooter({ locale }: { locale: Locale }) {
  const c = landingContent[locale];
  const f = c.footer;
  const en = locale === "en";
  const home = en ? "/en" : "/";
  const col = "space-y-2.5 text-sm";
  const link = "text-gray-400 transition-colors hover:text-white";

  // Legal documents are Turkish (they are what is legally binding); English labels only name them.
  const legal: [string, string][] = [
    ["/gizlilik", f.privacy],
    ["/kvkk", f.kvkk],
    ["/acik-riza", en ? "Explicit Consent" : "Açık Rıza Metni"],
    ["/kullanim-kosullari", en ? "Terms of Use" : "Kullanım Koşulları"],
    ["/on-bilgilendirme", en ? "Pre-Contract Information" : "Ön Bilgilendirme Formu"],
    ["/mesafeli-satis", en ? "Distance Sales Agreement" : "Mesafeli Satış Sözleşmesi"],
    ["/iptal-iade", en ? "Cancellation & Refunds" : "İptal ve İade"],
    ["/cerez-politikasi", en ? "Cookie Policy" : "Çerez Politikası"],
  ];

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.3fr]">
          <div>
            <MivvoLogo size={30} textClassName="text-2xl text-white" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{f.tagline}</p>
            <div className="mt-5 space-y-2 text-sm">
              <a href={SITE.phoneHref} className={`flex items-center gap-2 ${link}`}><Phone className="h-4 w-4" />{SITE.phoneDisplay}</a>
              <a href={`mailto:${SITE.email}`} className={`flex items-center gap-2 ${link}`}><Mail className="h-4 w-4" />{SITE.email}</a>
              <a href={whatsappUrl(locale)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${link}`}><WhatsAppIcon className="h-4 w-4 shrink-0" /><span>{en ? "WhatsApp Support" : "WhatsApp Destek"}: <span className="whitespace-nowrap">{SITE.whatsappDisplay}</span></span></a>
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{fullAddress}</p>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-white">{f.product}</p>
            <ul className={col}>
              <li><Link className={link} href={`${home}#ozellikler`}>{c.nav.features}</Link></li>
              <li><Link className={link} href={`${home}#fiyat`}>{c.nav.pricing}</Link></li>
              <li><Link className={link} href="/sepet">{en ? "Buy" : "Satın Al"}</Link></li>
              <li><Link className={link} href="/indir">{f.download}</Link></li>
              <li><Link className={link} href={`${home}#sss`}>{c.nav.faq}</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-white">{f.resources}</p>
            <ul className={col}>
              <li><Link className={link} href="/rehber">{f.guide}</Link></li>
              <li><Link className={link} href="/kurulum">{f.setup}</Link></li>
              <li><a className={link} href={SITE.parentPlayUrl} target="_blank" rel="noopener noreferrer">Google Play</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-white">{f.company}</p>
            <ul className={col}>
              <li><Link className={link} href="/iletisim">{f.contact}</Link></li>
              <li><Link className={link} href="/guvenlik">{en ? "Security" : "Güvenlik"}</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-white">{en ? "Legal" : "Yasal"}</p>
            <ul className={col}>
              {legal.map(([href, label]) => (
                <li key={href}><Link className={link} href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <PaymentLogos className="mt-10" />
        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Mivvo · {SITE.legal.name.replace(/\.$/, "")}. {f.rights}</p>
          <p className="text-gray-500">{f.help}</p>
        </div>
      </div>
    </footer>
  );
}
