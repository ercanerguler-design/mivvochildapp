import type { Locale } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Floating WhatsApp support button; opens a chat with a ready first message. */
export function WhatsAppBubble({ locale = "tr" }: { locale?: Locale }) {
  const label = locale === "en" ? "WhatsApp Support" : "WhatsApp Destek";
  return (
    <a
      href={whatsappUrl(locale)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="group fixed bottom-5 right-5 z-50 inline-flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 text-white shadow-lg shadow-emerald-300/60 transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="hidden text-sm font-bold sm:inline">{label}</span>
    </a>
  );
}
